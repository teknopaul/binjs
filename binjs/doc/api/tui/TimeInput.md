# TimeInput

Sublasses tui.Input and only permits time to be entered in the form `00:00`.
This input class only validates the String is in the correct form not that the time is valid.
i.e. `25:99` is permitted and should be validated by the user.
Future versions of this class will be more strict with user input.

----------------------------

## Import

`binjs_import("~lib/tui/TimeInput.js");`

-----------------------

## Provides

* tui.TimeInput

## Constructor

The constructor takes no arguments.

    var input = new tui.TimeInput();

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

Same as parent class.

### readline

Call `readline()` to get the user input. A String is returned that may be `null` in error conditions.

-----------------------

## Usage

    #!/bin/js
    binjs_import("~lib/tui/TimeInput.js");

    var tinput = new tui.TimeInput();

    $.println("Enter a time in the fomrat 00:00");

    var time = tinput.readline();
    
    