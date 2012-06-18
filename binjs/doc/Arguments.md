
# Arguments to the script

When executing a /bin/js scripts command line arguments are passed to both bash and JavaScript. If a script is run as follows.

    ./myscript.bjs one two three

Bash is provided the environment variables $0 - $4 and in JavaScript the global variables argc and argv are set.  argc is redundant info in JavaScript. 

Arguments can be accessed as follows

    $.println("Args according to JavaScript")
    for (var i = 0; i < argc ; i++ ) {
        $.println( i + ": '" + argv[i] + "'" );
    }

    echo "Args according to bash"
    echo "0=$0 1=$1 2=$2 3=$3 4=$4"

N.B. argc and argv are not known to the preparser so for example the following would not be parsed as JavaScript if on its own line in the script.

    argc++;

Code should not change the values of argc and argv, they are writeable currently but they may be made immutable in a future version.
