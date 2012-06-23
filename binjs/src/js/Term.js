/**
 * Term.js  Here there be dragons.
 *
 * This lib gives you some powerful tools for manipulating what is seen and consumed from the 
 * the terminal. but be careful, you can get in a mess in raw mode.
 *
 * @author teknopaul
 */
/**
 * @constructor
 */
Term = function() {
	this.binjsVersion = "0.1";
	this.bashVersion = "4.2";
	this.javaScriptVersion = binjs_TermV8Version();
};

Term.INVALID_ESC = "Invalid escape sequence";

Term.prototype.getWidth = function() {
	return binjs_TermWidth();
}

Term.prototype.getHeight = function() {
	return binjs_TermHeight();
}

/**
 * Read a UTF-8 character, this method assumes stdin is in UTF-8.
 * If it is not, bytes may be consued from the stream and junk returnd.
 * @throws Error if the UTF-8 sequence is not valid
 */
Term.prototype.readChar = function() {
	return binjs_TermReadChar();
}
/**
 * Write an 8bit byte to stdout,  URTF-8 can be written with just $.print('ö')
 * Any Number arg is written to stdout so you can use varargs
 * Numbers in JS are 32bit signed what is written to output is arg & 0x000000FF
 * i.,e only 0 -255 is significant
 */
Term.prototype.writeByte = function(args) {
	return binjs_TermWriteByte.apply(this, arguments);
}

/**
 * Turn the console into raw mode where each input char is available
 * to read char with out processing, N.B. this means that backspace
 * enter and help get me out of here are disabled.
 * Call reset() to get back to normality.
 * You can do cool stuff with makeRaw like trapping
 * up, down, left, right keypresses.
 */
Term.prototype.makeRaw = function() {
	return binjs_TermMakeRaw();
}

/**
 * Reset the Term back to unraw mode.
 * You must callthis before exit or the Term goes crazy.
 */
Term.prototype.reset = function() {
	return binjs_TermReset();
}

/**
 * Print double height text, works in Konsole not in gnome-terminal
 */
Term.prototype.writeDoubleHeight = function(text) {
	$.println();
	this.writeByte(27, 35, 51);$.println(text);
	this.writeByte(27, 35, 52);$.println(text);
	$.println();
}
// TODO (CSI in UTF-8 is 0xC2, 0x9B) but not no my terminal

Term.prototype.isEscape = function(c) {
	return c.charCodeAt(0) === 27;
}

Term.prototype.isNewLine = function(codes) {
	 return codes[0] === 27 &&
			codes[1] === 79 &&
			codes[2] === 77;
}

/**
 * The vi twitch is a double ESC, peole who use vi
 * exit text entry mode with ESC ESC without thinking
 */
Term.prototype.isViTwitch= function(codes) {
	 return codes[0] === 27 &&
			codes[1] === 27;
}

/**
 * Reads Ansii ESC sequences off the stream, the whole sequence is read
 * if this.isEscape(c) returns true for a char read from the stream the keyboard has sent 
 * an ESC sequnce which we probably want to ignore, but at least we want to read all 
 * the bytes off the input, this method consumes the bytes so that normal char
 * input can continue to be read.
 *
 * @return the ESC sequence as an array of integers, including the presumed ESC27 
 * that was read previously.
 *
 * Warning: dont use this in bjs scripts, this should be C++ code integrated 
 * into binjs_TermReadChar() when that is done all ~libs will need to be migrated.
 *
 * 
 */
Term.prototype.consumeAnsiEscape = function() {
	
	var code =  binjs_TermReadByte();
	
	// non-standard, catch people with a vi twitch, double ESC == exit
	if (code === 27) return [27, 27];
	
	if (code < 64 || code > 95) { // 2 char sequence
		throw new Error( Term.INVALID_ESC );
	}

	if (code === 91) { // CIS codes  ESC[ 32 to 47 terminated by a single 64 to 126 char
		var ret = [27, 91];
		do {
			var b = binjs_TermReadByte();
			ret.push(b);
		} while (b >= 32 && b < 64);
		
		if (b >= 64 && b <= 126) {
			return ret;
		}
		throw new Error();
	}
	
	else if (code === 93 ||  // OSC codes  ESC]  read to BEL or ST  ESC\
			 code === 80 ||  // DCS device control scrint  read to BEL or ST  ESC\
			 code === 94 ||  // ESC^ PM  termianted by ST  ESC\  (we accept BEL too, should we?)
			 code === 95     // ESC_ APC terminated by ST  ESC\  (we accept BEL too, should we?)
			) { 
			
		var ret = [27, code];
		do {
			var b = binjs_TermReadByte();
			ret.push(b);
		} while ( b !== 7 && b !== 27); // BEL or ESC
		if (b === 27) {
			var stt = binjs_TermReadByte();
			if (stt !== 92) throw new Error( Term.INVALID_ESC );
			ret.push(stt); 
		}
		return ret;
	}

	else if (code === 78) {  // SS2 code ESCN read one more char
		return [27, code, binjs_TermReadByte()];
	}
	
	else if (code === 79) {  // SS3 code ESCO (capital O) read one more char
		return [27, code, binjs_TermReadByte()];
	}
	
	else {  // 2 char ESC code
		return [27, code];
	}
	// TODO ESC O ESC _
}

// set the window title in xterm, Konsole does not like this??
Term.prototype.setWindowTitle = function(title) {
	binjs_TermWriteByte(27, 93, 50, 59); // ESC]2;
	$.print(title);
	binjs_TermWriteByte(7); // BEL
	//binjs_TermWriteByte(27, 92); // ESC\ aka ST
	binjs_flush();
}

// dont seem to work in Konsole

Term.prototype.cursorOff = function() {
	binjs_TermWriteByte(27, 91, 63, 50, 53, 108); // ESC[ ?25l
	binjs_flush();
}

Term.prototype.cursorOn = function() {
	binjs_TermWriteByte(27, 91, 63, 50, 53, 104); // ESC[ ?25h
	binjs_flush();
}

Term.prototype.cursorUp = function() {
	binjs_TermWriteByte(27, 91, 65); // ESC[A
	binjs_flush();
}
Term.prototype.cursorDown = function() {
	binjs_TermWriteByte(27, 91, 66); // ESC[B
	binjs_flush();
}
Term.prototype.cursorForward = function() {
	binjs_TermWriteByte(27, 91 , 67); // ESC[C
	binjs_flush();
}
Term.prototype.cursorBack = function() {
	binjs_TermWriteByte(27, 91 , 68); // ESC[D
	binjs_flush();
}
Term.prototype.writeNumber = function(num) {
	var sNum = "" + Math.floor(num);
	for (var i = 0 ; i < sNum.length ; i++) {
		binjs_TermWriteByte(sNum.charAt(i).charCodeAt(0));
	}
}
Term.prototype.cursorPosition = function(row, col) {
	binjs_TermWriteByte(27, 91); // ESC[
	this.writeNumber(row);
	binjs_TermWriteByte(59); // ;
	this.writeNumber(col);
	binjs_TermWriteByte(102); // f
	binjs_flush();
}
