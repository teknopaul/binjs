# Magic Vars

/bin/js sets a couple of variable in the global scope that developers should be aware of since they are useful.

## Script Arguments

The values argc (an Integer) and argv  (an Array) are set when the script runs with the count of arguments to the script and the arguments as a JavaScript Array of Strings.  The first element in the array is the name of the script.

This is the JavaScript equivalent of Bash's $#, $0 $@ and $*

## Last command exit value

In a siilar style to C code the global var errno is set to the exit value of the last command executed by Bash

    ./myScript.sh
    switch(errno) {
      case 0 : 	
	...

This is the JavaScript equivalent of Bash's  $?


## Global Magic Vars

The vars gi,gj,gk are predefined in the global scope and are syncronized with the Bash environment with every call.

    for (gi = 0 ; gi < 5 ; gi++) {
        echo gi is $gi
    }

This is a simple convenience but when copying code be aware that only gi,gj and gk work like this and only in the global scope.

    for (gx = 0 ; gx < 5 ; gx++) {
        echo gx is $gx   # this will NOT work
    }

    var gi = 0;     # this will cause a great confusion, since the global gi is overriden by a local var
    echo gi is $gi  # OMG 
    
## Process ID

The global var pid is set, this is the JavaScript equivalent of Bash's  $$

    new File("/var/run/myapp.pid").write("" + pid);

## Last executed process ID

The global var lastpid is set when Bash forks a process.

    ./longRunningScript.sh &
    $.println("Forked:" + pid);

This is the JavaScript equivalent of Bash's $!

