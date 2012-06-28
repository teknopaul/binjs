
# /bin/js Parser Rules

Full details of the rules used by the preparser preparser defining /bin/js syntax.

Each line of the #!/bin/js script is interpreted as JavaScript OR bash. 

## Overview

The script is interpreted line by line determining if each line is JavaScript or an embedded bash command. The idea is much like embedded SQL, /bin/js is bash embedded in JavaScript.

Thus, the following line is NOT possible, since it would be both bash and JavaScript.

    if (true) cp file1 file2

Correct syntax must have the JavaScript and bash on separate lines.

    if (true) {
      cp file1 file2
    }

Any developer familiar with Javascript and bash should be able to immediatly determine which line is Javascript and which is bash from reading the code. When writing the code, the rules to determine the language must be known. Some code could be both valid JavaScript and bash to look at, this document defines the rules the preparser has for determining the language of each line.

JavaScript and bash are fairly flexible with syntax rules, /bin/js is less flexible, this enables the preparser to determine the language.

## JavaScript tokens

Reserved tokens determine that a line is JavaScript, there are not many tokens and they should be familiar.
N.B. JavaScript tokens often overrides bash builtins.

### If

If a line starts with `if` it is treated as JavaScript. Leading whitespace is ignored when reading the first token on the line.

 * if 		- Thus bash `if` is not interpreted by bash ever. JavaScript `if` syntax uses `()` and `{}` as you would expect it to.
 * else		
  
### JavasScript looping is used

JavaScript loops and crontrol is prefered over bash loops since K&R got there first (and JS it is much prettier).
If a line starts with one of these tokens it is treated as Javascript.

 * for		- Thus no bash for loops
 * while	 
 * do 		 
 * case		 
 * break	
 * continue
 * default
 * delete
 * return
 * switch
 * with
 * in

### `try/catch` statements are treated as JavaScript

 * try
 * catch
 * finally
 * throw
  
### Functions

Only JavaScript functions are allowed

 * function	- at the start of the line marks the line as JavaScript thus bash function is not permitted.
  
### Variables

Both bash environment variables and JavaScript variables are supported since the syntax is distinct.

To define a JavaScript variable use `var` as a prefix, with a space. A semicolon to terminate the line is required by /bin/js, even if not by JavaScript.

    var x = false;

var is obligatory. A JavaScript variable `x` is created with a boolean `false`.

To define a bash environment variable there is no var keyword, no spaces and no semicolon, exactly as you would in a bash script.

    x=true
    
No white space is permitted per bash rules. An environment variable `x` with string value `"true"` is created.
  
### Pre-existing variables

    x = true;

If `x` already exists as JavaScript variable which the preparser is aware of, an assignement is treated as JavaScript. JavaScript takes priority and `x` is set to boolean `true`.
If `x = true` is written when `x` is not a JavaScript var already, it is an error, since the line is treated as bash and bash does not support the whitespace. 
It is important to realise that variables assignements are only treated as JavaScript if the preparser already knows about the variable.

    var x = false; // preparser learns about `x` from the `var` statement 
    x = true;      // preparser knows to treat `x` as JavaScript
    y = true;      // error, preparser does not know about `y`.
    this.y = 23;   // `this.` is always treated as JavaScript

Since variables may be created in included files or outside the view of the current script a naming convention is useful. It is highly recommended that all JavaScript variables start with a lowerCase letter and follow camelCase conventions and that all bash environment variables are UPPER\_CASE with underscores. Static String variables created in JavaScript can be made available to bash so it is recommended they follow bash conventions.

    var JS_STATIC_VAR = "My String";

### Other JavaScript keywords

Lines starting with the following keywords are interpteted as JavaScript.

 * new
 * return
 * blank lines
 * this 
 * instanceof
 * typeof

The following are little used but also mark the line as JavaScript.

 * goto
 * void
 * debugger

### JavaScript Objects

JavaScript Objects like String do NOT mark the line as JavaScript.
  
 * Number.toFixed(23.0);  		- Wrong, sent to Bash as a syntax error, and useless anyway.

 * var s = Number.toFixed(23.0);	- Correct, N.B. it is the prefix `var` that defines the row as JavaScript.

Global functions from JavaScript also do NOT mark the line as JavaScript.

 * parseInt("23");			- Wrong, sent to Bash as a syntax error, and useless anyway

 * var i = parseInt("23");		- Correct, N.B. it is the prefix `var` that defines the row as JavaScript.

### Reserved tokens

Some tokens are reserved by the /bin/js interpreter and strictly speaking are neither JavaScript or bash and
should never be used at the start of a line.
   
 * #!/bin/js	- The first line is treated as a shebang, it is NOT optional, and it must be the first line.
 * exit		- `exit` performs a bespoke exit in C (neither JS nor bash) and is covered separatly.
 * binjs_	- Any token that starts `binjs_` is reserved for current or future use. Technically, in some versions, you can write `binjs_exec("ls -l");`  but this defeats the object of scripting in /bin/js and is not guaranteied to be compatible with future versions.
 * \		- Lines may not start with a forward slash `\`.
 * $.		- `$` is a valid JavaScript variable prefix but is reserved for /bin/js usage, sorry jQuery fans. Using it would make the code ugly since it is the marker for bash vars anyway. Since it is typical to start a bash line with `$CMD` `$` itself is NOT treated as JavaScript only `$.` is JavaScript.

Some other JavaScript objects are reserved for future use.

 * global
 * binjs
 * js
 
Any curly bracket on a line with nothing else but whitespace is treated as JavaScript.

 * {		- K&R style functions or { on its own line are thus both supported.
 * }		- Closing curly brackets should always be on a new line.
  
e.g. You can use K&R functions like

    function my_func()
    {
      cp file 1 file2
    }

or Java style like

    function my_func() {
      cp file 1 file2
    }

As you should know by now, each line is processed as one language or the other so the following is wrong.

    function my_func() {
      cp file 1 file2 }

### Comments

 * #	- Lines starting with `#` are re-commented with `//`, the JavaScript comment, by the preparser. Thus lines starting with `#` are niether JavaScript nor bash.
 * //	- JavaScript line comments are treated as JavaScript.
 * /**/ - Multiline comments are treated as JavaScript, but not recomended, code is less error prone if each line
	  individually expresses itself.

### Long Strings

Long strings sometimes need to be broken up in JavaScript, the `+` operator marks a line as JavaScript to facilitate this.

    var myStr = "something "
                + "that is not obvious "
                + "is that + at the end of the line "
                + "would not work.";
      
Notice that you can not place the `+` operator at the end of the line.

### Existing variable known to the preparser
      
Existing JavaScript objects and functions mark a line as JavaScript which should be natural when used normally.

    var x = new Object();
    x.callFunc();  // `x` is known as JavaScript and thus interpreted.

    function funk() { 
      return true; 
    }
    funk();  // `funk` is known as JavaScript and thus interpreted.

It is the pre-parser that records existing variable not the JavaScript interpreter, so only variable created on a new line with `var` are known to the interpreter.

    var x,y,z;
    y.att = 1234; // `y` is NOT known as JavaScript variable by the pre-parser

Thus each variable should be on its own line with its own `var` statement.

    var x;
    var y;
    var z;
  
Multi-line assignments could theoreticallly be fixed in a future version so do not rely on this and always use UPPER_CASE unique varable names for bash variables.

    var x,y,z;
    y=my_file.tar        // may behave differently in a future version
    
Using lower case variables for bash in /bin/js is likely to confuse those that read your code and future versions of the preparser, so dont.
    
Similarly, you should avoid silly variable names that clash with what might appear to be a bash command.

    var cp = new Object();
    cp .file  .otherfile   // `cp` exists as a JavaScript variable known to the preparser

In the above case `cp` is intepreted as JavaScript and the code breaks, `cp` was a pretty stupid name for a variable even if it was made to work. There is nothing to stop you creating bash variables called `mv`, `cp`, `tar` and other such nonsense except your own sense of what is fair to your fellow man.

### Everything else is bash

Any line not determined to be JavaScript by the above rules is treated as bash.

Any line starting with the token `echo ` is always interpreted as bash.

### Line continuation

As with bash, any line that starts to be interpreted as bash and is terminating in `\` and a new line `\n` 
results in the following line being treated as a continuation of the current line.

    cat file1 \
        file2 \
        file3 > output.txt

Unfortunalty no such rule is available for JavaScript and since by default unknown lines are treated as bash, thus long Javascript lines cause errors.

The following does not work.

    if (
      clause1 &&
      clause2 &&
      clause3
    ) {
      cp file file
    }

N.B. the following might work for the wrong reasons, if each clause were correctly defined with `var` statements. However this is strongly discouraged since in most situations multi-line Javascript statements fail.

    if ( clause1 &&
         clause2 &&
         clause3 ) 
    {
      cp file file
    }

The following is correct.

    if ( clause1 && clause2 && clause3 ) {
      cp file file
    }

Those of you that code in vi with an 80 char window width, no word wrap and are used to code with forced line lengths should get strict about terminating with semicolons and turn on visible line breaks! The general rule is that long lines with dynamic word wrapping is preferred, however the following conveniences are provided.

 * Lines starting with `&` or `|`  are JavaScript, since they can not be bash.
 * Lines starting with `(` or `)` or `+` are JavaScript, despìte being valid bash.
 
This enables multi-line JavaScript constructs as follows

    if ( clause1
         && clause2
         && clause3 ) {
      cp file file
    }

    if ( clause1
         || clause2
         || clause3 ) {
      cp file file
    }

    var flags = VERBOSE 
              | LARGE
              | SILLY
              | COMPLEX;

    var sqlString = "SELECT "
                  + "name, email "
                  + "FROM contacts"
                  + "WHERE name = ?";

Multi-line JavaScript of this form is considered bad form and generally frowned upon in the world of /bin/js since it implies to noobs that trailing `+` opr `&` or `|` might work, they dont, and never will.  But it is hopefully obvious why this is needed for setting up very long constants.


### Assorted wierd rules

### Randomly banned stuff

The following rules apply to encourage you to write legible scripts.

 * Lines starting with `[` or `]` are errors (despite being valid JavaScript and Bash)
 * Lines starting with `"` or `'` are errors (despite being valid JavaScript and Bash)
 * Lines starting with whitespace then `#` are errors

### Curly bracket rules

JavaScript blocks must be terminated with `}` on its own line.

    if (x == true) {
      echo hello }   // wrong } sent to bash and is a syntax error

    if (x == true) {
      echo hello 
    }   // correct

You may be able to break these rules in a given version of the preparser but you should not do so for forward combatability.

    if (x == true) { y=23 }   // wrong, but may not be validated, 
                              // may run as JavaScript and may 
                              // do wierd stuff in a future version.
     
    if (x == true) { 
      var y = 23; 
    }   // correct and will work in future versions
    
    if (x == true) { 
      Y=23
    }   // correct and assignement is bash as a string


### Forcing interpretation

If you are really stuck and need to force a line to be bash write

    echo "" && goto       - runs a program called `goto`

And conversly to force a line to be JavaScript write

    if (true) SomeStupidFunction(); 

tries to execute as a function `SomeStupidFunction`, despite the fact that `SomeStupidFunction` has not been defined properly (perhaps in a bespoke library).

These two tricks will work currently, they should not be necessary, but since in JavaScript functions can be defined any where you can get yourself in a mess. So `if(true)`  and `echo "" &&` will always be available as a get out clause.


### Hidden functions and variables

if, instead of using 

    function normalFunction() {
       ...

you write

    if (x = 1234) normalFunction = function() {}

It might well execute,  but you can not execute 

    normalFunction();

since the PRE-parser does not know about the function and assumes it is a bash statement.

The same "feature" applies to vars.

    var x,y,z; 			// y and z know to JavaScript but not to the pre-parser
    if (true) var x,y,z;  	// x, y and z know to JavaScript but not to the pre-parser
    { var x,y,z };  		// x, y and z know to JavaScript but not to the pre-parser
    
Avoid this kind of mess, keep things simple and stick to simple JavaScript syntax.

If you need much more complicated JavaScript structures you should probalby be using nodejs.

Skipping `{}` is strongly advised against and may not work in future versions

    if (true)
      cp file1 file2

### bash is interpreted line by line

All bash is interpreted line by line, so the old `EOF` trick is not avaialble in /bin/js. The following with NOT work as expected.

    yum install $1 << EOF
    y
    EOF

You can do other tricks

    cat yesfile.txt | yum install

You can always export the code to a bash script and call it

    ./do_yes_yum.sh


### Semicolons

It is strongly recommended to terminate JavaScript lines a semicolons, and to not terminate bash lines with a semicolon. This in itself makes the code more simple to read. Typically bash script lines are not terminated with semis, the JavaScript community is divided on the issue but in C and C# and JavaScript semis are required so it should be natrual to see code lines terminated with semis. 
/bin/js files are stricly neither bash nor JavaScript syntax so I get to call the shots :). The semis recomendation might start a flame war, but it stands as the recomendation, code may or may not work with or without semis since often code is passed directly to the bash or JavaScript intepreter without checking the end of the line.  If I'm feeling nasty I might hard code the necesity for semis in JavaScript in a future versions so watch out! There are no extra requirements for semis than where JavaScript permits them. For example, it may be required, in a future version to terminate with semis so that certain types of JavaScript line continuation or JSON notation can be accuratly determined.


### Permitted characters in a JavaScript var

A JavaScript var name in the form

    var xxx = true;

has more complicated rules that that of C since many Unicode tokens are permitted.

e.g. in JavaScript  the symbol for Pi is permitted as a variable name.  `ñññ` is a valid JavaScript token.

The actaul definision of what characters are permitted in a JavaScript is very complicated, see this thread

  <http://stackoverflow.com/questions/1661197/valid-characters-for-javascript-variable-names>

This is too complicated for version 0.1 of /bin/js, so for now, all vars must conform to this simple rule.

    c == '_' ||
    c == '$' ||
    c == '-' ||
    (c >= 'a' && c <= 'z') ||
    (c >= 'A' && c <= 'Z') ||
    (c >= '0' && c <= '9') 

This might be fixed to closer match JavaScript strict requirements in a future version.  Anyone with a `ç` on their keyboard is by now used to the dangers of useing it in code though so dont hold your breath, for now vars (and functions) must be good ol' 7bit ascii chars.


### JSON is not supported syntax

Creating objects with JSON syntax as follows is, currently, not supported.

    {
      att1 : true,
      att2 : "string"
    }

Because `att1` is not known to the preparser it wil be treated as Bash. It may be possible to fix this in a future version so avoid nesting Bash statements inside JavaScript objects.  The following code will execute for the wrong reasons and should be avoided.

    { att1 : true
      cp fil2 file2
    }


