
binjs_import("~lib/tui/Input.js");

/**
 * An Input that only accepts digits
 *@constructor
 */
tui.NumberInput = function() {
	
	// N.B. the atts are not copied in JS subclassing 
	// so here we must have ALL the atts defined in Number's constructor
	this.text = "";
	this.shell = new Shell();
	this.returnOnEnter = true;
	this.acceptTabs = false;
	this.acceptNewLines = false;
	this.filter = function(c) {
		return (c >= '0' && c <= '9') 
				|| 
				this.text.length === 0 && (c === '+' || c === '-');
	}
}

$.inherits(tui.NumberInput, tui.Input);
