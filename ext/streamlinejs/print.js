var sys = require("sys");
var path = require("path");
var fs = require("fs");

var Streamline = require('./.');

if (process.argv.length < 3) {
    console.log('Syntax:')
    console.log('node print.js FILE.js')
    process.exit(1)
}

var filename = path.join(process.cwd(), process.argv[2]);
var input = fs.readFileSync(filename);
var output = Streamline.transform(input);
console.log(output);
