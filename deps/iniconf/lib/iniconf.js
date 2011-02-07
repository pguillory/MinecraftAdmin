var sys = require('sys')
var fs = require('fs')
var iniconf = exports

iniconf.parse = function(body) {
    var data = {}
    var heading = null
    var lines = body.split('\n')
    lines.forEach(function(line) {
        var match = line.match(/^\s*\[([^\]]+)\]\s*$/)
        if (match) {
            heading = match[1]
            data[heading] = {}
        } else if (heading) {
            var match = line.match(/^\s*(\w+)\s*=\s*(.*)\s*$/)
            if (match) {
                field = match[1]
                value = match[2]
                data[heading][field] = value
            }
        }
    })
    return data
}

iniconf.stringify = function(data) {
    var s = ''
    for (var heading in data) {
        s += '[' + heading + ']\n'
        for (var field in data[heading]) {
            s += field + ' = ' + data[heading][field] + '\n'
        }
        s += '\n'
    }
    return s
}

iniconf.readFile = function(filename, callback) {
    fs.readFile(filename, 'utf8', function(err, body) {
        if (err) return callback(err)
        var data = iniconf.parse(body)
        callback(null, data)
    })
}

iniconf.readFileSync = function(filename) {
    var body = fs.readFileSync(filename, 'utf8')
    var data = iniconf.parse(body)
    return data
}

iniconf.writeFile = function(filename, data, callback) {
    var body = iniconf.stringify(data)
    fs.writeFile(filename, body, 'utf8', callback)
}

iniconf.writeFileSync = function(filename, data) {
    var body = iniconf.stringify(data)
    fs.writeFileSync(filename, body, 'utf8')
}

iniconf.validate = function(data, schema) {
    for (var heading in schema) {
        if (data[heading] === undefined) {
            throw new Error('Missing heading: [' + heading + ']')
        }
        for (var field in schema[heading]) {
            var value = data[heading][field]
            if (value === undefined) {
                throw new Error('Missing field: [' + heading + '] ' + field)
            }
            var type = schema[heading][field]
            switch (type) {
                case 'string':
                    break
                case 'number':
                    var n = parseFloat(value)
                    if (isNaN(n)) {
                        throw new Error('Invalid numeric value: [' + heading + '] ' + field + ' = ' + value)
                    }
                    data[heading][field] = n
                    break
                case 'boolean':
                    switch (value.toLower()) {
                        case 'true':
                        case 'yes':
                        case 'on':
                            data[heading][field] = true
                            break
                        case 'false':
                        case 'no':
                        case 'off':
                            data[heading][field] = false
                            break
                        default:
                            throw new Error('Invalid boolean value: [' + heading + '] ' + field + ' = ' + value)
                    }
                    break
                default:
                    throw new Error('Invalid type: [' + heading + '] ' + field + ': ' + type)
            }
        }
    }
}
