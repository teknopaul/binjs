/**
 * Term.js  Here there be dragons.
 *
 * This lib gives you some powerful tools for manipulating what is seen and consumed from the 
 * the terminal. but be careful, you can get in a mess in raw mode.
 *
 * @author teknopaul
 */

// This needs to be global since there may be multiple instances of Term
var binjs_TERM_IS_RAW = false;
/**
 * @constructor
 */
Term = function() {
	this.binjsVersion = "0.1";
	this.bashVersion = "4.2";
	this.javaScriptVersion = binjs_termV8Version();
	
};

Term.INVALID_ESC = "Invalid escape sequence";

Term.prototype.getWidth = function() {
	return binjs_termWidth();
}

Term.prototype.getHeight = function() {
	return binjs_termHeight();
}

/**
 * Read a UTF-8 character, this method assumes stdin is in UTF-8.
 * If it is not, bytes may be consued from the stream and junk returnd.
 * @throws Error if the UTF-8 sequence is not valid
 */
Term.prototype.readChar = function() {
	return binjs_termReadChar();
}
/**
 * Write an 8bit byte to stdout,  UTF-8 can be written with just $.print('ö')
 * Any Number arg is written to stdout so you can use varargs
 * Numbers in JS are 32bit signed what is written to output is arg & 0x000000FF
 * i.,e only 0 -255 is significant
 */
Term.prototype.writeByte = function(args) {
	return binjs_termWriteByte.apply(this, arguments);
}

Term.prototype.flush = function() {
	binjs_flush();
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
	binjs_TERM_IS_RAW = true;
	return binjs_termMakeRaw();
}

/**
 * Reset the Term back to unraw mode.
 * You must call this before exit or the Term goes crazy.
 */
Term.prototype.reset = function() {
	binjs_TERM_IS_RAW = false;
	return binjs_termReset();
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
/**
 * Delete current line,  ESC[2K
 */
Term.prototype.deleteLine = function(text) {
	this.writeByte(27, 91, 50, 75);
}

Term.prototype.isEscape = function(c) {
	return c.charCodeAt(0) === 27;
}

Term.prototype.isNewLine = function(codes) {
	 return codes[0] === 27 &&
			codes[1] === 79 &&
			codes[2] === 77;
}

/**
 * The vi twitch is a double ESC, people who use vi
 * exit text entry mode with ESC ESC without thinking
 */
Term.prototype.isViTwitch= function(codes) {
	 return codes[0] === 27 &&
			codes[1] === 27;
}

// TODO (CSI in UTF-8 is 0xC2, 0x9B) but not on my terminal

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
	
	var code =  binjs_termReadByte();
	
	// non-standard, catch people with a vi twitch, double ESC == exit
	if (code === 27) return [27, 27];
	
	if (code < 64 || code > 95) { // 2 char sequence
		throw new Error( Term.INVALID_ESC );
	}

	if (code === 91) { // CIS codes  ESC[ 32 to 47 terminated by a single 64 to 126 char
		var ret = [27, 91];
		var i = 0;
		do {
			var b = binjs_termReadByte();
			
			if (i++ === 0 && b === 91 ) { // ESC[[ = function keys, generally ignored
				ret.push(b);
				ret.push(binjs_termReadByte());
				return ret;
			}

			ret.push(b);
		} while (b >= 32 && b < 64);
		
		if (b >= 64 && b <= 126) {
			return ret;
		}
		throw new Error( Term.INVALID_ESC );
	}
	
	else if (code === 93 ||  // OSC codes  ESC]  read to BEL or ST  ESC\
			 code === 80 ||  // DCS device control scrint  read to BEL or ST  ESC\
			 code === 94 ||  // ESC^ PM  termianted by ST  ESC\  (we accept BEL too, should we?)
			 code === 95     // ESC_ APC terminated by ST  ESC\  (we accept BEL too, should we?)
			) { 
			
		var ret = [27, code];
		do {
			var b = binjs_termReadByte();
			ret.push(b);
		} while ( b !== 7 && b !== 27); // BEL or ESC
		if (b === 27) {
			var stt = binjs_termReadByte();
			if (stt !== 92) throw new Error( Term.INVALID_ESC );
			ret.push(stt); 
		}
		return ret;
	}

	else if (code === 78) {  // SS2 code ESCN read one more char
		return [27, code, binjs_termReadByte()];
	}
	
	else if (code === 79) {  // SS3 code ESCO (capital O) read one more char
		return [27, code, binjs_termReadByte()];
	}
	
	else {  // 2 char ESC code
		return [27, code];
	}
	// TODO ESC O ESC _
}

// set the window title in xterm, Konsole does not like this??
Term.prototype.setWindowTitle = function(title) {
	binjs_termWriteByte(27, 93, 50, 59); // ESC]2;
	$.print(title);
	binjs_termWriteByte(7); // BEL
	//binjs_TermWriteByte(27, 92); // ESC\ aka ST
	binjs_flush();
}

// dont seem to work in Konsole

Term.prototype.cursorOff = function() {
	binjs_termWriteByte(27, 91, 63, 50, 53, 108); // ESC[ ?25l
	binjs_flush();
}
Term.prototype.cursorOn = function() {
	binjs_termWriteByte(27, 91, 63, 50, 53, 104); // ESC[ ?25h
	binjs_flush();
}

Term.prototype.cursorUp = function() {
	binjs_termWriteByte(27, 91, 65); // ESC[A
	binjs_flush();
}
Term.prototype.cursorDown = function() {
	binjs_termWriteByte(27, 91, 66); // ESC[B
	binjs_flush();
}
Term.prototype.cursorForward = function() {
	binjs_termWriteByte(27, 91 , 67); // ESC[C
	binjs_flush();
}
Term.prototype.cursorBack = function() {
	binjs_termWriteByte(27, 91 , 68); // ESC[D
	binjs_flush();
}

Term.prototype.cursorStore = function() {
	binjs_termWriteByte(27, 91 , 115); // ESC[s
	binjs_flush();
}
Term.prototype.cursorRestore = function() {
	binjs_termWriteByte(27, 91 , 117); // ESC[u
	binjs_flush();
}
Term.prototype.writeNumber = function(num) {
	var sNum = "" + Math.floor(num);
	for (var i = 0 ; i < sNum.length ; i++) {
		binjs_termWriteByte(sNum.charAt(i).charCodeAt(0));
	}
}
Term.prototype.cursorPosition = function(row, col) {

	if (typeof col === 'undefined') return this.getCursorPosition();

	binjs_termWriteByte(27, 91); // ESC[
	this.writeNumber(row);
	binjs_termWriteByte(59); // ;
	this.writeNumber(col);
	binjs_termWriteByte(102); // f
	binjs_flush();
	
}

/**
 * Returns the cursor position as an array [row, col], 
 * N.B. this is [y,x]
 */
Term.prototype.getCursorPosition = function() {
	var ret = [0 , 0];
	var codes = this.query(27, 91, 54, 110); // ESC[6n
	
	if (codes.length === 0) return [-1 , -1];
	if ( codes[0] !== 27 ) throw new Error( Term.INVALID_ESC );
	if ( codes[1] !== 91 ) throw new Error( Term.INVALID_ESC );
	
	var num = "";
	for (var i = 2 ; i < codes.length ; i++) {
		if (codes[i] === 82) { //R terminator
			ret[1] = parseInt(num);
			return ret;
		}
		else if (codes[i] === 59) { //; delim
			ret[0] = parseInt(num);
			num = "";
		}
		else if (codes[i] >= 48 && codes[i] <= 57) {
			num += String.fromCharCode(codes[i]);
		}
		else throw new Error( Term.INVALID_ESC );
	}
	throw new Error( Term.INVALID_ESC );
}

Term.prototype.query = function(argv) {
	var wasRaw = binjs_TERM_IS_RAW;
	if ( ! binjs_TERM_IS_RAW ) {
		this.makeRaw();
	}
	this.writeByte.apply(this, arguments);
	this.flush();
	var c = this.readChar();
	var ret = [];
	if (this.isEscape(c)) {
		ret = this.consumeAnsiEscape();
	}
	if ( ! wasRaw) {
		this.reset();
	}
	return ret;
}


