
/**
 * A popup that prints a help buuble off somewhere where the
 * user is not currently entering text
 */
binjs_include("~lib/Term.js");

if (typeof tui === 'undefined') tui = {};

tui.Popup = function(text, textFormat, lineFormat) {
	this.text = text;
	this.textFormat = textFormat || 'blue';
	this.lineFormat = lineFormat || 'darkgrey';
	this.lines = [];
	this.term = new Term();
	this.heightOffset = 2; // how many lines above the current cursor pos to put the hpopup
	this.throwOnError = false;
	
	this._width = 0;
	this._top = -1;
	this._left = -1;
	this._up = true;
}

tui.Popup.prototype.render = function() {
	try {
		this.lines = this.wrap(text);
		this.term.cursorStore();
		this.drawText();
		this.drawBox();
		this.term.cursorRestore();
	}
	catch (err) {
		if (this.throwOnError) throw err;
	}
}

tui.Popup.prototype.drawText = function()  {
	
	// where to draw the popup
	var height = this.lines.length + this.heightOffset;
	if (this.term.getHeight() < height + this.heightOffset) {
		throw new Error("Not enough space to draw popup");
	}

	var pos = this.term.getCursorPosition();
	// normally at the bottomof the screen
	if (pos[0] > height + this.heightOffset) { // draw above the cursor
		this._top = pos[0] - height - this.heightOffset;
	}
	else  { // draw below the cursor
		this._top = pos[0] + this.heightOffset;
		this._up = false;
	}
	this._left = this.term.getWidth() - this._width - 2;

	//$.println("top=" + this._top + ", left = " + this._left);

	$.print(Color.fromModifier(this.textFormat));
	for ( var row = 0 ; row < this.lines.length ; row++) {
		this.term.cursorPosition(this._top + 1 + row, this._left + 1);
		$.print(this.lines[row]);
		for (var pad = 0 ; pad < this._width - this.lines[row].length; pad++) $.print(" ");
	}
	$.print(Color.COLOR_OFF);
}

tui.Popup.prototype.drawBox = function()  {
	
	// ╔╗╚╝║═
	
	$.print(Color.fromModifier(this.lineFormat));
	this.term.cursorPosition(this._top, this._left + 1);
	for ( var col = 0 ; col < this._width ; col++) {
		if (col == 3 && ! this._up) $.print('╩');
		$.print('═');
	}
	this.term.cursorPosition(this._top + this.lines.length + 1, this._left + 1);
	for ( var col = 0 ; col < this._width ; col++) {
		if (col == 3 && this._up) $.print('╦');
		else $.print('═');
	}

	this.term.cursorPosition(this._top, this._left);
	$.print('╔');
	this.term.cursorPosition(this._top, this._left + this._width + 1);
	$.print('╗');
	for ( var row = 1 ; row < this.lines.length + 1 ; row++) {
		this.term.cursorPosition(this._top + row, this._left);
		$.print('║');
		this.term.cursorPosition(this._top + row, this._left + this._width + 1);
		$.print('║');
	}
	this.term.cursorPosition(this._top + this.lines.length + 1, this._left);
	$.print('╚');
	this.term.cursorPosition(this._top + this.lines.length + 1, this._left + this._width + 1);
	$.print('╝');
	$.print(Color.COLOR_OFF);
}

tui.Popup.prototype.wrap = function()  {

	var lines = [];
	var width = 0;
	if (this._width === 0) {
		width = Math.floor(this.term.getWidth() / 3);
		this._width = width;
	}
	else {
		width = this._width;
	}
	
	var text = this.text;
	
	while (true) {
		if ( text.length > width) {
		
			var endpos = width;
			while(text.charAt(endpos) !== ' ') endpos--;
			
			lines.push(text.substring(0, endpos));
			
			if (text.charAt(endpos) === ' ') endpos++;
			text = text.substring(endpos);
		}
		else {
			lines.push(text);
			return lines;
		}
	}
}
