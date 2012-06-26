# DateInput

Sublasses tui.Input and only permits date to be entered in various forms. this is currently quite basic validation. Validation is not very strict, dates must be numbers in the form `xx` delim `yy` delim `zz` where delim is any of `" " / \ - .` Subseqeunt code should determine which order the integers come in, be it European or US format.

----------------------------

## Import

`binjs_import("~lib/tui/DateInput.js");`

-----------------------

## Provides

* tui.DateInput

## Constructor

The constructor takes no arguments.

    var input = new tui.DateInput();

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

### readline

Call `readline()` to get the user input. A String is returned that may be `null` in error conditions. After this method has returned the following getters are available.  This method returns the String exactly as entered by the user, there is no obligation to use the formatting methods that follow.

### getEuroDate

Returns a date object assuming the format dd.mm.yyyy with any delimiter.

### getUSDate

Returns a date object assuming the format mm\dd\yyyy with any delimiter.

### getTechDate

Returns a date object assuming the format is yyyy-mm-dd with any delimiter.

### getDateParts

Returns an array of 3 integers.

-----------------------

## Usage

    #!/bin/js
    binjs_import("~lib/tui/DateInput.js");

    var dinput = new tui.DateInput();

    $.println("Enter a time in the format yyyy.mm.dd");

    var string = dinput.readline();
    var date = dinput.getTechDate();
    
    