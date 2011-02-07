var Streamline = require('./.');

var path = require("path");

if (process.argv.length < 3) {
    console.log('Syntax:')
    console.log('node run.js FILE.js')
    process.exit(1)
}

require(path.join(process.cwd(), process.argv[2]));
