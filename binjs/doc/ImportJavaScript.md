
# Importing JavaScript

A global method `binjs_import()` can be used to execute entire JavaScript files.

    binjs_import("./myscript.js");

The files must contain valid JavaScript, not /bin/js syntax files.  The files will be executed in the same context as the rest of /bin/js/ so you should respect the existing global variables which are all prefixed `binjs_` and the `$` variable is used by binjs.

## Library locations

### ~lib/

The prefix `~lib/` is used to define the global script location which is hardcoded as `/lib/binjs/lib`. If you want a different default lib dir you need to create symlinks.

Your own libraries can be loaded from anywhere on the file system from the current directory or with an absolute path.  

Currently there is no module system like nodejs.

The `binjs_import()` method will not import a script with the same name twice, to avoid infinite recursion in the init process, however it does not (currently) check the inode of the script for equality it simply check to see if the string argument supplied to `binjs_import()` has been used before.

# Library code style

Because there is no module scope when loading JavaScript files it is important not to populate the global scope with variables in imported JavaScript that might break code from other imports.  The prefered method for creating libraries is to make available JavaScript objects by defining a prototype and not to instantiate any objects.

for example in a file MyLib.js

    MyLib = function() {
        this.attribute1;
        this.attribute2;
    }

    Mylib.prototype.myFunction = function() {
        ...
        return this.attribute1;
    }

This code can be used as follows

    binjs_import("MyLib.js");

    var lib = new MyLib();


Any JavaScript is valid in the library file so there is nothing to stop you creating functions and objects direclty in the  global scope.

The following code works as expected but this is not considered good style.

    var obj = new Object();
    function  prettyPrinter() {
        ...

A variable `obj` and a global function prettyPrinter would bre created and since the module code is not visible users of the code could be supprised by its existence.

When importing a file ~/lib/Mybject.js it should not be suprising to find new MyObject() in later code.

This style of creating libraries makes the library usage indistinguisable from Objects provided by native C++ code such as the File object.

### Importing /bin/js scripts

There is currently no way to import /bin/js files. You can execute /bin/js files with just 

    ./myscript.bjs

The script will run as expected, but vars and functions are not exported. We aim to add this feature in a later version.

If you need that feature now, call the preparser directly

    cat myscript.bjs | /lib/binjs/bin/binjs_preparser > /tmp/bjs.tmp
    binjs_import("/tmp/bjs.tmp");

