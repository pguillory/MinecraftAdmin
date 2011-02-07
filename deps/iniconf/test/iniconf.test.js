var sys = require('sys')
var iniconf = require('..')

var data = iniconf.parse_file(__dirname + '/test.ini')

sys.puts(sys.inspect(data))

data.heading2.bool = true
data.heading2.int = 10
data.heading2.float = 10.5

iniconf.write_file(__dirname + '/test2.ini', data)
