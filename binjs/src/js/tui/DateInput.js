
binjs_include("~lib/tui/Input.js");

if (typeof tui === 'undefined') tui = {};

/**
 * An Input that accepts dates strings.  Just checks that the date is inthe format xx.yy.zz with a delim 
 * that is any one of " " - . / or \
 *
 * @constructor
 */
tui.DateInput = function() {
	
	// N.B. the atts are not copied in JS subclassing 
	// so here we must have ALL the atts defined in Input's constructor
	this.text = "";
	this.term = new Term();
	this.returnOnEnter = true;
	this.acceptTabs = false;
	this.acceptNewLines = false;
	this.filter = function(c) {
		return "0123456789.- /\\".indexOf(c) > -1;
	};
	// not useful till we know the date format 
	// this.complete = this._tabCompletion

}
$.inherits(tui.DateInput, tui.Input);

tui.DateInput.prototype.validator = function() {
	var valid = this._isValid();
	if ( ! valid ) this._warn();
	return valid;
}

tui.DateInput.prototype._isValid = function() {
  
	// accept a range of delimiters
	var regex = '-';
	if (this.text.indexOf('/') > -1 ) regex = '/';
	if (this.text.indexOf('\\') > -1 ) regex = '\\';
	if (this.text.indexOf('.') > -1 ) regex = '\.';
	if (this.text.trim().indexOf(' ') > -1 ) regex = ' ';
	
	var parts = this.text.split(regex);
	
	// require year month day, n.b. we dont validate the order
	if (parts.length !== 3) return false;
	var year = parts[0];
	var month = parts[1];
	var day = parts[2];
	if (parseInt(year) === NaN) return false;
	if (parseInt(month) === NaN) return false;
	if (parseInt(day) === NaN) return false;
	
	return true;
	
}

// 30\6\2012
tui.DateInput.prototype.getEuroDate = function() {
	var parts = this.getDateParts();
	return new Date(
		parseInt(parts[2]),
		parseInt(parts[1]) - 1,
		parseInt(parts[0]), 0, 0, 0, 0 );
}

// 6\30\2012
tui.DateInput.prototype.getUSDate = function() {
	var parts = this.getDateParts();
	return new Date(
		parseInt(parts[2]),
		parseInt(parts[0]) - 1,
		parseInt(parts[1]), 0, 0, 0, 0 );
}

// 2010-06-30
tui.DateInput.prototype.getTechDate = function() {
	var parts = this.getDateParts();
	return new Date(
		parseInt(parts[0]),
		parseInt(parts[1]) - 1,
		parseInt(parts[2]), 0, 0, 0, 0 );
}

// just return the 3 components as entered by the user.
tui.DateInput.prototype.getDateParts = function() {
	var regex = '-';
	if (this.text.indexOf('/') > -1 ) regex = '/';
	if (this.text.indexOf('\\') > -1 ) regex = '\\';
	if (this.text.indexOf('.') > -1 ) regex = '\.';
	if (this.text.trim().indexOf(' ') > -1 ) regex = ' ';

	return this.text.split(regex);
	
}

tui.DateInput.prototype._tabCompletion = function(c) {

	var pos = this.term.cursorPosition();
	
	if (this.text.length == 0) {
	  var d = new Date();
	  this.text = d.getDate() + "-" + (d.getMonth() + 1) + "-" + (d.getYear() + 1900);
	  this._rewriteLine();
	}
	
	// TODO could be more clever here if we knew the date format
}

tui.DateInput.prototype._rewriteLine = function(row) {
	this.term.deleteLine();
	$.print("\r" + this.text);
}

tui.DateInput.prototype._positionCursor= function(pos) {
	this.term.cursorPosition(pos[0], this.text.length + 1);

}

tui.DateInput.prototype._warn = function() {

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

}
