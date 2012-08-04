# Style Guide

/bin/js preparser has some quirks that make following a regular style advisable, this page outlines the recommended way to write /bin/js scripts.

The style guides is essentially based on JavaScript "normal" usage as defined by the built in APIs that come with JavaScript.  Built in functions e.g. `parseInt()` user camelCase with a lower case first letter and in /bin/js you are strongly encouraged to do the same because certain use of UpperCase first letters is used to signify interpolation with the bash environment. Essentially this is Java/JavaScript conventions rather than C or C++ conventions.

## Semis

Don't suffix bash command lines with semi colons, do suffix JavaScript with semis as if the code were Java. This is not an arbitrary decision see [Parser rules](ParserRules.html)

## Comments

Use the comment style of the language for the line being commented. Avoid `/**` multiline comments.

    // XML Parser
    var dom = new Dom();
    
    # install dir
    INST=/opt/scripts


## Prototype Object Syntax

Avoid the JSON object syntax in /bin/js scripts. The following syntax does not work in /bin/js because the preparser does not know of `foo` or `funk`.

    var obj = {
        foo : "bar", // bug
        funk : function() {   // bug
            return foo; 
        }
    }

Use the prototype syntax for defining objects.

    var Obj = function() {
       this.foo = "bar;"
    }
    Obj.prototype.funk = function() {
        return foo;
    }

Create instances with `new`.

    var obj = new Obj();

This style of JavaScript is perhaps not your personal style but will pay dividends in /bin/js scripts since the preparser is designed to work only with this style.  `this` is recognised by the preparser so code inside objects benefits from this style.

The code in the example `/usr/lib/binjs/examples/api/term/star.bjs` is a good example of /bin/js scripts that appear to be natural JavaScript.

## Variable names

JavaScript and bash allow variables to be both upper and lower case but in /bin/js scripts the following guidelines will make life much easier.

Use UPPERCASE variable names in bash, this is pretty much the standard and all env variables in Fedora are uppercase.

UPPER_CASE variables in the global JavaScript scope are copied to the bash environment if they are Strings.  So declare all such variables at the start of the script as Strings in JavaScript and avoid putting other data types into variables with Uppercase first letters. Avoid completely variables with UpperCase CamelCase since it will be confusing when these are transferred to the bash environment.  Use uppercase JavaScript variables only for global variables that will be used bash.

    #!/bin/js
    // includes ...
    
    var FILE_NAME = "";
    var DIR_NAME = "";

Use camelCase with a lower case first letter for all other JavaScript variables.  These will not be copied to Bash. Be aware that `gi,gj & gk` break this rule.
Uppercase function names are discouraged as are Uppercase non-string types.

## Script size

Keep the size of the /bin/js scripts down. /bin/js is designed to be a scripting language, not a full blow application developer framework. If you notice your /bin/js scripts covering thousands of lines of code it is probably time to refactor some of the code to a library.  
Large amounts of code are better written in JavaScript.

## Global scope

Use the global scope. Generally in JavaScript one is discouraged from using the global scope. In a browser and nodejs code this makes sense since there is a lot of opportunity to make mistakes by importing code that conflicts.  /bin/js scripts are single threaded with generally straight code paths and are tightly integrated to bash.  Since /bin/js only copies vars form the global scope to bash it is a lot simpler to work exclusively in the global scope and avoid confusion when calling bash from a scope that has overridden variables that are not being propagated to bash..

    var MY_VAR = "xxx";
    
    function op() {
        MY_VAR = "yyy";  // obvious what is going on
        var OTHER_VAR = "xxx";
        $.setEnv("OTHER_VAR", OTHER_VAR);  // confusing, this works but 
                                           // OTHER_VAR is not automagically 
                                           // transferred to bash, move 
                                           // OTHER_VAR to the global scope.
                                           // delete the $.setEnv() line
    }

Use a "g" prefix if you are going to use the watch list.

## Declarations before functions

JavaScript will let you declare variables in many places but in /bin/js scripts you should tend towards declaring variables at the start of the script. Global variables should be declared before functions. The following example would be valid JavaScript but does not behave the same way in /bin/js.

    var MY_VAR = "xxx";
    var MY_FILE = "/tmp/foo";
    
    function op() {
        var fle = new File(MY_FILE);
        MY_WRONG = "bar";  // bug, preparser treats this as bash
    }
    
    var MY_WRONG = "quxx";
    
    op();

Remember `cat myscript.bjs | /usr/lib/binjs/bin/binjs_preparser` will enable you to debug the work of the preparser.
By declaring uppercase strings at the start of the file, such confusion is avoided.

## Don't write JavaScript if bash will suffice

/bin/js allows you to call all the wonderful CLI tools of Linux with zero effort. There is no need to rewrite these tools in JavaScript. With nodejs and other JavaScript tools you would need to create a library to interface with a tool such as sqlite. With /bin/js you just use the command line directly inside your scripts.

    #!/bin/js
    # import nothing at all
    sqlite3 test.db 'CREATE TABLE EXAMPLE(id INTEGER, name VARCAHR(32))'
    sqlite3 test.db "insert into example values (0, 'teknopaul')"
    sqlite3 test.db 'select * from example'

If you plan to make a lot of use of sqlite you might wish to create a library and encapsulate functions. But be aware that the command line is always available and often provides immediate results when a library would involve more investment of time.  If you do invest the time in a library please submit it so others can benefit from your investment.

## Avoid preparser hints

You will see in the test code and example use of `if (true) ...`  and  `echo "" &&` to force the preparser to interpret a line as JavaScript or bash.  This is only useful for example code to illustrate a point, generally it should be avoided.  If you declare your variables with var early, use the global scope and Prototype Object syntax you will rarely find situations where this is needed.

# Style guide for libraries
    
See [Including JavaScript](IncludeJavaScript.html)

