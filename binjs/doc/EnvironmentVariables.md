
# Environment Variables

Environment variables from Bash are available in JavaScript via the `$.env` object.  When starting the script any environment variable that starts with an upper case ascii letter is copied to the `$.env` object. This object is updated after everr bash command so you do not have to manually sync the environment.

    var home = $.env.HOME;

Any environment variable that does not start with an upper case ascii character can be fetched with the `$.getEnv()` method.

    var lastSetVar = $.getEnv("_");

Variables can be added or changed in the bash environment with `$.setEnv(name, value);`

    var i = 0;
    for ( ; i < 10 ; i++) {
        $.setEnv("i", i);
        echo "Number${i}"
    }


Some variables are automatically synced from JavaScript to bash, there is a list of Strings in the `$.watch` array that defines which global vars ar copied to Bash before executing a command.  This list can be manipulated.

    $.watch.push("myVar");

By default it contains `["gi", "gj", "gk"]` so that simple for loop variables are propagated to Bash.

    for (gi = 0 ; gi < 10 ; gi++ ){
      wget -O - http://linux.com/linux-cd-${gi}.iso.tar.gz | tar x
    }

It can be removed if you dont want any variables copied to the Bash environment.

Passing variables to bash via the `$.watch` list only works in the global scope and currently does not work inside a function.
