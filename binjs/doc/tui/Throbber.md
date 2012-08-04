# Throbber

A Spinning throbber, ala Firefox, to indicate an on-going operation.

The Object should be constructed and used only once, create a new Throbber with the `new` keyword
to start the throbber again.

----------------------------

## Include

`#include <tui/Throbber.js>`

-----------------------

## Provides

* tui.Throbber


## Constructor

The constructor takes two, optional,  arguments.

    var progress = new tui.Throbber(text, unicode);
    
### text 

The text to be displayed in front of the spinning icon.

### unicode

When `true` unicode characters are used to render the throbber, when `false` ascii characters are used.

-----------------------

## Attributes

### text

The text to be drawn before the spinning icon.

### asciiGlyphs 

The character used for the throbber in ascii mode `['\\', '|', '/', '-']`.

the glyphs can be changed but there must be 4 provided.

### unicodeGlyphs 

The characters used for the throbber in unicode mode `['·',  '✶', '❆', '✺']`

-----------------------

## Methods

### render

Draw the throbber untill the function argument returns `true` indicating the throbber can stop.


    throbber.render( function() {

        return new File("flag.file").exists;
 
    } );.

    
