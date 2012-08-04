/**
 * Runtime allows the script to interface with the environment in which it is running.
 */

/**
 * @constructor
 */
var Runtime = function() {
	this.binjsVersion = binjs_binjsVersion();
	this.bashVersion = binjs_bashVersion();
	this.javaScriptVersion = binjs_v8Version();
	this.isatty = binjs_isatty();
}

Runtime.prototype.exec = function(cmd) {
	binjs_exec(cmd);
}

// WARNING the exit routines are not well defined yet.

Runtime.prototype.exit = function(status) {
	binjs_exit(status);
}

Runtime.prototype.halt = function(status) {
	binjs_exit(status);
}

Runtime.prototype.halt = function(status) {
	binjs_exit(status);
}

Runtime.prototype.load = function(file) {
	binjs_include(file);
}

Runtime.prototype.loadLibrary = function(file) {
	binjs_include("~lib/" + file);
}
Runtime.prototype.getenv = function(propertyName) {
	if (propertyName) {
		return $.env[propertyName];
	}
	return $.env;
}

