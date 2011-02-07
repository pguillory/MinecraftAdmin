var sys = require('sys')

function extendError(name, init) {
	function ExtendedError(message){
		var e = new Error(message);
		e.name = name;
		var ee = Object.create(ExtendedError.prototype);
		for(var i in e){
			ee[i] = e[i];
		}
        var args = Array.prototype.slice.call(arguments, 1);
		if (init) init.apply(ee, args)
		return ee;
	}
	ExtendedError.prototype = Object.create(Error.prototype);
	ExtendedError.prototype.name = name;
	return ExtendedError;
};

exports.BadRequest = extendError('BadRequest', function() {
    this.code = 400
})

exports.Unauthorized = extendError('Unauthorized', function() {
    this.code = 401
})

exports.Forbidden = extendError('Forbidden', function() {
    this.code = 403
})

exports.NotFound = extendError('NotFound', function() {
    this.code = 404
})

exports.MethodNotAllowed = extendError('MethodNotAllowed', function() {
    this.code = 405
})

exports.Conflict = extendError('Conflict', function() {
    this.code = 409
})

exports.ServiceUnavailable = extendError('HostUnreachable', function() {
    this.code = 503
})
