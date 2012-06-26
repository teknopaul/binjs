/**
 * Combo is similar in use toa  combo box, it presents a list of options
 * The user can select from.
 */

binjs_import("~lib/Term.js");
 
if (typeof tui === 'undefined') tui = {};

/**
 * Takes an array of String options to select from
 * @constrcutor
 */
tui.ComboInput = function(options) {
	this.options = options;
	this.term = new Term();
	this.selected = 0;
	this.pageSize = 10;
	this.margin = "  ";
	this._width = this.term.getWidth() - 4;
	
}

tui.ComboInput.prototype.select = function() {

	if (this.options.length > this.term.getHeight()) {
		// TODO scrolling should be possible
		throw new Error("Not enough rows in the terminal");
	}
  
	var wasRaw = binjs_TERM_IS_RAW;
	if ( ! binjs_TERM_IS_RAW ) {
		this.term.makeRaw();
	}
	try {
	
		for (var i = 0 ; i < this.options.length ; i++) {
			$.print(this.margin + this._crop(this.options[i]) + "\r");
			if (i < this.options.length - 1) $.print("\n");
		}
		for (var i = 0 ; i < this.options.length -1 ; i++) {
			this.term.cursorUp();
		}
	
		this.term.cursorForward();
		
		while (true) {
			
			var c = this.term.readChar();
			
			if ( c === '\r') break;
			
			if ( this.term.isEscape(c) ) {
			
				var esc = this.term.consumeAnsiEscape();
				
				if ( this.term.isViTwitch(esc) ) break;
				
				if (esc[0] === 27 && esc[1] === 91 ) {
				
					// arrows
					if ( esc[2] === 65 ) { // up
						if ( this.selected > 0 ) {
							this.selected -= 1;
							this.term.cursorUp();
						}
					}
					else if ( esc[2] === 66 ) { // down
						if (this.selected < this.options.length - 1) {
							this.selected += 1;
							this.term.cursorDown();
						}
					}

					// pages
					else if ( esc[2] === 53 && esc[3] === 126 ) { // page up
						for (var i = 0 ; i < this.pageSize && this.selected > 0 ; i++) {
							this.selected -= 1;
							this.term.cursorUp();
						}
					}
					else if ( esc[2] === 54 && esc[3] === 126 ) { // page down
						for (var i = 0 ; i < this.pageSize && this.selected < this.options.length - 1 ; i++) {
							this.selected += 1;
							this.term.cursorDown();
						}
					}
					
					// home
					else if ( esc[2] === 72) { // home
						while ( this.selected > 0 ) {
							this.selected -= 1;
							this.term.cursorUp();
						}
					}
					else if ( esc[2] === 70 ) { // end
						while ( this.selected < this.options.length - 1 ) {
							this.selected += 1;
							this.term.cursorDown();
						}
					}
					// TODO use letter keys to jump (requires sorted list)

				}
			}
		}
	} 
	finally {
		if ( ! wasRaw) {
			this.term.reset();
		}
	}
	for (var i = 0 ; i < this.options.length - this.selected -1 ; i++) {
		this.term.cursorDown();
	}

	
	$.println();
	
	return this.options[this.selected];
	
} 

tui.ComboInput.prototype._crop = function(text) {
	var display = String.toString(text)
	if (display.length < this._width) {
		return text;
	}
	else {
		return display.substring(0, this._width);
	}
}
