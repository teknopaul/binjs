
binjs_include("~lib/tui/Input.js");

/**
 * An Input that only accepts time in 24 hour format 00:00.
 *
 * TODO strict mode currently 99:99 is permitted
 *
 * @constructor
 */
tui.TimeInput = function() {
	
	// N.B. the atts are not copied in JS subclassing 
	// so here we must have ALL the atts defined in Input's constructor
	this.text = "";
	this.term = new Term();
	this.returnOnEnter = true;
	this.acceptTabs = false;
	this.acceptNewLines = false;
	this.filter = function(c) {
		var ok = (c >= '0' && c <= '9');
		if ( ok && this.text.length == 1) {
			$.print(c + ':');
			this.text += (c + ':');
			return false;
		}
		if ( c == ':' && this.text.length == 0) {
			$.print('00:');
			this.text += '00:';
			return false;
		} 
		if ( c == ':' && this.text.length == 1) {
			$.print('0:');
			this.text += '0:'
			return false;
		}
		if (this.text.length > 4) return false;
		return ok;
	}
}

$.inherits(tui.TimeInput, tui.Input);
