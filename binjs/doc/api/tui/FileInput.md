# FileInput

Sublasses tui.Input and accepts any text but additionally provides tab completion for files and directories.

The interface is not exactly the same as bash tab completion but is close enough. Future versions may provide a closer match to bash's features.
Entering a tilde `~` and pressing tab expands to the user's home directory, but other tilde expansions are not supported.

----------------------------

## Import

`binjs_import("~lib/tui/FileInput.js");`

-----------------------

## Provides

* tui.FileInput

## Constructor

The constructor takes no arguments.

    var input = new tui.FileInput();

-----------------------

## Attributes

Same as parent class.

-----------------------

## Methods

### readline

Call `readline()` to get the user input. A String is returned that may be null in error conditions.

### requireFile

If this method is called, prior to calling readline, the user is not permitted to continue until a valid existing file is entered.  The text flashes red if the current text is not an exisiting file.  the user need not have read access tot he file but must be able to traverse all the directories up to the path for the file to be accepted.

### requireDir

If this method is called, prior to calling readline, the user is not permitted to continue until a valid existing directory is entered.  The text flashes red if the current text is not a directory.

-----------------------

## Usage

    #!/bin/js
    binjs_import("~lib/tui/FileInput.js");

    var input = new tui.FileInput();

    input.requireDir();

    $.println("Enter a directory");

    var text = input.readline();
    
    
