
# Job Control

/bin/js has job control from bash.

## Where is setTimeout()

JavaScript in the browser and in nodejs have a setTimout method which is used to kick off an operation and wait for it to finish.  Both nodejs and the browser call this asynchronously but in /bin/js everthing is single-threaded ans synchronous so setTimeout() makes no sense.  Instead we have a sleep method and job control.

## Sleep

Instead of setting a timeout you can just sleep the main thread with the following method.

    $.sleep(millis);


## Forking processes

While /bin/js supports only one thread in the JavaScript it does support managing multiple processes via bash's job control.  Simply calling a bash statement followed by an ampersand (&) will fork a process and enter the process into bash's job control.

    wget http://code.abnoctus.com/my-file.tar-gz &

Processes started this way can be looked up using the $.getJobs() method.


    while ($.getJobs().length > 0) {
        var jobsArray = $.getJobs();
        $.println("Waiting for process: " + jobsArray[0].pid);
        $.sleep(500);
    }

In the above code the jobsArray is not updated you must call getJobs() again to get an update

Each job in the array is represented as a Job Object with the following properties;

    {
      id : Integer,
      pid : Integer,
      command : String,
      running : Boolean,
      state : Integer
    }
