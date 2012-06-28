# Features

This page lists the hight level features of /bin/js.

/bin/js is a mash-up of Bash and JavaScript enabling a very simple script syntax.

It has a recent build of v8 for the JavaScript runtime, and Bash 4.2 for the Bash engine.

Supports the best of Bash, pipes, redirects and anything you can do in a single line of bash command.

The best of JavaScript C style syntax, i++, try/catch for loops etc.

Overload the nasty bits of Bash like if [] ; then, the freaky case statements, the horrible math in double round brackets or with bc, and the unplesent $1 $2 $3 parameter handling for function calls.

JavaScript is synchronous, no callback functions or setTimeouts(), an easy to follow single-threaded model with synchronous I/O APIs and sleep(millis) to wait the process.  Ideal for scripting.

A synchronous File API that loooks like natural JavaScript.

    var text = new File("./file.txt").read();
    
Bash style TEXT=`cat ./file` still works if you prefer Bash syntax or want to get busy with tail|head|sed|grep and friends.

Mutli-process support via bash, just tack "&" on the end of the command line to fork a process and call $.getJobs() to manage the background processes.

Very simple library support, to include existing JavaScript.

Shared environment for moving variable between JavaScript and Bash  $.getEnv() $.setEnv()  Bash environment is always available in JavaScript via $.env.HOME.  JavaScript vars can be automatically pushed to the Bash environment. 

    for (var gi = 0 ; gi < 10 ; gi++ ){
      wget -O - http://linux.com/release/linux-cd-${gi}.iso.tar.gz | tar x
    }

Simple XML and JSON support, something traditionally tricky in Bash scripts.

Simple utils for colored command line output and output of Markdown files to the console.

Open source code written in C / C++ and JavaScript.
