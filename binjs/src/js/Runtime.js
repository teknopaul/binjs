/**
 * Runtime allows the script to interface with the environment in which it is running, modeled on Java's
 * java.lang.Runtime
 */


Runtime = function() {
	throw new Error("Runtime can not be instantiated");
}

Runtime.binjsVersion = binjs_binjsVersion();

Runtime.bashVersion = binjs_bashVersion();

Runtime.javaScriptVersion = binjs_v8Version();

Runtime.isatty = binjs_isatty();
