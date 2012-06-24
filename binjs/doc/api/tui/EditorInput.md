# EditorInput

A class that follows the tui style but launches vi or the users preferred text editor to fetch input.
----------------------------

## Import

`binjs_import("~lib/tui/EditorInput.js");`

-----------------------

## Provides

* tui.EditorInput

## Constructor

The constructor takes one arguments, the default text to be placed in the editor.

    var input = new tui.EditorInput(defaultText);

-----------------------

## Attributes

### editor

The path to the text editor to be run, defaults to /bin/vi.
When the object is constructed the constructor checks for the existence of `/usr/bin/editor`, which Ubuntu uses as the default editor and may redirect to vi or any other editor.
If the user has specified an editor of preference in the `EDITOR` environment variable that editor is used.


-----------------------

## Methods

### edit

Returns the text created by the user in the editor.  This method returns a number the error code if there was an error.  If the text has not be changed by the user the method also returns a number.
