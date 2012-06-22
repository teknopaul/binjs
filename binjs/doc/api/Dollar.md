# $ the Dollar 

The `$` Object is instantiated as an object in the global scope to provide some core utilities such as `$.println()` and `$.getEnv()`.

Referencing this object must always be performed with `$.` which the preparser regonises as an indicator the line is JavaScript.
    
----------------------------

## Import

You do not have to import this library it is included by default.

-----------------------

## Provides

 * $  (A single instance)

-----------------------

## Constructor

It is not possible to construct an instance of `$`, it is not designed that way, but notice that `$()` will be treated as bash.   

`$HOME/bin/thing`  will execute as bash as you would expect.

-----------------------

## Attributes

### env

The `$.env` Object contains a all the bash environment vairables that begin with an UPPERCASE letter.

    var homeDir = $.env.HOME;
    
Environment variables that begin with a lower case letter, underscore or other character can be fetched with `$.getEnv()`.

### watch

The `$.watch` list contains an Array of Strings defining which global variables from Javascript global context shall be copied tot to the bash environment when executing commands.
By default it contains `["g1","gj","gk"]` but it can be manipulated.

See [Environment Variables](../../html/EnvironmentVariables.html) for more details.

-----------------------

## Methods

### print

`$.print()` accepts a String argument and prints it to the console.

A second argument is also accepted.

If the second argument is boolean true the text is printed in bold.

If the second argument is a String the text is printed in colour. The colour can be chosen from black, white, grey, darkgrey, blue, green, red, yellow, cyan, magenta or orange.

### println 

`$.println()` is the same as `$.print()` and adds a `\n` character and flushes the output.


### sleep

sleep the process for a configurable number of milliseconds.

Takes a single Integer argument.


### setEnv

Takes two arguments, the first of which must be a String and sets the named environment variable to the bash environment.

### getEnv

Takes a single String argument and returns a variable from the bash environment or null.

### error

`$.error()`  takes 3 arguments, an Integer, a simple string and a complex string.

    $.error(10, "file not found", f.path);
    
Prints 

<span style="color:red">ERR10</span>:file\_not\_found /foo/bar/quxx

The idea is to encourage numbering errors in scripts so that scripts that use the scripts can parse the output and take action based on numbered errors. Future versions on /bin/js intend to provide internationalization of the second argument via properties files with the underlined text as keys so it is advisable not to use and punctuation of non-letter characters in the text of the second argument.

### warn

Same as `$.error()` with an orange prefix `WARN`.

### info

Same as `$.error()` with a blue prefix `INFO`.

### getJobs

Returns a list o the background Jobs executed by bash.

See [Job Control](../../html/Jobs.html) for more details.

`$.getJobs()` returns an Array of JavaScript `Job` objects which have the following signature.

    {
      id : Integer,
      pid : Integer,
      command : String,
      running : Boolean,
      state : Integer
    }

* id is the ID of the job, for use with `kill %1`
* pid is the process ID of the job for use with `kill -9 pid`
* command is the executed command
* running is true if the job was running when `$.getJobs()` was called.
* state is an integer state from the `JOB` struct in bash, read the bash source for more details.

### inherits

`$.inherits()` is a copy of nodejs's `inherits` which is a copy of `Function.prototype.inherits` from `lang.js` it is used for generating Object heirarchies.


