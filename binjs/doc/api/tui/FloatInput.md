# NumberInput

Sublasses tui.Input and only permits digits and decimal points to be entered by the user.

----------------------------

## Import

`binjs_import("~lib/tui/FloatInput.js")`

-----------------------

## Provides

* tui.FloatInput

## Constructor

The constructor takes no arguments.

    var input = new tui.FloatInput();

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

Same as parent class.

### readline

Call `readline()` to get the user input. A String is returned that may be null in error conditions, otherwsie cane be parsed to a float.

-----------------------

## Usage

    #!/bin/js
    binjs_import("~lib/tui/FloatInput.js");

    var input = new tui.FloatInput();

    $.println("Enter a number");

    var text = input.readline();
    
    