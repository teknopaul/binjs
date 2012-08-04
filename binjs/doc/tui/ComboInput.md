# ComboInput

Provides similar functionality to a combo box widget.

Combo allows the user to selectan option froma list on screen.  The size of the list should fix on screen or an exception is thrown as scrolling is not supported.  Theuser makes the selection with the arrow keys moving the cursor up and down.

----------------------------

## Include

`#include <tui/ComboInput.js>`

-----------------------

## Provides

* tui.ComboInput

## Constructor

The constructor takes a single argument an array of any object type that are the options to select from.

    var input = new tui.ComboInput();

-----------------------

## Attributes

-----------------------

## Methods

### select

Call `select()` to get the user input. A String is returned that may be null in error conditions.

    
    

