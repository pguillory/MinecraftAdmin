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

iniconf.parse_file = function(filename) {
    var body = fs.readFileSync(filename, 'utf8')
    return iniconf.parse(body)
}

iniconf.write_file = function(filename, data) {
    var body = iniconf.stringify(data)
    fs.writeFileSync(filename, body, 'utf8')
}
