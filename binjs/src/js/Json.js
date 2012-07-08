/**
 * JSON pretty printer, ans some syntactic sugar around v8's native JSON
 * @fileoverview
 */
/**
 * Pretty prints JSON strings.
 * 
 * The strings are not very pretty, but at least they are not all on one line.
 * Usage
 * <code>var p = new Json().prettyPrint(jsonString)</code>
 * 
 * @class
 * @constructor
 */
var Json = function() {

}

Json.prototype.parse = function(json) {
	return JSON.parse(json);
}

Json.prototype.toJson= function(object, indent) {
	if (indent) {
		return JSON.stringify(object, 2, "  ");
	}
	else {
		return JSON.stringify(object);
	}
}

Json.prototype.prettyPrint = function(json) {
	$.println(this.colorize(json))
}
Json.prototype.prettyPrintObject = function(jsonObject) {
	$.println(this.colorize(this.toJson(jsonObject, false)));
}

/**
 * @param a String of JSON text with no tabs or new lines
 * @return a pretty printed JSON string.
 * @public
 */
Json.prototype.colorize = function(json) {
	var objDepth = 0;
	var inString = false;
	var arrayDepth = 0;
	var sb = "";
	var len = json.length;
	var i = 0;
	for (i = 0; i < len; i++) {
		var c = json.charAt(i);
		switch (c) {
			case '{':
				if (!inString) sb += Color.MAGENTA;
				sb += c;
				if (!inString) sb += Color.COLOR_OFF;
				if (!inString) {
					sb += '\n';
					objDepth++;
					sb += this.printDepth(objDepth);
				}
				break;
			case '}':
				if (!inString) {
					sb += '\n';
					objDepth--;
					sb += this.printDepth(objDepth);
				}
				if (!inString) sb += Color.MAGENTA;
				sb += c;
				if (!inString) sb += Color.COLOR_OFF;
				break;
			case '\"':
				if (json.charAt(i-1) !== '\\') {
					if (!inString) {
						sb += Color.GREEN;
						sb += c;
					}
					else {
						sb += c;
						sb += Color.COLOR_OFF;
					}
					inString = ! inString;
				}
				else {
					sb += c;
				}
				break;
			case ',':
				if ( !inString && ( arrayDepth == 0 || json.charAt(i-1) == '}') ) {
					//sb += '\n');
					//printDepth(sb, objDepth);
					sb += Color.RED;
					sb += ',';
					sb += Color.COLOR_OFF;
					sb += '\n';
					sb += this.printDepth(objDepth);
				}
				else {
					sb += ',';
				}
				break;
			case '[':
				if (!inString) {
					arrayDepth++;
				}
				if (!inString) sb += Color.RED;
				sb += c;
				if (!inString) sb += Color.COLOR_OFF;
				break;
			case ']':
				if (!inString) {
					arrayDepth--;
				}
				if (!inString) sb += Color.RED;
				sb += c;
				if (!inString) sb += Color.COLOR_OFF;
				break;
			case ':':
				if (!inString && json.charAt(i-1) != ' ') {
					sb += '\t';
				}
				if (!inString) sb += Color.RED;
				sb += c;
				if (!inString) sb += Color.COLOR_OFF;
				if (!inString && json.charAt(i-1) != ' ') {
					sb += ' ';
				}
				break;
			
			default:
				sb += c;
		}
	}
	return sb;
};
/**
 * @private
 */
Json.prototype.printDepth = function(objDepth) {
	var sb = "";
	var i = 0;
	for (i = 0; i < objDepth; i++) {
		sb += "  ";
	}
	return sb;
};
