# Input

Base class for various Text input types, which accept user input from the console.

This calss can be constructed on its own and manipulated to control user input.

----------------------------

## Include

`#include <tui/Input.js>`

-----------------------

## Provides

* tui.Input

## Constructor

The constructor takes no arguments.

    var input = new tui.Input();

-----------------------

## Attributes

### text

The text being entered. Default `""`

### returnOnEnter

Finish accepting input when the Enter key is pressed, default `true`.
When `false` only double hitting `ESC`, or terminating the program retuns from input,

###  acceptTabs

Tabs are swallowed by default, turn this on if you want to accept `\t` as part of the input.

### acceptNewLines

To accept new lines in input set this flag to true and to enter the new line type Shift + Enter.
When shift + Enter is pressed a `\n` charanter is added to the text and the user can continue editing.
Delete does not go back over new lines, so for a full featured multi-line editor launch the system editor.
the `tui.EditorInput` launches the system enditor.

### filter

A function that can reject characters of input,  this method is called with a singel argument, the character typed for
every keypress (if the function exists).  If the function returns `false` the keypress is rejected and the
character is not typed on screen.

### validator

If this function exists it is called when input is finished by pressing Enter, if the function returns `false`
The editor does not return.  `tui.ValidatedTextInput` is a more convenient use of this feature with 
visual feedback when validation fails.

-----------------------

## Methods

### readline

Read a line of text input from the user.  Returns the text entered or `null` in some error conditions.

