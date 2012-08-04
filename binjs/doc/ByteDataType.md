
# Representing Bytes

Node.js represents streams of bytes very efficiently with a class called Buffer. The approach /bin/js takes for streams of bytes is to return JavaScript arrays of integers.  Where a single byte would be returned a normal JavaScript integer is returned.
The approach /bin/js takes is much simpler, much easier for the user, but much less efficient interms of performance and use of memory. 

For example

    var b = new Term().readByte();

returns a positive integer between 0 and 255.

    var esc = term.consumeAnsiEscape();
    
returns an array of integers, for example `[27, 78, 99]`

The numbers returned can be treated like any JavaScript number using syntax like ++b or b + 65 and is therefor very convenient. Code to read and write bytes in this way is typically much simpler to loook at that code using Buffers.

These methods should not be used for processing large(gigabyte) binary arrrays of data such as image or video files because the internal representation uses far more memory that the file on disk does.  Approximatly 4 times as much memory is used and the file size.  JavaScript it self has a maximum array size but generally main memory will be the limit (time of writing 2012).
Reading a byte at a time from C++`into JavaScript is also not very efficient, in terms of CPU usage.

## Pipes


Processing large files this way in a pipe should not consume excessive memory so /bin/js can be used to create quick binary filters which is often an important use for scripts.  /bin/js has some convenient features for processing pipes and JavaScript and bash syntax can be mashed-up to create simple parsers that benefit from sed and awk and other piped Linux tools and then augmented with JavaScript.  The syntax of the code should be simple. The user must remember that it is possible to read a byte as an integer increment it above 255 and thus not be able to write it back out as a byte, there is no reason a valid program should want to do that. 
But the user is responsible for ensuring that numbers do not overflow where as in C code the unsigned byte types are available in JavaScript they are not.

If a program needs to load very large binary files to main memory and process them consider another language like C or C++.

