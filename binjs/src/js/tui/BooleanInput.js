
binjs_import("~lib/tui/Input.js");

/**
 * An Input that only accepts y or n
 *@constructor
 */
tui.BooleanInput = function() {
	
	// N.B. the atts are not copied in JS subclassing 
	// so here we must have ALL the atts defined in Input's constructor
	this.text = "";
	this.term = new Term();
	this.returnOnEnter = true;
	this.acceptTabs = false;
	this.acceptNewLines = false;
	this.filter = function(c) {
		return (c === 'Y' || c === 'y' || c === 'N' || c === 'n');
	}
}

$.inherits(tui.BooleanInput, tui.Input);

tui.BooleanInput.prototype.ok = function() {
	var ok = this.readline();
	return ok.charAt(0) === 'Y' || ok.charAt(0) === 'y';
}
