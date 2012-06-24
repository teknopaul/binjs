binjs_import("~lib/Term.js")

if (typeof tui === 'undefined') tui = {};

/**
 * Input class to accept text input but with more control over what we accept.
 * @constructor
 */
tui.Input = function(filter) {

	/** the text being enterered */
	this.text = "";
	
	/** Term instance from which we play with the console */
	this.term = new Term();
	
	/** typing Enter finishes input, without you have to double hit ESC, or crash */
	this.returnOnEnter = true;
	
	/** Tabs are swallowed by default, turn this on if you wnat to accept \t in the input */
	this.acceptTabs = false;
	
	/** 
	 * Turn this on if you want Shft + Enter to create a '\n' and continue editing.
	 * delete does not go back over new lines right now, nor do cursors work
	 * If you want a real multi line editor luanch the systems editor.
	 */
	this.acceptNewLines = false;
	
	/** 
	 * Function to filter the input, subclasses will use this for example to only accept numbers 
	 * function is passed the c just been written as its only arg if the function returns true
	 * the character is printed and added to this.text.
	 */
	this.filter = filter || false;
	
	/**
	 * Function to check the final input, if the function returns yes the Input is returned
	 * if the function returns no the user has to delte and try again.
	 */
	this.validator = false;
}

tui.Input.prototype.deleteBack = function() {
	
	if ( this.text.length === 0) return;
	
	this.term.cursorBack();
	this.term.writeByte(32);
	this.term.cursorBack();
	
	this.text = this.text.substring(0, this.text.length - 1);
	
}

tui.Input.prototype.newLine = function() {
	
	this.text += '\n';
	this.term.writeByte(10);
	
}

tui.Input.prototype.readline = function() {
	
	this.text = "";

	this.term.makeRaw();
	
	try {
		while (true) {
			
			var c = this.term.readChar();
			
			if ('\r' == c) {
				if ( this.returnOnEnter ) {
					if ( this.validator && ! this.validator(this.text) )  continue;
					else break;
				}
				else {
					this.text += '\n';
					$.print('\n');
					continue;
				}
			}
			if ('\t' == c) {
				if ( this.acceptTabs ) {
					this.text += c;
					$.print(c);
				}
				continue;
			}
			
			if ( c.charCodeAt(0) == 127 ) {
				this.deleteBack();
			}
			else if (this.term.isEscape(c)) {

				var esc = this.term.consumeAnsiEscape();

				if (this.term.isViTwitch(esc)) break;
				
				if ( this.acceptNewLines && this.term.isNewLine(esc) ) {
					this.newLine();
				}
			}
			else if ( ! this.filter || this.filter(c) ) {
				this.text += c;
				$.print(c);
			}
		}
	}
	catch(err) {
		if (err.message === Term.INVALID_ESC) {
			return null;
		}
		else  throw err;
	}
	 finally {
		this.term.reset();
	}
	
	$.print('\n');
	
	return this.text;
}
