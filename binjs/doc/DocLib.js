
DocLib = function() {

}

/**
 * Return the first bit of markdown text, up to the first blank line
 * after the # header row.
 */
DocLib.prototype.getIntro = function(filename) {
	var filedata = new File(filename).read();
	var lines = filedata.split('\n');
	for ( var i = 0 ; i < lines.length ; i++ ) {
		if ( lines[i].indexOf("# ") === 0 ) {
			return  this._intro(lines, i);
		}
	}
}

DocLib.prototype._intro = function(lines, start) {
	var intro = "";
	for ( var i = start + 1 ; i < lines.length ; i++ ) {
		if ( lines[i].length === 0 && intro.length !== 0) {
			return intro;
		}
		else {
			intro +=  lines[i] + " ";
		}
	}
}
