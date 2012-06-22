# File

File operations, for simple synchronous I/O.

The File API provides a simple JavaScript style way of manipulating files and directories, something that is missing from the core JavaScript spec since usually JavaScript runs in a browser.  The /bin/js API is not based on the w3c spec for File.

The File Object provides facitlities to read write rename delete and query files in the file system.

All calls are synchronous.

File API is defined in `src/v8/file.cpp` and `src/js/File.js`.
    
----------------------------

## Import

You do not have to import this library it is included by default.

-----------------------

## Provides

 * File

-----------------------

    #!/bin/js
    
    var f = new File("file.txt");


N.B. The File API is provided as a convenience, but in many cases bash syntax is much more convenient.

For example to print the files the current directory in JavaScript ...

    var dir = new File(".");
    var arr = dir.list();
    for ( var i = 0 ; i < arr.length ; i++ {
        $.println(arr[i]);
    }
    
is much more verbose that simply writing

    ls -1


Similarly reading a files ...

    var data = new File("skin.dat").read();
    
can be simpler in bash

    DATA=`cat skin.dat`

--------------
    
## Constructor
    
### Example

    var f = new File("./file.txt");

    var f = new File("~/bin");

The constructor takes a single, not optional, String argument that is the path to the file.  The path may or may not exist, upon creation the `stat() ` method is called and the `name` is determined from the provided path.

The path may be absolute or relative and is copied directly to the `path` attribute of the constructed object.

Tilde expansion is supported as in bash and will modify the `path` of the constructed object.

N.B. relative paths are relative to the current directory which can change throughout the life of the Object.

    cd
    var f = new File("."); // path points to users home
    cd ..   
    // f.path is still "." which now represents /home

The methods `getAbsolutePath()` and `getAbsoluteFile()` can be used to resolve relative paths.

--------------

## Attributes

Attributes are set during construction and reset if `stat()` is called.

### path

Type : String

The absolute or relative path to which the file points.

### name

Type : String

The name of the file or last path component.

### exists

Type : Boolean

true if the file exists at the time the File was constructed or after stat() has been called.

### uid

Type : Number

The user ID of the owner of the file.

### gid

Type : Number

The group ID of the owner of the file.

### size

Type : Number

The size of the file when the File object was constructed or last time stat() was called, if the file exists.

### lastAccessDate

Type : Date

The time of last access of the file when the File object was constructed or last time stat() was called, if the file exists.

### lastModifiedDate

Type : Date

The time of last modification of the file when the File object was constructed or last time stat() was called, if the file exists.

--------------

## Methods

### stat()
  
Calling stat() updates all the attributes of the current instance.

### isFile()

Returns true if the File points to a file that exists and is a normal file at the time the File object was constructed or last time stat() was called.

### isDir()

Returns true if the File points to a directory that exists at the time the File object was constructed or last time stat() was called.

### isSymLink()

Returns true if the File points to a symbolik link that exists and is a normal file at the time the File object was constructed or last time stat() was called.

### isRoot()

Returns true if this File points to the root directory `/`.  The path is typically `/` but other paths may also point to root such as `..` depending on the current directory.

### touch()

Set the last modified time of the File to now, and call `stat()`.

Returns this.

### rename()

Takes a single String argument that is a new path,  a path must be provide not a file name.  The internal path attribute is updated name is updated and `stat()` is called.

Returns this.

### delete()

Deletes the file and calls `stat()` on the current instance so that `exists` will be false if the file was successfully deleted.

Returns true if the file was deleted.

### getAbsolutePath()

Returns a String with the file's path made absolute and cananocalized.  The File itself is not updated.

### getAbsoluteFile()

Returns a New instance of a file with the file's path made absolute and cananocalized.

Typical usage would be 

    f = f.getAbsoluteFile();

### list()

Returns an Array of Strings if this File is a direcotry and the contents of the direcotry can be read.  The whole contents of the directory is read and can not be filtered.

### listFiles()

Returns an Array of File objects if this File is a direcotry and the contents of the direcotry can be read.  
If no arguments are provided the whole contents of the directory is read.

If a file name filter function is provided as an argument, the function is called for each file name found in the directory and if the function returns false the file is excluded from the list of returned objects.

If a String is provided as an argument `/bin/ls -1Ad ` plus the String is called to list the files, so the String can be any glob that the bash regonises.

    f.listFiles()

    f.listFiles( function(name) { return name.indexOf('.') == 0; } );

    f.listFiles( "*.txt" );

### read()

Read the whole contents of the file to memory as a JavaScript String, data is assumed to be UTF-8.

### write()

This method takes a single argument that must be a string and the data is written to the file as UTF-8.

### ext()

Get or set the file extension.

The file extension is defined here as the bit after the last dot
e.g. for the file mycode.tar.gz  `gz` is the extension not `tar.gz`.
The getter does not return a dot, if the file ends in a dot the empty string is returned if the file has no dot like /etc/hosts the getter returns null. Hidden files (that start with dot) are not handled and this method returns null for the getter.

If a single String argument is provided his method sets the file extension.
When setting the ext the File object is NOT changed a new instance of file is returned. The setter does not mind if you provide a dot or not, if you do it is ignored. If you pass the empty string "" to the setter the extension with its dot is removed.
You can not change the extension of a directory or a symlink with this method even if it has one. 

There is no requirement that the file exists this method just does string manipulation of the path based on the name.