

/**
 *	new File() mostly implemented in native code
 */

File.separator = '/';

/**
 * Constructor
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

	if ( ! this.exists ) { // change this also change getParent
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
 Can be passed a file name filter function 
 */
File.prototype.listFiles = function(filter) {

	var list = this.list().sort();
	var files = [];
	
	for ( var i = 0 ; i < list.length ; i++) {
		if ( list[i] != '.' && list[i] != '..' ) {
			if (typeof filter === 'undefined' || filter.call(this, list[i]) ) {
				files.push(new File(this.path + "/" + list[i]));
			}
		}
	}
	
	return files;
	
}

