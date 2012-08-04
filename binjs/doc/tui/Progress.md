# Progress

A progress bar, to indicate progress in an on-going operation.

The Object should be constructed and used only once, create a new Progress with the `new` keyword
to start the progress again.

----------------------------

## Include

`#include <tui/Progress.js>`

-----------------------

## Provides

* tui.Progress

    `Downloading...    [****      ]`

## Constructor

The constructor takes two arguments, the text displayed when the progress is ongoing and the text displayed when progress has fiinished, or the `done()` method is called.

    var progress = new tui.Progress(progressText, doneText);

-----------------------

## Attributes

### max

The maximum value, default `10`.

### min

The minimum value, default `0`.

### bar

The caracter used for the progress bar, default `*`.

### space

The character used for the background of the progress bar, default a space character `" "`.

-----------------------

## Methods

### render

Draw the progressbar to the console.

### tick

Move the progress on one point, from min towards max.

### done

Mark the progress as finished. This method iscalled when `tick()` has been called (max - min) times, but can be called earlier if desired.





### readline

Call `readline()` to get the user input. A String is returned that may be null in error conditions, otherwsie cane be parsed to a positive or negative integer.

-----------------------

    
    
