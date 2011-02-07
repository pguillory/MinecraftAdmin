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
}, /Missing heading/)
assert.throws(function() {
    var data = {
        foo: {
        }
    }
    iniconf.validate(data, schema)
}, /Missing field/)
assert.throws(function() {
    var data = {
        foo: {
            bar: 'asdf'
        }
    }
    iniconf.validate(data, schema)
}, /Invalid numeric value/)
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
}, /Invalid type/)

var schema = {
    foo: {
        bar: 'number:123'
    }
}
assert.doesNotThrow(function() {
    var data = {
        foo: {
        }
    }
    iniconf.validate(data, schema)
})

var schema = {
    foo: {
        bar: 'string:asdf'
    }
}
var data = {
    foo: {
    }
}
assert.doesNotThrow(function() {
    iniconf.validate(data, schema)
})
assert.strictEqual(data.foo.bar, 'asdf')

console.log('OK')
