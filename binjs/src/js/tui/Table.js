/**
 * Utility Object for printing tables of data
 */
 
if (typeof tui == 'undefined') tui = {};

/**
 * Create a Table.
 * Optional parameters are a String contaiing the table to be parsed 
 * or an array of title strings and a 2d array of data.
 *
 * this is pretty simple code, feel free to contribute some features, hin thint
 * TODO full screen width, no max padding, Unicode borders. ascii mode
 *
 * @constructor
 */
tui.Table = function(arg0, arg1) {
	// this is a unicode bar set to  normal pipe or a space for ascii output
	this.divider = '⎜';
	// consider one or more sequentioal delimters as one
	this.compress = true;
	// the column titles, must contain Strings
	this.titles = [];
	// the grid of data, may contains Strings and Numbers
	this.data = [];
	// this.widths can be set to define the column widths
	this.widths = undefined;
	
	if (typeof arg0 == 'string') {
		this.parse(arg0, ' ');
	}
	
	else if (typeof arg0 == 'array') {
		this.headers = arg0;
		this.data = arg1;
	}
	
}

tui.Table.prototype.parse = function(string, delim) {
	var lines = string.split('\n');
	if (lines.length <= 0) {
		return;
	}
	this.titles = lines[0].split(delim);
	if (lines.length > 1) {
		for (var r = 1; r < lines.length ; r++) {
			if ( lines[r] == "" ) continue;
			
			var lineArray = lines[r].split(delim);
			var lineData =  [];
			for (var c = 0; c < lineArray.length ; c++) {
				if (this.compress && lineArray[c] == "") continue;
				lineData.push(lineArray[c]);
			}
			this.data.push(lineData);
		}
	}
}

tui.Table.prototype.center = function(text, width) {
	var indent = Math.floor((width - text.length) / 2);
	var spaces = "                                        ".substring(0, indent);
	return (spaces + text + spaces) + ( (text.length + (indent*2) < width) ? " " : "");
}

tui.Table.prototype.align = function(obj, width) {
	var string = "";
	var left = true;
	if (typeof obj == 'string') {
		string = obj;
	}
	else {
		left = false;
		string = String(obj)
	}
	var indent = width - string.length;
	return left ? 
				string + "                                                                                ".substring(0, indent)
				:
				"                                                                        ".substring(0, indent) + string
}
	
tui.Table.prototype.print = function() {
	if (typeof this.widths == 'undefined')  {
		this.setDefaultWidths(5);
	}
	
	// print headers
	
	for (var i = 0; i < this.titles.length ; i++) {
		$.print(this.divider);
		$.print(Color.UNDERLINE);
		$.print(this.align(this.titles[i], this.widths[i]), true);
	}
	$.print(Color.COLOR_OFF);
	$.println(this.divider);

	// print data
	for (var r = 0; r < this.data.length ; r++) {
		$.print(this.divider);
		for (var c = 0; c < this.data[r].length ; c++) {
			$.print( this.align(this.data[r][c], this.widths[c]) );
			$.print(this.divider);
		}
		$.println();
	}
	$.println();
}

tui.Table.prototype.toString = function() {
	if (typeof this.widths == 'undefined')  {
		this.setDefaultWidths(5);
	}

	var buf = "";
	// print headers
	for (var i = 0; i < this.titles.length ; i++) {
		buf += this.divider;
		buf += this.align(this.titles[i], this.widths[i]);
	}
	buf += this.divider + '\n';

	// print data
	for (var r = 0; r < this.data.length ; r++) {
		buf += (this.divider);
		for (var c = 0; c < this.data[r].length ; c++) {
			buf += this.align(this.data[r][c], this.widths[c]);
			buf += this.divider;
		}
		buf += '\n';
	}
	buf += '\n';
	
	return buf;
}


tui.Table.prototype.setDefaultWidths = function(min) {
	this.widths = [];
	for (var c = 0; c < this.titles.length ; c++) {
		this.widths[c] = Math.max(this.titles[c].length, min);
	}
	
	
	for (var r = 0; r < this.data.length ; r++) {

		for (var c = 0; c < this.data[r].length ; c++) {
			var len = String(this.data[r][c]).length;
			this.widths[c] = Math.max(this.widths[c], len);
		}

	}
}







