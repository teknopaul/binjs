# Exceptions

Bash has exception handling limited to returning error codes, JavaScript supports `try` , `catch` and `finally` syntax. /bin/js merges the two providing bash style error return codes and exceptions that can be thrown from bash commands and caught in JavaScript.

## throw

Generally to trap an error in a bash script the idiom is to OR an exit commant to the command line so that the script is interrupted if the line being executed fails.

    ./callScript.sh || exit 3

This enables a script to bomb out before it does any damage if there is an unexpected error, but its not very elegant.  JavaScript code can wrap a block of code with a try/catch block and exceptions can be thrown. /bin/js provides a mechanism by which bash commands can integrate error handling with JavaScript.

    ./callScript.sh || throw "script failed"

Throw is a bash builtin that has been added to facilitate integrating JavaScript and bash error handling.  The syntax is similar to the exit idiom but when the throw is called a JavaScript `Error` object is created with the String as its message and can be caught later in the script.  Notice that when the bash builtin `throw` is called a String is provided and the builtin creates the `Error` object, but when JavaScript exceptions are thrown the script should specify the `Error` explicitly.

    try {
    
        ...
        
        ./callScript.sh || throw "script failed"
        
        ...
        
        logevent 23 || throw "logging failed"
        
        ...
        
        if (jsError) { 
            throw new Error("JavaScript error");
        }
        
    }
    catch(error) { // object caught is a JavaScript Error
		$.error(1,"Exception caught", error.message);
    }

You can throw JavaScript Strings or other Objects as you might in any JavaScript code but this makes integrating exception handlers with bash exceptions more difficult since there is, currently, no way to make the bash builtin throw anything other than an Error Object containing a String message.

N.B. the throw builtin can only be used in a bash statement at the end of the command (after || ), because the preparser determins `throw` at the start of a line to be JavaScript.

## errno

The typical error handling mechanisn for a bash script is to check the `$?` variable, which is the last exit value of a command run by bash.  Since `if` and `switch` statements are handled by JavaScript in /bin/js the `$?` value is copied to the global `errno` variable which provides a code pattern that should be familiar to C developers, where `errno` is common.

    ./someScript.sh

    switch(errno) {
        case 0 : {
            echo all OK
        }
        case 1 : {
            throw new Error("File not found");
        }
        case 2 : {
            throw new
        }
    }

Nothing needs to be imported for `errno to be populated in /bin/js scripts. `errno` is always populated unlike C code where the errno.h header must be imported to make errno available.
