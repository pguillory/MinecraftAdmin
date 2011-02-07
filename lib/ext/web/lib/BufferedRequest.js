var sys = require('sys')
var events = require('events')

module.exports = function(request) {
    var self = this
    
    for (var field in request) {
        this[field] = request[field]
    }

    var paused = false
    var ended = false
    var buffer = []

    self.pause = function() {
        paused = true
        // request.pause()
    }

    self.resume = function() {
        process.nextTick(function() {
            paused = false
            buffer.forEach(function(chunk) {
                self.emit('data', chunk);
            })
            buffer = []
            if (ended) {
                ended = false
                self.emit('end')
            }
        })
        // if (request.readable) {
        //     request.resume()
        // }
    }

    request.addListener('data', function(data) {
        if (paused) {
            buffer.push(data)
        } else {
            self.emit('data', data)
        }
    })
    
    request.addListener('end', function() {
        if (paused) {
            ended = true
        } else {
            self.emit('end')
        }
    })
}

sys.inherits(module.exports, events.EventEmitter)
