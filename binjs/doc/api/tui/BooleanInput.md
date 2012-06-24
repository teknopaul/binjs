# BooleanInput

Sublasses `tui.Input` and only permits `y` or `n` to be entered by the user.

----------------------------

## Import

`binjs_import("~lib/tui/BooleanInput.js");`

-----------------------

## Provides

* tui.BooleanInput

## Constructor

The constructor takes no arguments.

    var input = new tui.BooleanInput();

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

### ok

Returns a boolean true or false from the user input.

-----------------------

## Usage

    #!/bin/js
    binjs_import("~lib/tui/BooleanInput.js");

    var input = new tui.BooleanInput();

    $.println("Are you ready? [y/n]");

    var bool = input.ok();
    
    