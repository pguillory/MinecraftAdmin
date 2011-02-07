var iniconf = require('..')
var assert = require('assert')
var util = require('util')

var data = iniconf.readFileSync(__dirname + '/test.ini')

data.heading2.bool = true
data.heading2.int = 10
data.heading2.float = 10.5

iniconf.writeFileSync(__dirname + '/test2.ini', data)

var schema = {
    foo: {
        bar: 'number'
    }
}
assert.throws(function() {
    var data = {
    }
    iniconf.validate(data, schema)
})
assert.throws(function() {
    var data = {
        foo: {
        }
    }
    iniconf.validate(data, schema)
})
assert.throws(function() {
    var data = {
        foo: {
            bar: 'asdf'
        }
    }
    iniconf.validate(data, schema)
})
assert.doesNotThrow(function() {
    var data = {
        foo: {
            bar: '123'
        }
    }
    iniconf.validate(data, schema)
})

var schema = {
    foo: {
        bar: 'string'
    }
}
assert.doesNotThrow(function() {
    var data = {
        foo: {
            bar: 'asdf'
        }
    }
    iniconf.validate(data, schema)
})

var schema = {
    foo: {
        bar: 'asdf'
    }
}
assert.throws(function() {
    var data = {
        foo: {
            bar: 'asdf'
        }
    }
    iniconf.validate(data, schema)
})

console.log('OK')
