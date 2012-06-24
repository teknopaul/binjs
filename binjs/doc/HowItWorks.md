 
# How it works

The /bin/js mash-up is achieved by preparsing the script and deciding for each line if it needs to be interpreted as JavaScript or Bash.  /bin/js uses the chrome v8 JavaScript runtime and some C++ libraries, Bash 4.2 hacked and compiled as a library with its features exposed as C functions, and a preparser written in C.

If this is a /bin/js script

    #!/bin/js
    #
    cat "${HOME}/apache.log" | tail -20 | awk ' {print $7}' | tee.tail.log

The preparser generates valid JavaScript in the form

    binjs_import("~lib/binjs.js");
    //#
    binjs_exec("cat \"${HOME}/apache.log\" | tail -20 | awk \' {print $7}\' | tee.tail.log");

The JavaScirpt is then piped to v8.

When `binjs_exec()` is called the argument to the method is passed as text to an embedded instance of bash.

The `binjs_import("~lib/binjs.js");` line sets up the internal bash instance and a File object and some other bells and whistles.

## Checking the preparser output

You can call

    cat myScript.bjs | /bin/binjs_preparser

to see what the preparser is outputting.  This will print on stdout the JavaScript that would be piped to v8 by /bin/js.



