# ValidatedTextInput

Sublasses `tui.Input` to accept text entered by the user but validated by a function provided by a script.

----------------------------

## Include

`#include <tui/ValidatedTextInput.js>`

-----------------------

## Provides

* tui.ValidatedTextInput

## Constructor

The constructor takes the function to validate the text as its only argument.

    var input = new tui.ValidatedTextInput( function () {
    
        return /^[a-z0-9_-]*@mycompany.com$/gi.test(this.text);
        
    });

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

Same as parent class.

### readline

Call `readline()` to get the user input. A String is returned.

-----------------------


    
    
