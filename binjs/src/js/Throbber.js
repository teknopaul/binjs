/**
 * A Throbber like firefox spinning icon when soemthing is going on
 */
 
/**
 * @param progressText the text to be dislpalyed while in progress
 * @param doneText the text to display when finished
 * @constructor
 */
Throbber = function(text) {
	this.glyphs = ['\\', '|', '/', '-'];
	this.pos = 0;
	this.text = text;
	this.len = text.length;
	
	this._isDone = false;
	this._onScreen = false;
}

Throbber.prototype.render = function(until) {
	if (this._isDone) {
		throw new Error("Throbber can not be reused, create a new one");
	}
	
	// loop untill the function returns true
	while ( ! until() ) {
		if ( ! this._onScreen ) {
			this._onScreen = true;
			$.println();
		}
		
		$.print("\r " + this.text + " " + this.glyphs[this.pos++] + "   \r", true);
		if (this.pos > 3) this.pos = 0;
		binjs_flush();
		binjs_sleep(250);
	}
	
	// wipe whats on screen
	$.print("\r      ");
	for (var i = 0 ; i < this.len ; i++) $.print(" ");
	$.println();
	this._isDone = true;
	
	return true;
}

