/**
 * Pretty print Markdown files into colours.
 *
 * The whole markdown syntax is not supported because markdown permits HTML
 * and this is not an HTML renderer.
 * 
 * features
 *  # headings
 *  > blockquote
 *  "	" four spaces for code
 *  * stars for lists (up to 6 levels deep)
 * 
 * TODO support *bold* text
 * TODO rewrap wrapped text
 * TODO correctly handle entities
 */
binjs_import("~lib/Term.js");

Markdown = function(){
	this.padding = "";
	for (var i = 0 ; i < Markdown.lineLength / 2 ; i++) this.padding += " ";
};

/**
 *  Wordwrap width
 */
Markdown.lineLength = new Term().getWidth();

/**
 * Symbols used for list markers
 */ 
Markdown.listGlyphs = ['⁜', '⁕', '∎', '∙', '∘', '·'];

/**
 * Pretty print a file containing markdown syntax text
 * to the console.
 */
Markdown.prototype.printFile = function(file) {

	$.print(this.parseFile(file));

}

Markdown.prototype.parseFile = function(file) {

	var f = new File(file);
	if ( ! f.exists) {
		$.error(1, "Cant find markdown file", file);
		return;
	}
	
	return this.doOutput(f.read());
}
/**
 * Pretty print a string of markdown text to the console.
 */
Markdown.prototype.printText = function(mdString) {

	this.doOutput(mdString);
	
}

Markdown.prototype.header = function(text) {

	var buffer = "";
	var startpos = 0;
	while (text.charAt(startpos) == ' ') startpos++;
	
	var hashCount = 0;
	while (text.charAt(startpos) == '#') {
		startpos++;
		hashCount++;
	}
	
	var text = text.substring(startpos);
	
	if ( hashCount == 1) {
		var headArray = this.doWordWrap(0, text).split("\n");
		for (var i = 0 ; i < headArray.length -1 ; i++ ) {
			buffer += Color.BOLD;
			buffer += this.center(headArray[i]);
			buffer += Color.COLOR_OFF;
			buffer += '\n';
		}
	}
	else {
		var headArray = this.doWordWrap(0, text).split("\n");
		for (var i = 0 ; i < headArray.length -1 ; i++ ) {
			buffer += "······".substring(0, hashCount);
			buffer += Color.BOLD;
			buffer += headArray[i];
			buffer += Color.COLOR_OFF;
			buffer += '\n';
		}
	}
	
	return buffer;
}

Markdown.prototype.list = function(text, listChar) {
	var buffer = "";

	var startpos = 0;
	while (text.charAt(startpos) == ' ') startpos++;	
	
	var depth = 0;
	while (text.charAt(startpos) == listChar) {
		startpos++;
		depth++;
	}
	
	var text = text.substring(startpos);
	
	var wrappedAsArray = this.doWordWrap(depth + 2, text).split("\n");
	for (var i = 0 ; i < wrappedAsArray.length -1 ; i++ ) {
		buffer += "	  ".substring(0, depth);
		if (i == 0) {
			buffer += Markdown.listGlyphs[depth];
		} 
		else {
			buffer += "  ";
		}
		buffer += wrappedAsArray[i].substring(depth + 2);
		buffer += '\n';
	}
	return buffer;
}

Markdown.prototype.center = function(text) {
	var indent = (Markdown.lineLength - text.length) / 2;
	return this.padding.substring(0, indent) + text;
}

Markdown.prototype.wordWrap = function(indent, text, rightMargin, processFonts) {
	return this.doWordWrap(indent, text, rightMargin, processFonts);
}

Markdown.prototype.doWordWrap = function(indent, text, rightMargin, processFonts) {
	var buffer = "";
	var width = Markdown.lineLength - indent - (typeof rightMargin === 'number' ? rightMargin : 0);

	//text = processFonts ? this.doCodeFont(text) : text;
	
	while (true) {
		buffer += "                ".substring(0, indent);
		if ( text.length > width) {
		
			var endpos = width;
			while(text.charAt(endpos) !== ' ') endpos--;
			
			buffer += text.substring(0, endpos);
			buffer += "\n";
			
			if (text.charAt(endpos) === ' ') endpos++;
			text = text.substring(endpos);
		}
		else {
			buffer += text;
			buffer += "\n";
			return buffer;
		}
	}
}

/*
XTerm and Konsole are unable to word wrap text with ctrl characters properly!
So adding color inline to fonts looks nasty when wrapped.
Uncomment this if the Linux console ever learns to count only visible width
Markdown.prototype.doCodeFont = function(text) {
	var inCode = false;
	var buffer = "";
	for(var i = 0 ; i < text.length ; i++) {
		var c = text.charAt(i);
		if (c === '`') {
			if (inCode) {
				buffer += Color.COLOR_OFF;
			}
			else {
				buffer += Color.ORANGE;
			}
			inCode = !inCode;
		} 
		else buffer += c;
	}
	// we dont span lines with `` even if Markdown official does
	if (inCode) buffer += Color.COLOR_OFF;
	return buffer;
}
*/

Markdown.prototype.doOutput = function(mdString) {
	
	var buffer = "";
	var mdata = mdString.split("\n");
	
	var inBlockquote = false;
	var inCode = false;

	for ( var i = 0 ; i < mdata.length ; i ++ ) {
		if (mdata[i].length == 0) {
			inBlockquote = false;
		}
		var txtpos = 0;
		while (mdata[i].charAt(txtpos) == ' ') txtpos++;
		
		if (inBlockquote || mdata[i].charAt(txtpos) == ">") { // block quite
			inBlockquote = true;
			var startpos = 0
			while ( mdata[i].charAt(startpos) == '>' || mdata[i].charAt(startpos) == ' ') {
				startpos++;
			}
			buffer += Color.DARKGREY;
			buffer += this.wordWrap(4, mdata[i].substring(startpos), 4);
			buffer += Color.COLOR_OFF;
		}
		else if (
			mdata[i].indexOf("---") == 0 ||
			mdata[i].indexOf("- - -") == 0 ||
			mdata[i].indexOf("***") == 0 ||
			mdata[i].indexOf("* * *") == 0
			) {
			buffer += (this.padding.substring(8) + "···⤛«‹ ¶ ›» ⤜···");
			
		}
		else if (mdata[i].indexOf("    ") == 0) {
			buffer += Color.ORANGE;
			buffer += this.wordWrap(0, mdata[i]);
			buffer += Color.COLOR_OFF;
		}
		else if (mdata[i].charAt(txtpos) == "#" ) {
			buffer += this.header(mdata[i]);
		}
		else if (mdata[i].charAt(txtpos) == "*" ) {
			buffer += this.list(mdata[i], '*');
		}
		else if (mdata[i].charAt(txtpos) == "+" ) {
			buffer += this.list(mdata[i], '+');
		}
		else if (mdata[i].charAt(txtpos) == "-" ) {
			buffer += this.list(mdata[i], '-');
		}
		else {
			buffer += this.wordWrap(1, mdata[i], 1, true);
		}
	}
	return buffer;
}
