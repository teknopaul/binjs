
# Environment Variables

Environment variables from Bash are available in JavaScript via the $.env object.  When starting the script any environment variable that starts with an upper case ascii letter is copied to the $.env object. This object is updated after ever bash command so you do not have to manually sync the environment.

    var home = $.env.HOME;

Any environment variable that does not start with an upper case ascii character can be fetched with the $.getEnv() method.

    var lastSetVar = $.getEnv("_");

Variables can be added or changed in the bash environment with $.setEnv(name, value);

    var i = 0;
    for ( ; i < 10 ; i++) {
		$.setEnv("i", i);
        echo "Number${i}"
    }


Some variables are automatically synced from JavaScript to bash, there is a list of Strings in the $.watch array that defines which vars ar copied to Bash before executing a command.  This list can be manipulated.

    $.watch.push("myVar");

By default it contains ["i", "j", "k"] so that simple forloop variables are propagated to Bash.

    for (var i = 0 ; i < 10 ; i++ ){
      wget -O - http://linux.com/linux-cd-${i}.iso.tar.gz | tar x
    }

It can be removed if you dont want any variables copied to the Bash environment.

This trick only works in the global scope and currently does not work inside a function.
