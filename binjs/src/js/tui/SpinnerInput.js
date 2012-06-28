/**
 * Spinner displays a list of strings to select on of them using up and down keys.
 */

binjs_import("~lib/Term.js");
 
if (typeof tui === 'undefined') tui = {};

/**
 * Takes n array of String options to select from
 *@constrcutor
 */
tui.SpinnerInput = function(options) {

	this.options = options;
	this.term = new Term();
	this.selected = 0;
	this.pageSize = 10;
	this.margin = "  ";
}

tui.SpinnerInput.prototype.select = function() {

	this.term.cursorOff();
	var wasRaw = binjs_TERM_IS_RAW;
	if ( ! binjs_TERM_IS_RAW ) {
		this.term.makeRaw();
	}
	
	this.term.deleteLine();	
	$.print(this.margin + this.options[this.selected]);
	
	while (true) {
		
		var c = this.term.readChar();
		
		if ( c === '\r') break;
		
		if ( this.term.isEscape(c) ) {
		
			var esc = this.term.consumeAnsiEscape();
			
			if ( this.term.isViTwitch(esc) ) break;
			
			if (esc[0] === 27 && esc[1] === 91 ) {
			
				// arrows
				if ( esc[2] === 65 ) { // up
					this.selected -= 1;
					if ( this.selected < 0 ) this.selected = 0;
				}
				else if ( esc[2] === 66 ) { // down
					this.selected += 1;
					if ( this.selected >= this.options.length ) this.selected = this.options.length - 1;
				}
				
				// pages
				else if ( esc[2] === 53 && esc[3] === 126 ) { // page up
					this.selected -= this.pageSize;
					if ( this.selected < 0 ) this.selected = 0;
				}
				else if ( esc[2] === 54 && esc[3] === 126 ) { // page down
					this.selected += this.pageSize;
					if ( this.selected >= this.options.length ) this.selected = this.options.length - 1;
				}
				
				// home
				else if ( esc[2] === 72) { // home
					this.selected = 0;
				}
				else if ( esc[2] === 70 ) { // end
					this.selected = this.options.length - 1;
				}
				
				// TODO use letter keys to jump (requires sorted list)
				
				this.term.deleteLine();
				$.print("\r" + this.margin + this.options[this.selected]);

			}
		}
	}
	
	this.term.cursorOn();
	if ( ! wasRaw) {
		this.term.reset();
	}
	$.println();
	
	return this.options[this.selected];
	
} 
