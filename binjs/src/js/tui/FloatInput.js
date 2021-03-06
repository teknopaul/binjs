
binjs_include("~lib/tui/Input.js");

/**
 * An Input that only accepts floating point numbers
 * @constructor
 */
tui.FloatInput = function() {
	
	// N.B. the atts are not copied in JS subclassing 
	// so here we must have ALL the atts defined in Input's constructor
	this.text = "";
	this.term = new Term();
	this.returnOnEnter = true;
	this.acceptTabs = false;
	this.acceptNewLines = false;
	this.filter = function(c) {
		return (c >= '0' && c <= '9') 
				|| 
				( this.text.length === 0 && (c === '+' || c === '-') )
				||
				c === '.'
	}
}

$.inherits(tui.FloatInput, tui.Input);
