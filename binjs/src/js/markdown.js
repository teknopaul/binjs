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

if ( typeof markdown === 'undefined') var markdown = {};

/**
 *  Wordwrap width
 */
markdown.lineLength = 80;

/**
 * Symbols used for list markers
 */ 
markdown.listGlyphs = ['⁜', '⁕', '∎', '∙', '∘', '·'];

/**
 * Pretty print a file containing markdown syntax text
 * to the console.
 */
markdown.printFile = function(file) {

	var f = new File(file);
	if ( ! f.exists) {
        $.error(1, "Cant find markdown file", file);
        return;
	}
	
	markdown.doOutput(f.read());
}

/**
 * Pretty print a string of markdown text to the console.
 */
markdown.printText = function(mdString) {

	markdown.doOutput(mdString);
	
}

markdown.header = function(text) {

	var startpos = 0;
	while (text.charAt(startpos) == ' ') startpos++;
	
	var hashCount = 0;
	while (text.charAt(startpos) == '#') {
		startpos++;
		hashCount++;
	}
	
	var text = text.substring(startpos);
	
	if ( hashCount == 1) {
		var headArray = markdown.doWordWrap(0, text).split("\n");
		for (var i = 0 ; i < headArray.length -1 ; i++ ) {
			$.println(markdown.center(headArray[i]), true);
		}
    }
    else {
		var headArray = markdown.doWordWrap(0, text).split("\n");
		for (var i = 0 ; i < headArray.length -1 ; i++ ) {
			$.print("······".substring(0, hashCount))
			$.println(headArray[i], true);
		}
	}
}

markdown.list = function(text, listChar) {

	var startpos = 0;

	var startpos = 0;
	while (text.charAt(startpos) == ' ') startpos++;	
	
	var depth = 0;
	while (text.charAt(startpos) == listChar) {
		startpos++;
		depth++;
	}
	
	var text = text.substring(startpos);
	
	var wrappedAsArray = markdown.doWordWrap(depth + 2, text).split("\n");
	for (var i = 0 ; i < wrappedAsArray.length -1 ; i++ ) {
		$.print("      ".substring(0, depth));
		if (i == 0) {
			$.print(markdown.listGlyphs[depth]);
		} 
		else {
			$.print("  ");
		}
		$.println(wrappedAsArray[i].substring(depth + 2));
	}
}

markdown.center = function(text) {
    var indent = (markdown.linLen - text.length) / 2;
    return "                                        ".substring(0, indent) + text;
}

markdown.wordWrap = function(indent, text) {
    $.print(markdown.doWordWrap(indent, text));
}

markdown.doWordWrap = function(indent, text) {
    var buffer = "";
	var width = markdown.lineLength - indent;
        
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

markdown.doOutput = function(mdString) {
	
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
            $.print(binjs_DARKGREY);
			markdown.wordWrap(2, mdata[i].substring(startpos));
			$.print(binjs_COLOUR_OFF);
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
			$.print(binjs_ORANGE);
			markdown.wordWrap(0, mdata[i]);
			$.print(binjs_COLOUR_OFF);
		}
		else if (mdata[i].charAt(txtpos) == "#" ) {
			markdown.header(mdata[i]);
		}
		else if (mdata[i].charAt(txtpos) == "*" ) {
			markdown.list(mdata[i], '*');
		}
		else if (mdata[i].charAt(txtpos) == "+" ) {
			markdown.list(mdata[i], '+');
		}
		else if (mdata[i].charAt(txtpos) == "-" ) {
			markdown.list(mdata[i], '-');
		}
		else {
			markdown.wordWrap(0, mdata[i]);
		}
	}
}
