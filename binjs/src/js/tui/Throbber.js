/**
 * A Throbber like firefox's spinning icon when something is going on
 */

if (typeof tui == 'undefined') tui = {};

/**
 * @param text the text to be displayed while in progress
 * @constructor
 */
tui.Throbber = function(text, unicode) {
	this.unicodeGlyphs = ['·',  '✶', '❆', '✺'];
	this.asciiGlyphs =   ['\\', '|', '/', '-'];
	this.glyphs = unicode ? this.unicodeGlyphs : this.asciiGlyphs;
	this.pos = 0;
	this.text = text;
	this.len = text.length;
	
	this._isDone = false;
	this._onScreen = false;
}

tui.Throbber.prototype.render = function(until) {
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

