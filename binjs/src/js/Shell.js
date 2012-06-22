/**
 * Shell.js  Here there be dragons.
 *
 * This lib gives you some powerful tools for manipulating what is seen and consumed from the 
 * the console, shell, terminal. but be careful, you can get in a mess in raw mode.
 *
 * @author teknopaul
 */
/**
 * @constructor
 */
Shell = function() {
	this.binjsVersion = "0.1";
	this.bashVersion = "4.2";
	this.javaScriptVersion = binjs_shellV8Version();
};

Shell.prototype.getWidth = function() {
	return binjs_shellWidth();
}

Shell.prototype.getHeight = function() {
	return binjs_shellHeight();
}

/**
 * Read a UTF-8 character, this method assumes stdin is in UTF-8.
 * If it is not, bytes may be consued from the stream and junk returnd.
 * @throws Error if the UTF-8 sequence is not valid
 */
Shell.prototype.readChar = function() {
	return binjs_shellReadChar();
}
/**
 * Write an 8bit byte to stdout,  URTF-8 can be written with just $.print('ö')
 * Any Number arg is written to stdout so you can use varargs
 * Numbers in JS are 32bit signed what is written to output is arg & 0x000000FF
 i.,e only 0 -255 is significant
 */
Shell.prototype.writeByte = function(args) {
	return binjs_shellWriteByte.apply(this, arguments);
}

/**
 * Turn the console into raw mode where each input char is available
 * to read char with out processing, N.B. this means that backspace
 * enter and help get me out of here are diabled.
 * Call reset() to get back to mormality.
 * however you can do cool stuff with makeRaw like trapping
 * up, down, left, right keypresses.
 */
Shell.prototype.makeRaw = function() {
	return binjs_shellMakeRaw();
}

/**
 * Reset the shell back to unraw mode.
 * You must callthis before exit or the shell goes crazy.
 */
Shell.prototype.reset = function() {
	return binjs_shellReset();
}


// TODO (CSI in UTF-8 is 0xC2, 0x9B) but not no my terminal

Shell.prototype.isEscape = function(c) {
	return c.charCodeAt(0) === 27;
}

Shell.prototype.consumeAnsiEscape = function(c) {
	var code = c.charCodeAt(0);
	if (code < 64 || code > 95) { // 2 char sequence
		throw new Error("Invalid ESC sequence");
	}
	var cBracket = binjs_shellReadByte(); // should be a [
	if (cBracket === 91) { // CIS codes  ESC[ 32 to 47 terminated by a single 64 to 126 char
		var ret = [];
		ret.push(27);
		ret.push(91); // [
		do {
			var b = binjs_shellReadByte();
			ret.push(b);
		} while (b >= 32 && b < 64);
		
		if (b >= 64 && b <= 126) {
			ret.push(b);
			return ret;
		}
		throw new Error("Invalid escape sequence");
	}
	if (cBracket === 93) { // OSC codes  ESC]  read to BEL
		var ret = [];
		ret.push(27);
		do {
			var b = binjs_shellReadByte();
			ret.push(b);
		}while ( b !== 7); // BEL
	}
	// TODO ESC O ESC _
}

// set the window title in xterm
Shell.prototype.setWindowTitle = function(title) {
	binjs_shellWriteByte(27, 93, 48, 59); // ESC]0;
	$.print(title);
	binjs_shellWriteByte(7); // BEL
	binjs_flush();
}

Shell.prototype.cursorUp = function() {
	binjs_shellWriteByte(27, 91, 65); // ESC[A
	binjs_flush();
}
Shell.prototype.cursorDown = function() {
	binjs_shellWriteByte(27, 91, 66); // ESC[B
	binjs_flush();
}
Shell.prototype.cursorForward = function() {
	binjs_shellWriteByte(27, 91 , 67); // ESC[C
	binjs_flush();
}
Shell.prototype.cursorBack = function() {
	binjs_shellWriteByte(27, 91 , 68); // ESC[D
	binjs_flush();
}
Shell.prototype.writeNumber = function(num) {
	var sNum = "" + Math.floor(num);
	for (var i = 0 ; i < sNum.length ; i++) {
		binjs_shellWriteByte(sNum.charAt(i).charCodeAt(0));
	}
}
Shell.prototype.cursorPosition = function(row, col) {
	binjs_shellWriteByte(27, 91); // ESC[
	this.writeNumber(row);
	binjs_shellWriteByte(59); // ;
	this.writeNumber(col);
	binjs_shellWriteByte(102); // f
	binjs_flush();
}
