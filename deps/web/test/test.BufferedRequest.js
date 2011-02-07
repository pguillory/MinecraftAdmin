var sys = require('sys')
var http = require('http')
var djtesto = require('djtesto')
var BufferedRequest = require('../lib/BufferedRequest')

var port = 10000

function requestTest(self, handler) {
    var server = http.createServer(handler)
    server.listen(port)

    var request = http.createClient(port).request('GET', '/', {})

    request.write('asdf')
    request.write('zxcv')

    request.addListener('response', function(response) {
        response.body = ''
        response.addListener('data', function(data) {
            response.body += data
        })
        response.addListener('end', function() {
            self.assert(response.body == 'ok')
            server.close()
            self.pass()
        })
    })
    
    request.end()
}

var tests = {
    baseline: function(self) {
        requestTest(self, function(request, response) {
            response.writeHead(200, {})
            response.end('ok')
        })
    },
    buffered: function(self) {
        requestTest(self, function(request, response) {
            // var request = new BufferedRequest(request)
            request.body = ''
            request.addListener('data', function(data) {
                request.body += ''
            })
            request.addListener('end', function() {
                response.writeHead(200, {})
                response.end('ok')
            })
        })
    },
}

sys.puts('Running tests')

djtesto.runTests(tests, function(err) {
    if (err) {
        sys.puts('Tests failed')
    } else {
        sys.puts('Tests succeeded')
    }
})
