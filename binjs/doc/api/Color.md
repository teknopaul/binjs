# Color

Definitions for constants for coloured output on the terminal.

The Color object provides constants for making text appear coloured on the command line, color should be turned off after it is used.

    $.println("something " + Color.RED + "really" + Color.COLOR_OFF + " important");

The `$.println()` method uses constants from this class, accepts strings and is potentially more convenient.

    $.println("something important", 'red');
    
----------------------------

## Include

You do not have to include this library it is included by default.

---------------------------

## Provides

* Color

---------------------------

## Constructor

This class should not be constructed.

---------------------------

## Attributes

Color.BLACK   = "\033[30m";

Color.WHITE   = "\033[97m";

Color.GREY    = "\033[37m";

Color.DARK_GREY= "\033[90m";

Color.BLUE    = "\033[94m";

Color.GREEN   = "\033[32m";

Color.RED     = "\033[91m";

Color.YELLOW  = "\033[93m";

Color.CYAN    = "\033[36m";

Color.MAGENTA = "\033[35m";

Color.ORANGE  = "\033[33m";

Color.COLOR_OFF = "\033[0m";

Thes constants are provided for bold "font" and underlined text.

<b>Color.BOLD</b>      = "\033[1m";

<u>Color.UNDERLINE</u> = "\033[4m";

And blink can be set to timewarp yourself back to 1975.

<blink>Color.BLINK</blink>     = "\033[5m";


---------------------------

## Methods

### Color.disable()  

Turn off coloured output by setting all the constants to the empty String "".

### Color.enable()

Turn colouring output back on.
