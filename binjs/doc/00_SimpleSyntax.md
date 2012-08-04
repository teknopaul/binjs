# Simple Syntax

A quick introduction to /bin/js syntax.

/bin/js scripts are a mash-up of JavaScript and bash.

Simple bash code is valid

    #!/bin/js
    #
    #  My first /bin/js script
    #

    echo Hello World

Simple JavaScript code is valid.

    #!/bin/js
    //
    // If you prefer use JS style comments
    //

    for (var i = 0 ; i < 23 ; i++) {

        $.println("Hello World");

    }

And you can mash-up both.

    #!/bin/js
    /**
     * Another comment style
     */

    for (var i = 0 ; i < 23 ; i++) {

        echo Hello World

    }

Pipes and redirects and all the wonders of bash one-liners are available.

    #!/bin/js

    cat "${HOME}/apache.log" | tail -20 | awk ' {print $7}' | tee.tail.log

All the beauty(ehem) of C style syntax from JavaScript is available.

    #!/bin/js
   
    ...
  
    switch (opt) {

        case 1 : {
            doThing();
            break;
        case 2 :
            echo found a wrongun >> errs.log
            break;
        default :
            $.error(10, "Unknown option");
    }    

`switch` statements, `if/else`, `while` loops, `do/while` loops, `try/catch/finally` and others from JavaScirpt are used, since the bash ones are ugly.  

The pipes and redirects and the trailing `&` from bash are used.

## Simple Usage

/bin/js syntax should be pretty straight forward if you write JavaScript and are used to working with Linux. 
The goal is that syntax should be completely natural for developers who are comfortable with C style languages such as JavaScript, C, C++, C# or Java, and work on the bash command line.

The general rule with /bin/js syntax is that each line of the file is interpreted as either JavaScript OR a SINGLE line of bash, but not both.

Thus you can not write

    if (true) echo Hello World

You have to write the statements on separate line

    if (true) {
      echo Hello World
    }


Var statements and functions must be written on a single line.

    var myVal = new Object();

    function myFunc() {

        echo Hello World

    }

Variable defined this way with `function` or `var` are then known to the parser and can be called as JavaScript

    myVal.attribute = 23;
    myFunc();

Dropping the `var` statement is NOT supported

    globalVar = 23;  // wrong, missing vars

Mutli-line vars are NOT supported

    var i,j,k;       // wrong only i is known

In short if you dont create a `var` or a `function` with the `var` and `function` statements at the start of the line you can not call them.

    if (true) var funk = function() {return true;}

    funk();   // wrong, parser does not know about "funk" so it is interpreted as bash

Just remember, each line is interpreted as EITHER JavaScript OR Bash by a preparser which sends the lines to the correct interpreter.  The preparser never compiles the code, it just peaks at the front of the line to see weather v8 or bash should compile it.

Full details of the parser rules are in the `ParserRules.md` file.

You can always call

    cat myScript.bjs | binjs_preparser

To see what the preparser is outputting.

