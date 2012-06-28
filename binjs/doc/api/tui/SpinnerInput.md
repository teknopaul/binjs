# SpinnerInput

Maeks a list of options selectable  with upa nd down keys without the use of a cursor, display is only on one line, as the navigation keys are pressed the list is scrolled through.

----------------------------

## Import

`binjs_import("~lib/tui/SpinnerInput.js");`

-----------------------

## Provides

* tui.SpinnerInput

## Constructor

The constructor takes one argument, an array of any type of Object.

    var input = new tui.SpinnerInput(options);

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

### select

Call `select()` to get the user input. The selected object is returned that may be null in error conditions.

