/**
 * TableParser utilities for parsing Linux utilties output.
 *
 * This is NOT optimised for speed or memory usage, dont try processing lots of data use mysql or similar.
 */

if (typeof util === 'undefined') util = {};
 
util.DataTable = function() {
	this.titles = null;
	this.data = null;
}

util.DataTable.prototype.innerJoin = function(other, thisIdCol, otherIdCol) {
	return this._join(other, thisIdCol, otherIdCol, false);
}
util.DataTable.prototype.leftOuterJoin = function(other, thisIdCol, otherIdCol) {
	return this._join(other, thisIdCol, otherIdCol, true);
}
util.DataTable.prototype.rightOuterJoin = function(other, thisIdCol, otherIdCol) {
	return other._join(this, otherIdCol, thisIdCol, true);
}

util.DataTable.prototype._join = function(other, thisIdCol, otherIdCol, outer) {
	var newTable = new util.DataTable();
	newTable.titles = this.titles.concat();
	newTable.data = [];
	
	var thisCol = 0;
	for(var c = 0 ; c < this.titles.length ; c++) {
		if ( this.titles[c] == thisIdCol ) thisCol = c;
	}
	
	var otherCol = 0;
	for(var c = 0 ; c < other.titles.length ; c++) {
		if ( other.titles[c] == otherIdCol ) otherCol = c;
		newTable.titles.push(other.titles[c]);
	}

	var nulls = [];
	for (var r = 0 ; r < other.titles.length ; r++) nulls.push(null);
	
	for (var r = 0 ; r < this.data.length ; r++) {
	
		var matches = this.findRows(other, otherCol, this.data[r][thisCol]);
		for (var m = 0 ; m < matches.length ; m++) {
			var row = [];
			row = this.data[r].concat(matches[m]);
			newTable.data.push(row);
		}
		if (matches.length === 0 && outer) {
			newTable.data.push(this.data[r].concat(nulls));
		}
	}
	
	return newTable;
	
} 

util.DataTable.prototype.findRows = function(other, otherIdCol, thisValue) {

	var matches = [];
	for (var r = 0 ; r < other.data.length ; r++) {
		if ( other.data[r][otherIdCol] === thisValue ) {
			matches.push(other.data[r]);
		}
	}
	return matches;
}





util.TableParser = function() {
}

/**
 * Parse a table of data that is delimited by one or more spaces.
 * @return a DataTable object
 */
util.TableParser.prototype.parseSpacedTable = function(string, hasTitles) {
	if ( typeof hasTitles === 'undefined') hasTitles = true;
	
	var table = new util.DataTable();
	table.data = [];
	
	var lines = string.split('\n');

	if ( hasTitles && lines.length > 0) table.titles = this.parseSpacedLine(lines[0]);

	var limit = lines.length;
	if ( hasTitles ) limit--;
	for (var r = 1; r < limit ; r++) {
		if ( lines[r] === "" ) continue;
		table.data.push(this.parseSpacedLine(lines[r]));
	}
	
	return table;
	
}

/**
 * Parse a single line String that is delimited by one or more spaces.
 * @return an Array of Strings
 */
util.TableParser.prototype.parseSpacedLine = function(string) {

	var lineArray = string.split(" ");
	var lineData =  [];
	for (var c = 0; c < lineArray.length ; c++) {
		if (lineArray[c] === "") continue;
		lineData.push(lineArray[c]);
	}

	return lineData;

}

/**
 * Parse a table of data that has fixed widths and is delimited by spaces.
 * The first row defines the titles and the widths and must be left aligned.
 */
util.TableParser.prototype.parseFixedWidthTable = function(string) {

	var table = new util.DataTable();
	table.titles = [];
	table.data = [];
	table.colStartPositions = [];
	
	var rows = string.split('\n');
	
	if (rows.length === 0) return table;
	
	
	// parse titles saving the start positions
	
	var titlesLine = rows[0];
	
	var inGap = true;  // when true we are positioned in whitespace between columns
	var buffer = "";
	for (var i = 0 ; i < titlesLine.length ; i++) {
		var c = titlesLine.charAt(i);
		if ( c === ' ' ) {
			if (inGap) continue;
			
			else { // end of title text
				table.titles.push(buffer);
				buffer = "";
				inGap = true;
			}
		}
		else {
			if (inGap) {  // end of gap
				table.colStartPositions.push(i);
				inGap = false;
			}
			buffer += c;
		}
	}
	if (buffer.length > 0) { // tailing header
		table.titles.push(buffer);
	}
	
	// parse the table data
	
	var rowLimit = rows.length;
	var cols = table.titles.length;
	var r = 0;
	for (var l = 1; l < rowLimit ; l++) {
		var dataLine = rows[l];
		if ( dataLine === "" ) continue;
		
		table.data.push([]);
		for (var c = 0 ; c < cols ; c++) {
			var colStart = table.colStartPositions[c];
			var colEnd = 0;
			if (c < cols -1) {
				colEnd = table.colStartPositions[c + 1];
			}
			else {
				colEnd = dataLine.length;
			}
			table.data[r].push(dataLine.substring(colStart, colEnd).trim());
		}
		r++;
	}
	
	return table;
}


/**
 * Parse a table of data that has fixed widths and is delimited by spaces.
 * Any column with only spaces is treated as a column delimiter.
 * This type of format is used by ps and lsof.
 * N.B. this is not efficient the whole table is parsed character by character
 * to find spaces and determine likely column widths.
 */
util.TableParser.prototype.parseFixedSpacedTable = function(string) {

	var table = new util.DataTable();
	table.titles = [];
	table.data = [];
	table.colStartPositions = [];
	
	var rows = string.split('\n');
	
	if (rows.length === 0) return table;
	
	// find max width
	var rowLimit = rows.length;
	var max = 0;
	for (var l = 0; l < rowLimit ; l++) {
		max = Math.max(max, rows[l].length);
	}
	
	// find any column which is just spaces
	var hasSpace = new Array(max);
	for (var c = 0; c < max ; c++) hasSpace[c] = true;
	
outer: for (var l = 0; l < rowLimit ; l++) {
		for (var c = 0; c < max ; c++) {
			if (rows[l].length < c) continue outer;
			hasSpace[c] &= rows[l].charAt(c) === ' ';
		}
	}
	table.colStartPositions.push(0);
	for (var c = 0; c < max ; c++) {
		if ( hasSpace[c] && ! hasSpace[c - 1] ) table.colStartPositions.push(c);
	}
	

	var cols = table.colStartPositions.length;

	// titles
	var c;
	var colStartPositions = [];
	for (c = 0 ; c < cols ; c++) {
		var dataLine = rows[0];
		var colStart = table.colStartPositions[c];
		var colEnd = 0;
		if (c < cols -1) {
			colEnd = table.colStartPositions[c + 1];
		}
		else {
			colEnd = dataLine.length;
		}
		var tit = dataLine.substring(colStart, colEnd).trim();
		if (tit.length != 0) { // cant be a column if it does not have a title
			table.titles.push(tit);
			colStartPositions.push(table.colStartPositions[c]);
		}
	}
	table.colStartPositions = colStartPositions;
	cols = table.colStartPositions.length;

	var rowLimit = rows.length;
	var r = 0;
	for (var l = 1; l < rowLimit ; l++) {
		var dataLine = rows[l];
		if ( dataLine === "" ) continue;
		
		table.data.push([]);
		for (var c = 0 ; c < cols ; c++) {
			var colStart = table.colStartPositions[c];
			var colEnd = 0;
			if (c < cols -1) {
				colEnd = table.colStartPositions[c + 1];
			}
			else {
				colEnd = dataLine.length;
			}
			table.data[r].push(dataLine.substring(colStart, colEnd).trim());
		}
		r++;
	}

	return table;
}

/**
 * Converts any Strings that look like numbers in the table data to Floats.
 * this assumes all input data is Strings.
 */
util.TableParser.prototype.convertNumbers = function(table) {
	var numRegExp = /^[+-]*[0-9\.]*$/;
	var rowLimit = table.data.length;
	for (var r = 0; r < rowLimit ; r++) {
		var cols = table.data[r].length;
		for (var c = 0 ; c < cols ; c++) {
			if ( numRegExp.test(table.data[r][c]) ) {
				table.data[r][c] = parseFloat(table.data[r][c]);
			}
		}
	}
}



















