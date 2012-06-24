# Table

Renders a table of data

----------------------------

## Import

`binjs_import("~lib/tui/Table.js")`

-----------------------

## Provides

* tui.Table


## Constructor

The constructor takes two optional arguments.

    var progress = new tui.Throbber(arg0, arg1);
    
### arg0 

If `arg0` is a string, it is assumed to be table data and i sparsed splitting columns by spaces and rows by `\n` new line characters.

If `arg0` is an array it is assumed to be table data where `arg0` is an array of strings, the headers; `arg1 `is the table of data which is 2 dimensional array containing a grid of data, data values do not need to be strings.

-----------------------

## Attributes

### divider

The character used to divide the columns, deffaults to a unicode full height pipe `|`.  Can be changed to a normal pipe `|` for ascii output.

### compress 

Consider one or more sequential delimiters as a single delimiter, when parsing `arg0` during construction.  this permist preformatted tables padded with spaces to be parsed.

### titles 

The column titles, must contain Strings

### data

The grid of data, may contains Strings and Numbers


### widths

widths can be set to an array of integes to define the column widths, if not set widths will be calcualted from the longest data items.

-----------------------

## Methods

### parse

Takes two arguments  `string` & `delim`,  the string is the tablle data and the delim is the column separator, rows are assumed to be serarated by `\n` new lines.

### print

Print the table to the console.

### toString

Return the table as a string, for inclusion in a report, the string representation has no ESC characters but is padded.

    