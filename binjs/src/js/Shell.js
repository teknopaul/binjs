
/**
 * @constructor
 */
Shell = function() {

};

Shell.prototype.getWidth = function() {
	return binjs_shellWidth();
}

Shell.prototype.getHeight = function() {
	return binjs_shellHeight();
}
