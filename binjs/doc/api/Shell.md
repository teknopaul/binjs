# Shell

Provides access to features of the command line environment the script is running in.
    
----------------------------

## Import

`binjs_import("~lib/Shell.js")`

------------------------

##  Provides

 * Shell
 
------------------------

## Constructor

The constructor takes no arguments.

    var shell = new Shell();
    
----------------------------

## Attributes

### binjsVersion

Returns a String for the /bin/js version. 
e.g. 0.1

### bashVersion

Returns a String for the bash version. 
e.g. 4.2

### javaScriptVersion

Returns the v8 version a String as returned by v8::V8::GetVersio
e.g. 3.11.9 (candidate)

------------------------

## Methods

### getWidth

Returns the width of the console in characters

### getHeight

Returns the height of the console in characters, this is the visible height not the scrollback buffer.
