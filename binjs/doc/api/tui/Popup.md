# Popup

Popup text, a text bubble with some additional info for the user.

    ╔══════════════════════════╗
    ║Enter the time in the     ║
    ║format hh:mm              ║
    ╚═══╦══════════════════════╝

Text and outline can be formatted with the modifers used by `$.print()`.

The popup attemts to stay out of the way of the cursor, either below if the cursor is at the top of the screen or above if the cursor is at the bottom of the screen.  If the popup does not fit on screen it will not show, if you prefer, you can cause the popup to throw exceptions when it does not fit.

----------------------------

## Import

`binjs_import("~lib/tui/Popup.js");`

-----------------------

## Provides

* tui.Popup

## Constructor

The constructor takes three arguments, the text displayed, the text formatting modifier and the line formatting modifier.

    var popup = new tui.Popup("OiOi!", true, 'red');
    popup.render();

-----------------------

## Attributes

### text

The text to display.

### textFormat

The text formatting modifier as used by `$.print()`, i.e. `true` for bold or a string with a lower case color.

### lineFormat

The text formatting for the line characters.

### heightOffset

How far above or below the popu is rendered from the current cursor position, defaults to 2 rows.

### throwOnError

When `true` if the popup text is too large for the users screen size an exception will be throw, by default `false` so the exception is swallowwed and the popup is not shown.

-----------------------

## Methods

### render

Draw the popup to the console.

    
    