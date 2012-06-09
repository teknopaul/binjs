# Importing JavaScript

A global method binjs_import() can be used to execute entire JavaScript files.

The files must contain valid JavaScript, not /bin/js syntax files.  The files will be executed in the same context as the rest of /bin/js/ so you should respect the existing global variables whichar are all prefixed binjs_ and the $ variable is used by binjs.

If you add to the $ prototype you risk breaking code in future versions.

There is currently no way to import /bin/js files.

You can execute them with just 

    ./myscript.bjs.  

The script will run but vars and functions are not exported. We aim to add this feature in a later version.

If you realy need that feature now call

    cat myscript.bjs | /lib/binjs/bin/binjs_preparser > /tmp/bjs.tmp
    binjs_import("/tmp/bjs.tmp");

## Library locations

### ~lib/

The prefix "~lib/" is used to define the global script location which is hardcoded as /lib/binjs/lib. If you want a different default lib dir you need to create symlinks.

Your own libraries can be loaded from anywhere on the file system from the current directory or with an absolute path.  

Currently there is no module system line nodejs.

The binjs_import() method will not import a script with the same name twice, to avoid infinite recursion in the init process, however it does not (currently) check the inode of the script for equality it simpley check to see if the string argument supplied to binjs_import() has been used before.



