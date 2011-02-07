var http = require('http')
var sys = require('sys')

function request(method, url, data, callback) {
    if (typeof method !== 'string') {
        throw new Error('method must be a string, got ' + typeof method)
    }
    if (typeof url !== 'string') {
        throw new Error('url must be a string, got ' + typeof url)
    }
    if (typeof callback !== 'function') {
        throw new Error('callback must be a function, got ' + typeof callback)
    }

    var callback = (function(callback) {
        var called = false
        return function() {
            if (called) return
            called = true
            callback.apply(this, arguments)
        }
    })(callback)

    var parsed_url = require('url').parse(url, true)
    if (parsed_url.hostname == undefined) {
        throw new Error('URL has no host: ' + url)
    }
    if (parsed_url.pathname == undefined) {
        parsed_url.pathname = '/'
    }
    if (parsed_url.port == undefined) {
        parsed_url.port = 80
    }

    var server = http.createClient(parsed_url.port, parsed_url.hostname)

    server.on('error', callback)
    
    var headers = {
        Host: parsed_url.hostname,
        Accept: "application/json",
    }
    if (data) {
        headers["Content-Type"] = "application/json"
    }
    
    var request = server.request(method, parsed_url.pathname + (parsed_url.search || ''), headers)

    request.on('error', callback)

    request.socket.on('error', function(err) {
        if (err.errno === process.ECONNREFUSED) {
            sys.puts('ECONNREFUSED: connection refused to '
                    + request.socket.host + ':' + request.socket.port)
        } else {
            sys.puts(err)
        }
    })

    request.write(data)

    var response_body = ''
    request.on('response', function(response) {
        if (response.statusCode === 303) {
            return get(response.headers.location, callback)
        }
        response.on('data', function (chunk) {
            response_body += chunk
        })
        response.on('end', function () {
            try {
                var r = JSON.parse(response_body)
            } catch (e) {
                return callback(new Error('garbled response: ' + response_body), null)
            }
            if (response.statusCode >= 400) {
                return callback(new Error('status ' + response.statusCode), r)
            } else {
                return callback(null, r)
            }
        })
    })
    request.end()
}

exports.get = function(url, callback) {
    request('GET', url, '', callback)
}

exports.put = function(url, data, callback) {
    request('PUT', url, JSON.stringify(data), callback)
}

exports.post = function(url, data, callback) {
    request('POST', url, JSON.stringify(data), callback)
}

exports.del = function(url, callback) {
    request('DELETE', url, '', callback)
}
