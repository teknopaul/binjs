# Term

Provides access to features of the terminal the script is running in, such as terminal width, height and cursor position.

This Object provides access to the terminal via ESC codes wrapped as JavaScript method calls, to make interacting with ther terminal easy.

----------------------------

## Import

`binjs_import("~lib/Term.js")`

------------------------

##  Provides

 * Term
 
------------------------

## Constructor

The constructor takes no arguments.

    var term = new Term();
    
----------------------------

## Attributes

### binjsVersion

Returns a String for the /bin/js version. 
e.g. 0.1

### bashVersion

Returns a String for the bash version. 
e.g. 4.2

### javaScriptVersion

Returns the v8 version a String as returned by v8::V8::GetVersion
e.g. 3.11.9 (candidate)

------------------------

## Methods

### getWidth

Returns the width of the console in characters

### getHeight

Returns the height of the console in characters, this is the visible height not the scrollback buffer.

### makeRaw

Make the stdin read in raw mode without line buffereing so that characters can be read byte by byte. Enabling this means the script has to take control of basics like cursor and deleting chars and typing enter, but enables scripts to respond to up arrow keypresses and ESC sequences.

Warning: after turning this on it must be turned off before the script terminates or the bash shell from which the script was launched becomes unresponsive.

### reset

Undo makeRaw

### readChar

Read a single character off the command line, this method handles UTF-8 reading so it may read more than one byte.

### writeByte

Enables writing 8bit bytes to the console, this method takes integer varargs which are converted to unsigned bytes before being send to stdout.  N.B to write a UTF-8 char just call $.print()

### flush

Flush stdout if it was being buffered.

### writeDoubleHeight

Write text to the console that is twice as big as normal, this only works in DEC compatible terminals, KDEs Konsole supports it gnome-terminal does not and will just print the line twice at single height.

### setWindowTitle

Set the title window of the terminal, works in xterm but not Konsole (potentially a bug)

### cursorOff

Hide the cursor.

## cursorOn

Show the cursor.

### cursorUp, cursorUDown, cursorLeft, cursorRight

Programatically move the cursor.  This can be sued to move the cursor to any screen position and start writing characters.

### cursorPosition

Move the curson to a position on screen, accepts two arguments row and col. This is counter-intuitive, one would expect x and y but the args are reversed and expressed as the line to move to vertically and then column to move horizontally.





