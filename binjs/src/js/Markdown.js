/**
 * Pretty print Markdown files into colours.
 *
 * The whole markdown syntax is not supported because markdown permits HTML
 * and this is not an HTML renderer.
 * 
 * features
 *  # headings
 *  > blockquote
 *  "    " four spaces for code
 *  * stars for lists (up to 6 levels deep)
 * 
 * TODO support *bold* text
 * TODO rewrap wrapped text
 * TODO correctly handle entities
 */

Markdown = function(){

};

/**
 *  Wordwrap width
 */
Markdown.lineLength = 80;

/**
 * Symbols used for list markers
 */ 
Markdown.listGlyphs = ['⁜', '⁕', '∎', '∙', '∘', '·'];

/**
 * Pretty print a file containing markdown syntax text
 * to the console.
 */
Markdown.prototype.printFile = function(file) {

	var f = new File(file);
	if ( ! f.exists) {
        $.error(1, "Cant find markdown file", file);
        return;
	}
	
	this.doOutput(f.read());
}

/**
 * Pretty print a string of markdown text to the console.
 */
Markdown.prototype.printText = function(mdString) {

	this.doOutput(mdString);
	
}

Markdown.prototype.header = function(text) {

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
			$.println(this.center(headArray[i]), true);
		}
    }
    else {
		var headArray = this.doWordWrap(0, text).split("\n");
		for (var i = 0 ; i < headArray.length -1 ; i++ ) {
			$.print("······".substring(0, hashCount))
			$.println(headArray[i], true);
		}
	}
}

Markdown.prototype.list = function(text, listChar) {

	var startpos = 0;

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
		$.print("      ".substring(0, depth));
		if (i == 0) {
			$.print(Markdown.listGlyphs[depth]);
		} 
		else {
			$.print("  ");
		}
		$.println(wrappedAsArray[i].substring(depth + 2));
	}
}

Markdown.prototype.center = function(text) {
    var indent = (this.linLen - text.length) / 2;
    return "                                        ".substring(0, indent) + text;
}

Markdown.prototype.wordWrap = function(indent, text) {
    $.print(this.doWordWrap(indent, text));
}

Markdown.prototype.doWordWrap = function(indent, text) {
    var buffer = "";
	var width = Markdown.lineLength - indent;
        
	while (true) {
		buffer += ("            ".substring(0, indent));
		if ( text.length > width) {
		
			var endpos = width;
			while(text.charAt(endpos) != ' ') endpos--;
			
			
			buffer += (text.substring(0, endpos));
			buffer += "\n";
			
			if (text.charAt(endpos) == ' ') endpos++;
			text = text.substring(endpos);
		}
		else {
			buffer += text;
			buffer += "\n";
			return buffer;
		}
	}
}

Markdown.prototype.doOutput = function(mdString) {
	
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
            $.print(Color.DARKGREY);
			this.wordWrap(2, mdata[i].substring(startpos));
			$.print(Color.COLOR_OFF);
		}
		else if (
			mdata[i].indexOf("---") == 0 ||
			mdata[i].indexOf("- - -") == 0 ||
			mdata[i].indexOf("***") == 0 ||
			mdata[i].indexOf("* * *") == 0
			) {
			$.println("                               ···⤛«‹ ¶ ›» ⤜···                                ");
			
		}
		else if (mdata[i].indexOf("    ") == 0) {
			$.print(Color.ORANGE);
			this.wordWrap(0, mdata[i]);
			$.print(Color.COLOR_OFF);
		}
		else if (mdata[i].charAt(txtpos) == "#" ) {
			this.header(mdata[i]);
		}
		else if (mdata[i].charAt(txtpos) == "*" ) {
			this.list(mdata[i], '*');
		}
		else if (mdata[i].charAt(txtpos) == "+" ) {
			this.list(mdata[i], '+');
		}
		else if (mdata[i].charAt(txtpos) == "-" ) {
			this.list(mdata[i], '-');
		}
		else {
			this.wordWrap(0, mdata[i]);
		}
	}
}
