var sys = require('sys')
var http = require('http')
var httperror = require('./httperror')
var BufferedRequest = require('./BufferedRequest')

var web = exports

web.createServer = function(handler) {
    handler = web.handler(handler)

    return http.createServer(function(request, response) {
        var request = new BufferedRequest(request)
        request.pause()
        handler(request, response, function(err) {
            if (err) {
                //sys.puts(err.stack || 'no error stack')
                response.writeHead(err.code || 500, {
                    'connection': 'close',
                })
                response.end(err.stack || 'Error')
            } else {
                response.writeHead(500, {
                    'connection': 'close',
                })
                response.end('Unhandled request.')
            }
        })
    })
}

web.handler = function(map) {
    if (typeof map === 'object') {
        for (var i in map) {
            map[i] = web.handler(map[i])
        }
        if (map.constructor === Array) {
            return web.stack(map)
        } else {
            return web.route(map)
        }
    }

    return map
}

web.stack = function(layers) {
    return function(request, response, callback) {
        var current
        var queue = layers.slice(0)

        current = function(err, output) {
            if (err) return callback(err)

            if (output !== undefined) {
                response.writeHead(200, {
                    'content-type': 'application/json',
                    'connection': 'close',
                })
                response.write(JSON.stringify(output))
                response.end('\n')
                return
            }

            var next = queue.shift()
            if (next) {
                next(request, response, current)
            } else {
                return callback()
            }
        }

        current()
    }
}

web.log = function(stream) {
    return function(request, response, callback) {
        var url = request.url
        var length = 0
        var request_timestamp = timestamp()
        var start_time = new Date().valueOf()

        response.write = (function(callback) {
            return function(data, encoding) {
                if (typeof data !== 'string') {
                    throw new Error('data is a ' + typeof data)
                }
                callback.call(response, data, encoding)

                length += data.length
            }
        })(response.write)

        response.end = (function(callback) {
            return function(data, encoding) {
                callback.call(response, data, encoding)

                if (data) {
                    length += data.length
                }

                var date = request_timestamp
                var host = request.socket.remoteAddress
                var method = request.method
                var httpVersion = 'HTTP/' + request.httpVersionMajor + '.' + request.httpVersionMinor
                var status = response.status
                var runtime = new Date().valueOf() - start_time

                sys.puts([
                    host,
                    '-',
                    '-',
                    '[' + date + ']',
                    '"' + method + ' ' + url + ' ' + httpVersion + '"',
                    status,
                    length,
                    runtime
                ].join(' '))
            }
        })(response.end)
        
        callback()
    }

    function timestamp() {
        var d = new Date()

        return d.getUTCFullYear() + '-'
                + (d.getUTCMonth() + 1) + '-'
                + ('0' + d.getUTCDate()).slice(-2) + 'T'
                + ('0' + d.getUTCHours()).slice(-2) + ':'
                + ('0' + d.getUTCMinutes()).slice(-2) + ':'
                + ('0' + d.getUTCSeconds()).slice(-2) + 'Z'
    }
}

web.accept = function(map) {
    return function(request, response, callback) {
        var acceptHeader = request.headers.accept || '*/*'

        for (var pattern in map) {
            if (acceptHeader.indexOf(pattern) != -1) {
                return map[pattern](request, response, callback)
            }
        }
        
        response.writeHead(406, {
            connection: 'close',
        })
        response.end('406 Not Acceptable')
    }
}

web.gzip = function() {
    var compress = require('compress')

    return function(request, response, callback) {
        var gzip = new compress.Gzip
        gzip.init()

        response.writeHead = (function(writeHead) {
            return function(code, headers) {
                headers['content-encoding'] = 'gzip'
                writeHead.call(response, code, headers)
            }
        })(response.writeHead)

        response.end = (function(write, end) {
            return function(data) {
                if (data) {
                    write.call(response, gzip.deflate(data, 'binary'))
                }
                end.call(response, gzip.end())
            }
        })(response.write, response.end)

        response.write = (function(write) {
            return function(data) {
                write.call(response, gzip.deflate(data, 'binary'))
            }
        })(response.write)

        callback()
    }
}

web.cacheControl = function(maxage) {
    return function(request, response, callback) {
        response.writeHead = (function(callback) {
            return function(code, headers) {
                headers['cache-control'] = 'max-age=' + maxage + ', must-revalidate'
                callback.call(response, code, headers)
            }
        })(response.writeHead)

        callback()
    }
}

web.static = function(dir) {
    var pathlib = require('path')
    var fs = require('fs')
    var mime = require('./deps/node-mime')

    return function(request, response, callback) {
        var filename = dir + request.url

        if (filename[filename.length - 1] === '/') {
            filename += 'index.html'
        }

        var error404 = function() {
            response.writeHead(404, {
                connection: 'close',
            })
            response.end('404 Not Found')
            return
        }
        
        pathlib.exists(filename, function(exists) {
            if (!exists) return callback()
            
            fs.stat(filename, function(err, stats) {
                if (err) return callback(err)

                if (!stats.isFile()) return callback()

                var readstream = fs.createReadStream(filename, {
                    encoding: 'binary',
                })

                response.writeHead(200, {
                    'content-type': mime.lookup(filename),
                    'connection': 'close',
                })
                readstream.on('data', function(data) {
                    response.write(data, 'binary')
                })
                readstream.on('end', function() {
                    response.end()
                })
                readstream.on('error', callback)
            })
        })
    }
}

web.file = function(filename) {
    var pathlib = require('path')
    var fs = require('fs')
    var mime = require('./deps/node-mime')

    return function(request, response, callback) {
        var readstream = fs.createReadStream(filename, {
            encoding: 'binary',
        })

        response.writeHead(200, {
            'content-type': mime.lookup(filename),
            'connection': 'close',
        })
        readstream.on('data', function(data) {
            response.write(data, 'binary')
        })
        readstream.on('end', function() {
            response.end()
        })
        readstream.on('error', callback)
    }
}

web.esi = function(backend) {
    return function(request, response, callback) {
        var body = ''
        var bypass = true

        response.writeHead = (function(writeHead) {
            return function(code, headers) {
                if (!headers) headers = {}
                if (headers['content-type']) {
                    switch (headers['content-type']) {
                        case 'text/html':
                        case 'text/html; charset=utf-8':
                            bypass = false
                            break
                    }
                }
                writeHead.call(response, code, headers)
            }
        })(response.writeHead)

        response.end = (function(end) {
            return function(data) {
                if (bypass) {
                    end.call(response, data)
                } else {
                    if (data !== undefined) {
                        body += data
                    }

                    replace_esi_tags(body, function(err, body) {
                        if (err) return callback(err)
                        end.call(response, body)
                    })
                }
            }
        })(response.end)

        response.write = (function(write) {
            return function(data) {
                if (bypass) {
                    write.call(response, data)
                } else {
                    body += data
                }
            }
        })(response.write)

        callback()
    }
    
    function replace_esi_tags(body, callback) {
        var regex = /<esi +src="([^"]*)" *\/>/
        var match = body.match(regex)
        if (match) {
            var tag = match[0]
            var src = match[1]
            get_partial(src, function(err, partial) {
                if (err) return callback(err)
                body = body.replace(tag, partial)
                replace_esi_tags(body, callback)
            })
        } else {
            callback(null, body)
        }
    }
    
    function get_partial(src, callback) {
        var client = http.createClient(backend.port, backend.hostname || 'localhost')

        client.on('error', function(err) {
            return callback(err)
        })

        var request = client.request('GET', src, {})

        request.on('response', function(response) {
            var body = ''
            response.on('data', function(chunk) {
                body += chunk
            })
            response.on('end', function() {
                callback(null, body)
            })
            response.on('error', function(err) {
                callback(err)
            })
        })

        request.on('error', function(err) {
            callback(err)
        })

        //request.write()
        request.end()
    }
}

web.proxy = function(port, hostname) {
    hostname = hostname || 'localhost'

    return function(request, response, callback) {
        var backend = http.createClient(port, hostname)

        backend.on('error', function(err) {
            return callback(new httperror.ServiceUnavailable('Backend unreachable: ' + hostname + ':' + port))
        })

        var backend_request = backend.request(request.method, request.url, request.headers)

        backend_request.on('response', function(backend_response) {
            var chunks = []
            var length = 0
            backend_response.on('data', function(chunk) {
                chunks.push(chunk)
                length += chunk.length
            })
            backend_response.on('end', function() {
                var headers = backend_response.headers
                delete headers['transfer-encoding']
                headers['content-length'] = length
                headers['connection'] = 'close'
                response.writeHead(backend_response.statusCode, headers)

                chunks.forEach(function(chunk) {
                    response.write(chunk)
                })
                response.end()
            })
        })
        request.on('data', function(chunk) {
            backend_request.write(chunk)
        })
        request.on('end', function() {
            backend_request.end()
        })
        request.resume()
    }
}

web.hostname = function(map) {
    return function(request, response, callback) {
        for (var hostname in map) {
            if (hostname === '*' || hostname === request.headers.host) {
                return map[hostname](request, response, callback)
            }
        }

        callback()
    }
}

web.return_error = function(err) {
    return function(request, response, callback) {
        callback(err)
    }
}

web.route = function(table) {
    var urllib = require('url')

    //var log = console.log
    var log = function(){}

    return function(request, response, callback) {
        var url = request.url
        log('url: ' + url)
        // log('table: ' + sys.inspect(table))

        if (url[0] !== '/') {
            log('invalid url: ' + url)
            return callback()
        }

        var parts = url.split('/')
        log('parts: ' + sys.inspect(parts))
        var match_path = '/' + parts[1]

        for (var path in table) {
            if (path[0] === ':') {
                log('variable ' + path)
                if (request.query === undefined) request.query = {}
                request.query[path.slice(1)] = parts[1]
                //request.url = url.slice(path.length)
                request.url = '/' + parts.slice(2).join('/')
            } else if (path[0] === '/') {
                log('checking path ' + path)
                if (path.length > 1 && path[path.length - 1] === '/') {
                    log('trailing slash required')
                    if (path !== match_path + '/') {
                        log('no match')
                        continue
                    }
                    if (parts.length === 2) {
                        log('trailing slash missing')
                        continue
                    }
                } else {
                    if (path !== match_path) {
                        log('no match')
                        continue
                    }
                }
                request.url = '/' + parts.slice(2).join('/')
                log('url = ' + request.url)
            } else {
                log('checking method ' + path)
                if (path !== request.method) {
                    log('no match')
                    continue
                }
                log('match')
            }

            table[path](request, response, function(err, output) {
                if (err) return callback(err)

                if (output !== undefined) {
                    send_output(request, response, output)
                    return
                }

                request.url = url
                callback()
            })

            return
        }
        
        log('no route found for url ' + url)

        return callback()
    }
}

function send_output(request, response, output) {
    var accept = request.headers.accept || 'application/json'

    if (accept.match(/\bapplication\/json\b/)) {
        return send_json_output(response, output)
    }
    else if (accept.match(/\btext\/html\b/)) {
        return send_html_output(response, output)
    }
    else if (accept.match(/\btext\/xml\b/)) {
        return send_xml_output(response, output)
    }
    else {
        throw new Error('Unrecognized accept type')
    }
}

function send_json_output(response, output) {
    var s = JSON.stringify(output) + '\n'

    response.writeHead(200, {
        'content-type': 'application/json',
        'content-length': s.length,
        'connection': 'close',
    })
    response.end(s)
}

function send_html_output(response, output) {
    var s = ''
    s += '<html><head>\n'
    s += '<style>\n'
    s += 'body { font-family: monospace }\n'
    s += 'ul { margin: 0; padding: 0 0 0 2em; list-style: none; border-left: 1px dashed #ddd }\n'
    s += 'p { display: inline; color: green }\n'
    s += '</style>\n'
    s += '</head><body>\n'
    s += json2html(output)
    s += '</body></html>\n'

    response.writeHead(200, {
        'content-type': 'text/html',
        'content-length': s.length,
        'connection': 'close',
    })
    response.end(s)
}

function json2html(x) {
    if (x === null) {
        return '<i>null</i>'
    } else if (typeof x === 'object') {
        if (x.constructor === Array) {
            var s = ''
            s += '[<ul>\n'
            for (var i in x) {
                s += '<li>' + json2html(x[i]) + '</li>\n'
            }
            s += '</ul>]\n'
            return s
        } else {
            var s = ''
            s += '{<ul>\n'
            for (var i in x) {
                s += '<li><b>' + xml_encode(i) + '</b>: ' + json2html(x[i]) + '</li>\n'
            }
            s += '</ul>}\n'
            return s
        }
    } else if (typeof x === 'string') {
        var url = require('url').parse(x)
        if (url.protocol && url.hostname/* && url.pathname*/) {
            return '<a href="' + xml_encode(x) + '">' + xml_encode(x) + '</a>'
        } else {
            return '<p>"' + xml_encode(x) + '"</p>'
        }
    } else if (typeof x === 'number') {
        return x
    } else if (typeof x === 'boolean') {
        return x
    } else {
        return '<i>' + typeof x + '</i>'
    }
}

function xml_encode(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function send_xml_output(response, output) {
    var s = json2xml(output)

    response.writeHead(200, {
        'content-type': 'text/xml',
        'content-length': s.length,
        'connection': 'close',
    })
    response.end(s)
}

function json2xml(x) {
    if (x === null) {
        return '<scalar type="null"/>'
    } else if (typeof x === 'object') {
        if (x.constructor === Array) {
            var s = ''
            s += '<array>\n'
            for (var i in x) {
                s += '<element>' + json2xml(x[i]) + '</element>\n'
            }
            s += '</array>\n'
            return s
        } else {
            var s = ''
            s += '<object>\n'
            for (var i in x) {
                s += '<field name="' + xml_encode(i) + '">' + json2xml(x[i]) + '</field>\n'
            }
            s += '</object>\n'
            return s
        }
    } else if (typeof x === 'string') {
        return '<scalar type="string">' + xml_encode(x) + '</scalar>'
    } else if (typeof x === 'number') {
        return '<scalar type="number">' + x + '</scalar>'
    } else if (typeof x === 'boolean') {
        return '<scalar type="boolean">' + x + '</scalar>'
    } else {
        return '<scalar type="' + typeof x + '"/>'
    }
}

web.method = function(table) {
    return function(request, response, callback) {
        for (var method in table) {
            if (request.method === method) {
                return table[method](request, response, callback)
            }
        }
        
        callback(new httperror.MethodNotAllowed('Method not allowed'))
    }
}

/*
web.json = function(func) {
    return function(request, response, callback) {
        var callback = function(err, output) {
            if (err) {
                response.writeHead(err.code || 500, {
                    'content-type': 'text/plain',
                    'connection': 'close',
                })
                response.end(err.message)
            } else {
                response.returnData(output)
            }
        }

        var body = ''

        request.on('data', function(data) {
            body += data
        })
        
        request.on('end', function() {
            parseInput(request, body, function(err, input) {
                if (err) return callback(err)

                func(request, input, function(err, output) {
                    if (err) return callback(err)

                    callback(null, output)
                })
            })
        })

        request.resume()
    }
}
*/

/*
web.haml = function(func) {
    var haml = require('json-haml')

    return function(request, response, callback) {
        var body = ''

        request.on('data', function(data) {
            body += data
        })
        
        request.on('end', function() {
            parseInput(request, body, function(err, input) {
                if (err) return callback(err)

                func(request, input, function(err, output) {
                    if (err) return callback(err)

                    response.writeHead(200, {
                        'content-type': 'text/html; charset=utf-8',
                        'connection': 'close',
                    })
                    response.end(haml.stringify(output))
                })
            })
        })

        request.resume()
    }
}
*/

/*
function parseInput(request, body, callback) {
    var querystring = require('querystring')

    var input = null

    if (body.length > 0) {
        if (request.headers['content-type']) {
            var content_type = request.headers['content-type'].split(';')[0]
        } else {
            var content_type = null
        }
        switch (content_type) {
            case 'application/json':
                try {
                    input = JSON.parse(body)
                } catch (err) {
                    return callback(err)
                }
                break

            case 'application/x-www-form-urlencoded':
                try {
                    input = querystring.parse(body)
                } catch (err) {
                    return callback(err)
                }
                break
        }
    }
    
    callback(null, input)
}
*/

web.return404 = function() {
    return function(request, response, callback) {
        response.writeHead(404, {
            'content-type': 'text/html; charset=utf-8',
            'connection': 'close',
        })
        response.end('<h1>404 Not Found</h1>')
    }
}

web.dynamic = function(dir, get_self) {
    var fs = require('fs')
    var path = require('path')
    var urllib = require('url')

    var templates = {}

    function scan(dir, base) {
        fs.readdirSync(path.join(dir, base)).forEach(function(filename) {
            var filepath = path.join(dir, base, filename)
            if (filename[0] === '.') return
            var stat = fs.statSync(filepath)
            if (stat.isDirectory()) {
                scan(dir, path.join(base, filename))
            } else if (stat.isFile()) {
                var ext = path.extname(filename)
                if (ext !== '.js') return
                templates['/' + path.join(base, path.basename(filename, ext))] = require(filepath)
            }
        })
    }

    scan(dir, '')

    return function(request, response, callback) {
        var name = urllib.parse(request.url).pathname
        var handler = templates[name]
        if (!handler) {
            handler = templates[path.join(name, 'index')]
        }
        if (handler) {
            handler.call(get_self(request, response), request, response, function(err) {
                if (err) return callback(err)
                return callback(new Error('Handler returned'))
            })
        } else {
            callback()
        }
    }
}

/*
web.receive = function(name) {
    var querystring = require('querystring')

    return function(request, response, callback) {
        var body = ''

        request.on('data', function(data) {
            body += data
        })

        request.on('end', function() {
            if (body.length === 0) {
                request[name] = {}
                return callback()
            }

            switch (request.headers['content-type']) {
                case 'application/x-www-form-urlencoded':
                    try {
                        var fields = querystring.parse(body)
                    } catch (err) {
                        return callback(new httperror.BadRequest('Error parsing JSON'))
                    }
                    break

                case 'application/json':
                case 'application/json; charset=UTF-8':
                    try {
                        var fields = JSON.parse(body)
                    } catch (err) {
                        return callback(new httperror.BadRequest('Error parsing JSON'))
                    }
                    break
                default:
                    return callback(new httperror.BadRequest('Unrecognized Content-Type'))
            }

            request[name] = fields
            callback()
        })

        request.resume()
    }
}
*/

web.timeout = function(seconds) {
    return function(request, response, callback) {
        var timeout = setTimeout(function() {
            timeout = null
            callback(new Error('The request timed out after ' + seconds + ' seconds'))
        }, seconds * 1000)

        var writeHead = response.writeHead
        response.writeHead = function(code, headers) {
            if (timeout) {
                clearTimeout(timeout)
            }
            writeHead.call(response, code, headers)
        }
        
        callback()
    }
}

web.redirect_host = function(hostname) {
    return function(request, response, callback) {
        response.writeHead(301, {
            'location': '//' + hostname + request.url,
            'connection': 'close',
        })
        response.end()
    }
}

web.force_https = function() {
    return function(request, response, callback) {
        if (request.headers['x-forwarded-proto'] !== 'https') {
            response.writeHead(301, {
                connection: 'close',
                location: 'https://' + request.headers.host + request.url
            })
            response.end()
        } else {
            callback()
        }
    }
}

/*
web.apiHandling = function() {
    return function(request, response, callback) {
        response.returnData = function(data) {
            response.writeHead(200, {
                'content-type': 'application/json',
                'connection': 'close',
            })
            response.write(JSON.stringify(data))
            response.end('\n')
        }
        callback()
    }
}
*/

web.receive_request_body = function() {
    return function(request, response, callback) {
        request.body = ''

        request.on('data', function(data) {
            request.body += data
        })

        request.on('end', function() {
            callback()
        })

        request.resume()
    }
}

web.parse_request_body = function() {
    var querystring = require('querystring')

    return function(request, response, callback) {
        if (request.body.length === 0) {
            return callback()
        }
    
        var content_type = request.headers['content-type'].split(';')[0]

        switch (content_type) {
            case 'application/x-www-form-urlencoded':
                try {
                    request.data = querystring.parse(request.body)
                } catch (err) {
                    return callback(new httperror.BadRequest('Error parsing form'))
                }
                break

            case 'application/json':
                try {
                    request.data = JSON.parse(request.body)
                } catch (err) {
                    return callback(new httperror.BadRequest('Error parsing JSON'))
                }
                break
        }

        return callback()
    }
}

web.parse_query = function() {
    var urllib = require('url')
    var querystring = require('querystring')

    return function(request, response, callback) {
        var urlparts = urllib.parse(request.url)
        request.pathname = urlparts.pathname
        var query

        if (urlparts.query) {
            try {
                request.query = querystringlib.parse(urlparts.query)
            } catch (err) {
                return callback(new httperror.BadRequest('Failed to decode query string'))
            }
        } else {
            request.query = {}
        }

        return callback()
    }
}
