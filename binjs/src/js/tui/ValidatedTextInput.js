binjs_include("~lib/tui/Input.js");
binjs_include("~lib/Term.js");

tui.ValidatedTextInput = function(callback) {

	// N.B. the atts are not copied in JS subclassing 
	// so here we must have ALL the atts defined in Input's constructor
	this.text = "";
	this.term = new Term();
	this.returnOnEnter = true;
	this.acceptTabs = false;
	this.acceptNewLines = false;
	this.filter = false;
	this.callback = callback
	
}
$.inherits(tui.ValidatedTextInput, tui.Input);

tui.ValidatedTextInput.prototype.validator = function() {
	if ( ! this.callback() ) {
		$.print("\r" + Color.RED + this.text + Color.COLOR_OFF);
		this.term.flush();
		$.sleep(100);
		$.print("\r" + this.text);
		this.term.flush();
		$.sleep(100);
		$.print("\r" + Color.RED + this.text + Color.COLOR_OFF);
		this.term.flush();
		$.sleep(100);
		$.print("\r" + this.text);
		this.term.flush();

		return false;
	}
	return true;
}
