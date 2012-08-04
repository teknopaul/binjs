

/**
 *	new File() mostly implemented in native code
 */
 
/*
var File = function() {}
*/

File.separator = '/';

/**
 * Create a File object, the srtring supplied is evaluated as a path and a file name extracted and stat() is called
 * so that attributes such as f.exists will be valid after construction.  The file need not exist to be created.
 * If the frist character of the path is '~' it is expanded to the current users home directory, technically
 * whatever the C command getenv("HOME") returns. N.B. without addin a tailing slash.
 * @constructor
 */
// File(String);

/**
 * Attributes
 */
// file.path
// file.name
// file.exists
// file.uid
// file.gid
// file.size
// file.lastAccessDate
// file.lastModifiedDate

/**
 * Methods
 */
// file.stat()  -  calling stat() updates all the attributes
// file.isFile()
// file.isDir()
// file.isSymLink()
// file.isRoot()  -  return true if this is the / root directory

// file.touch()
// file.rename()
// file.delete()
// file.getAbsolutePath()
// file.getAbsoluteFile()
// file.list()
// file.listFiles()
// file.read()
// file.write()

File.STDIN  = 0;
File.STDOUT = 1;
File.STDERR = 2;

/**
 * Returns a String with the file's path made absolute and cananocalized.
 */
File.prototype.getAbsolutePath = function() {

	// find the absolute path first
	var abs = null;
	if ( this.path.indexOf(File.separator) == 0) {
		abs = this.path;
	}
	else {
		var pwd = binjs_getEnv("PWD");
		if (pwd == File.separator) {
			abs = File.separator + this.path;
		}
		else {
			abs = pwd + File.separator + this.path;
		}
	}
	
	// cananocalize
	var canonical = [];
	var position = 0;
	var parts = abs.split(File.separator);
	for (var i = 0 ; i < parts.length ; i++) {
		switch (parts[i]) {
			case '' : 
			case '.' : 
				break;
			case '..' : 
				position--;
				break;
			default : {
				canonical[position++] = parts[i];
			}
		}
		
		if (position < 0) throw new Error("Invalid path " + abs);
	}
	
	return File.separator + canonical.join(File.separator);
	
}

File.prototype.getParent = function() {

	if ( this.isRoot() ) return null;
	
	var fullPath = this.getAbsolutePath();
	if (this.exists && this.isFile()) {
		if (fullPath.lastIndexOf('/') === 0) {
			return "/";
		}
		else {
			return fullPath.substring(0, this.path.length - this.name.length - 1);
		}
	}
	else if (this.exists && this.isDir()) {
		var parts = fullPath.split(File.separator);
		if (parts.length > 2) {
			parts = parts.splice(1, parts.length -2);
			return File.separator + parts.join(File.separator);
		}
		return "/";
	}
	else if ( ! this.exists ) { // change this also change getParentFile
		var parts = fullPath.split(File.separator);
		if (parts.length > 2) {
			parts = parts.splice(1, parts.length -2);
			var parentPath = File.separator + parts.join(File.separator);
			var parentFile = new File(parentPath);
			if (parentFile.exists && parentFile.isDir()) {
				return parentPath;
			}
		}
		return "/";
	}
	else throw new Error("File not found: " + this.path);
	
}


File.prototype.getParentFile = function() {

	if ( this.isRoot() ) return null;
	
	if ( ! this.exists ) { // change this also change getParent
		var fullPath = this.getAbsolutePath();
		var parts = fullPath.split(File.separator);
		if (parts.length > 2) {
			parts = parts.splice(1, parts.length -2);
			var parentPath = File.separator + parts.join(File.separator);
			var parentFile = new File(parentPath);
			if (parentFile.exists && parentFile.isDir()) {
				return parentFile;
			}
		}
		return new File("/");
	}
	else return new File(this.getParent());
}
/**
 *  Returns a new File object containing an absolute path file.
 */
File.prototype.getAbsoluteFile = function() {

	return new File(this.getAbsolutePath());
	
}

/**
 * lists the current directory returning an array of File objects.
 * Can be passed a file name filter function or a string that is used to glob via Bash
 */
File.prototype.listFiles = function(filter) {

	var files = [];

	var list;
	if (typeof filter === 'string') {
	
		// method was passed a string use bash to glob ? * and stuff
		binjs_exec("_binjs_CAPTURE=`/bin/ls -1Ad " + this.path + (this.isDir() ? "/" : "") + filter + " 2>/dev/null`");
		if (errno === 0) {
			list = $.getEnv("_binjs_CAPTURE").split('\n');
			$.setEnv("_binjs_CAPTURE");
		}
		else list = [];
		for ( var i = 0 ; i < list.length ; i++) {
			if ( list[i] != '.' && list[i] != '..' ) {
				files.push(new File(list[i]));
			}
		}
	}
	else {
	
		list = this.list().sort();
		for ( var i = 0 ; i < list.length ; i++) {
			if ( list[i] != '.' && list[i] != '..' ) {
				if (typeof filter === 'undefined' || filter.call(this, list[i]) ) {
					files.push(new File(this.path + "/" + list[i]));
				}
			}
		}
	}
	
	
	return files;
	
}

/**
 * Get or set the file extension.
 *
 * The file extension is defined here as the bit after the last dot
 *  e.g. my.tar.gz  "gz" is the extension not "tar.gz".
 * The getter does not return a dot, if the file ends in a dot the empty string is returned
 * if the file has no dot like /etc/hosts the getter returns null.
 * Hidden files (that start with dot) are not handled and methods return null for the 
 * getter.
 *
 * When setting the ext the File object is NOT changed a new instance of file is returned.
 * The setter does not mind if you provide a dot or not, if you do it is ignored.
 * If you pass the empty string "" to the setter the extension with its dot is removed.
 * You can not change the extension of a directory or a symlink with theis method even if it has one. 
 *
 * N.B. there is no requirement that the file exists this method just does string
 * manipulation of the path based on the name
 */
File.prototype.ext = function(newValue) {

	if ( this.isDir() || this.isSymLink() ) throw new Error("Can only call ext() on Files");

	var lastDot = this.name.lastIndexOf('.');

	if (typeof newValue === 'undefined') {

		// fetch the extension
		if (lastDot === -1) {
			return null;
		}
		
		// hidden files  like .bashrc are not really a
		// extensions in my book, ignore them completly
		if (lastDot === 0) {
			return null;
		}

		return this.name.substring(lastDot + 1);
	}
	else {
	
		// set the extension (manipulate path)
		
		// if it had not ext, or was a hidden file, just add it
		if (lastDot <= 0) {
			if (newValue.charAt(0) != '.') {
				newValue = '.' + newValue;
			}
			return new File( this.path + newValue);
		}

		// else manipulate it
		lastDot = this.path.lastIndexOf('.');
		if (lastDot <= 0)lastDot = this.path.length;
		
		if (newValue.length == 0) {
			return new File( this.path.substring(0, lastDot) );
		} else {
			if (newValue.charAt(0) != '.') {
				newValue = '.' + newValue;
			}
			return new File( this.path.substring(0, lastDot) + newValue );
		}
	}
}


// IO extensions

File.prototype.writeChar = function(char) {
	this.writeString(char.charAt(0));
}

// these could be faster written in C++
File.prototype.writeBinary = function(arr) {
	for (var i = 0 ; i < arr.length ; i++ ) this.writeByte(arr[i]);
}
File.prototype.readBinary = function(len) {
	if ( ! len ) len = 4294967295; // max array length per soem JS spec
	var arr = []
	for (var i = 0 ; i < len ; i++ ) {
		var b = this.readByte();
		if (b == null) return arr;
		arr.push( b );
	}
	return arr;
}

