# NumberInput

Sublasses `tui.Input` and only permits digits to be entered by the user.

----------------------------

## Import

`binjs_import("~lib/tui/NumberInput.js");`

-----------------------

## Provides

* tui.NumberInput

## Constructor

The constructor takes no arguments.

    var input = new tui.NumberInput();

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

Same as parent class.

### readline

Call `readline()` to get the user input. A String is returned that may be null in error conditions, otherwsie cane be parsed to a positive or negative integer.

-----------------------

## Usage

    #!/bin/js
    binjs_import("~lib/tui/NumberInput.js");

    var input = new tui.NumberInput();

    $.println("Enter a number");

    var text = input.readline();
    
    