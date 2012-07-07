#include <stdio.h>
#include <stdlib.h>
#include <cstring>

#include <errno.h>
#include <sys/types.h>

// if glibc > 2.10
#include <sys/stat.h>
// else 
#include <sys/time.h>

#include <fcntl.h>
#include <unistd.h>
#include <dirent.h>

#include "file.h"
#include "libbash.h"

#include <v8.h>

/**
 * The File object, instantiatable with new File("file.dat");
 *
 * When constructed stat() is called and attributes are set. When the attributes are subsequently accessed the
 * file system is not checked. For example lastModifiedDate is the Date of last modification of the file referenced by 
 * this object when the File was constructed.
 * To refresh the state call stat() which returns a reference to the object itself.
 *
 * Thus for a fresh notion of last modified time call  
 *
 * var modNow = file.stat().lastModifiedDate;
 *
 * This is done so that when creating a JSON object for a list of files
 * we dont call stat() for every access to every attribute of every file.
 */
 
#define UNIXTIME(t) Date::New(1000*static_cast<double>(t))

// TODO using C style prefixes should use namespaces some how I guess

using namespace v8;

static void SetPath(Handle<String> path, Handle<Object> self);
static void DoStat(Handle<String> path, Handle<Object> self);

// Extracts a C string from a V8 Utf8Value.
static const char* ToCString(const String::Utf8Value& value) {
	return *value ? *value : "<string conversion failed>";
}

/**
 * Sets up the File object template.
 */
void InitialiseFile(Handle<FunctionTemplate> fileTemplate) {

	fileTemplate->PrototypeTemplate()->Set( String::New("stat"),		FunctionTemplate::New(FileStat));
	fileTemplate->PrototypeTemplate()->Set( String::New("isFile"),		FunctionTemplate::New(FileIsFile));
	fileTemplate->PrototypeTemplate()->Set( String::New("isDir"),		FunctionTemplate::New(FileIsDirectory));
	fileTemplate->PrototypeTemplate()->Set( String::New("isSymLink"),	FunctionTemplate::New(FileIsSymlink));
	fileTemplate->PrototypeTemplate()->Set( String::New("isRoot"),		FunctionTemplate::New(FileIsRoot));

	fileTemplate->PrototypeTemplate()->Set( String::New("touch"),		FunctionTemplate::New(FileTouch));
	fileTemplate->PrototypeTemplate()->Set( String::New("rename"),		FunctionTemplate::New(FileRename));
	fileTemplate->PrototypeTemplate()->Set( String::New("delete"),		FunctionTemplate::New(FileDelete));
	fileTemplate->PrototypeTemplate()->Set( String::New("list"),		FunctionTemplate::New(FileList));
	fileTemplate->PrototypeTemplate()->Set( String::New("read"),		FunctionTemplate::New(FileRead));
	fileTemplate->PrototypeTemplate()->Set( String::New("write"),		FunctionTemplate::New(FileWrite));

}

/**
 * Constructor executed from JavaScript with `new`.
 */
Handle<Value> FileConstructor(const Arguments& args) {
	HandleScope scope;
	
	if (args.Length() < 1 || ! args[0]->IsString() ) {
		return ThrowException(Exception::TypeError(String::New("File constructor needs a file name")));
	}
	
	if (!args.IsConstructCall()) {
		return ThrowException(Exception::TypeError(String::New("File must be called with new File(\"file.txt\")")));
	}
	Handle<Object> self = args.This();

	SetPath(args[0]->ToString(), self);
	
	DoStat(self->Get(String::New("path"))->ToString(), self);
	
	return Undefined(); 
}

/**
 * Sets the `path` attrubute from a string, usually passed from the constructor, also
 * after rename.
 *
 * The method does tilde expansion to the supplied path and sets the attribute `name` based on the
 * last entry in the path.
 *
 * The name of the root File is "/"
 */
static void SetPath(Handle<String> pathString, Handle<Object> self) {
	HandleScope scope;

	String::Utf8Value path(pathString);
	const char* cpath = ToCString(path);
	
	//printf("cpath \"%s\" \n" , cpath);
	
	// Bash style tilde expansion
	if ( *cpath == '~' ) {
		int jump = 1; // how many chars to skip
		Handle<String> expansion = String::New("");
		if ( *(cpath +1) == '+' ) {
			expansion = String::New(getenv("PWD"));
			jump++;
		}
		else if ( *(cpath +1) == '-' ) {
			expansion = String::New(getenv("OLDPWD"));
			jump++;
		}
		else {
			expansion = String::New(getenv("HOME"));
		}
		
		pathString = String::Concat(expansion, String::New(cpath + jump));
		self->Set(String::New("path"), pathString);
	}
	else {
		self->Set(String::New("path"), pathString);
	}
	

	// get the file name, the part after the last /
	
	// read the string from back to front
	int len = strlen(cpath);

	if (len == 0) {
		ThrowException(Exception::TypeError(String::New("File name must be specified")));
		return;
	}

	// special case root "/"
	if (len == 1 && *cpath == '/') {
		self->Set(String::New("name"), pathString);
		return;
	}
	
	// apart from root, strip trailing /
	int end = len;
	while ( *(cpath + len - 1) == '/') {
		end--; len--;
		if( len == 0 ) {
			ThrowException(Exception::TypeError(String::New("File name must be specified")));
			return;
		}
	}
	
	// step back to next / or start of string
	while ( len > 0 && *(cpath + len -1) != '/' ) len--;
	
	// copy file to name attribute
	char namecopy[end - len + 1];
	namecopy[end - len] = 0;
	strncpy(namecopy, cpath + len, end - len);
	self->Set(String::New("name"), String::New(namecopy));
	
}

/**
 * Call stat() and set the attributes of this File Object.
 */
static void DoStat(Handle<String> pathString, Handle<Object> self) {
	HandleScope scope;

	String::Utf8Value path(pathString);
	const char* cpath = ToCString(path);
	
	struct stat s;
	if ( stat(cpath,  &s) == 0 ) {

		/* user ID of owner */
		self->Set(String::New("mode"), Integer::New(s.st_mode));

		/* user ID of owner */
		self->Set(String::New("uid"), Integer::New(s.st_uid));
		
		/* group ID of owner */
		self->Set(String::New("gid"), Integer::New(s.st_gid));
	
		/* total size, in bytes */
		self->Set(String::New("size"), Number::New(s.st_size));
	
		/* time of last access */
		self->Set(String::New("lastAccessDate"), UNIXTIME(s.st_atime));
	
		/* time of last modification */
		self->Set(String::New("lastModifiedDate"), UNIXTIME(s.st_mtime));

		self->Set(String::New("exists"), True());
	}
	
	else {
		//TODO error messages need the file name
		switch(errno) {
			case ENOENT : 
				self->Set(String::New("exists"),False());
				self->Set(String::New("uid"), Integer::New(-1));
				self->Set(String::New("gid"), Integer::New(-1));
				self->Set(String::New("size"), Number::New(-1));
				self->Set(String::New("lastAccessDate"),  Null());
				self->Set(String::New("lastModifiedDate"),  Null());
				break;
			case EACCES :
				ThrowException(Exception::TypeError(String::New("Permission denied"))); 
				return;
			default :
				ThrowException(Exception::TypeError(String::New("Error reading file")));
				return;
		}
	}
}






// public functions

/**
 * Returns true if this path points to a file.
 */
Handle<Value> FileIsFile(const Arguments& args) { 
	HandleScope scope;
	
	int64_t mode = args.This()->Get(String::New("mode"))->IntegerValue();
	
	return Boolean::New(S_ISREG(mode));
	
}

/**
 * Returns true if this path points to a directory
 */
Handle<Value> FileIsDirectory(const Arguments& args) { 
	HandleScope scope;
	
	int64_t mode = args.This()->Get(String::New("mode"))->IntegerValue();
	
	return Boolean::New(S_ISDIR(mode));
	
}

/**
 * Returns true if this path points to a symbolic link
 */
Handle<Value> FileIsSymlink(const Arguments& args) { 
	HandleScope scope;
	
	int64_t mode = args.This()->Get(String::New("mode"))->IntegerValue();
	
	return Boolean::New(S_ISLNK(mode));
	
}


/**
 * Returns true if this path points to the root.
 * e.g.  /bin/..  points to the root.
 */
Handle<Value> FileIsRoot(const Arguments& args) { 
	HandleScope scope;
	
	Handle<Value> handle = args.This()->Get(String::New("name"));
	
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	struct stat sMe, sRoot;
	if ( stat(cpath,  &sMe) == 0 ) {
		if ( stat("/", &sRoot) == 0 ) {
			if (sMe.st_ino == sRoot.st_ino) {
				return True();
			}
			return False();
		}
	}
	else { // path probably does not exist
		return False();
	}
	
	return ThrowException(Exception::TypeError(String::New("Unable to determine root")));
	
}

/**
 * Call stat() from JavaScript
 */
Handle<Value> FileStat(const Arguments& args) { 
	HandleScope scope;
	
	DoStat(args.This()->Get(String::New("path"))->ToString(), args.This());
	
	return args.This();
	
}

/**
 * Touch this file and call stat().
 */
Handle<Value> FileTouch(const Arguments& args) {
	HandleScope scope;

	Handle<Value> handle = args.This()->Get(String::New("name"));
	
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	mode_t mode = S_IRUSR | S_IWUSR | S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH;
	int fd = open(cpath, O_WRONLY | O_CREAT, mode);
	
	// how to if def glibc > 2.10 guess we need autoconf
	//int ok = utimensat(AT_FDCWD, cpath, NULL, 0);
	int ok = utimes(cpath, NULL);
	
	close(fd);
	
	if ( ok == 0) DoStat(handle->ToString(), args.This());

	return args.This();
	
}

/**
 * Rename this file, and call stat().
 */
Handle<Value> FileRename(const Arguments& args) {
	HandleScope scope;
	
	if (args.Length() < 1 || ! args[0]->IsString() ) { // TODO support file.rename(otherFile);
		return ThrowException(Exception::TypeError(String::New("Rename to what?")));
	}
	
	String::Utf8Value newpath(args[0]);
	const char* cnewpath = ToCString(newpath);
	
	
	String::Utf8Value path(args.This()->Get(String::New("path")));
	const char* cpath = ToCString(path);

	if (rename(cpath, cnewpath) == 0) {
	
		SetPath(args[0]->ToString(), args.This());
		
		DoStat(args[0]->ToString(), args.This());
		
	}
	else {
		return ThrowException(Exception::TypeError(String::New("Error renaming file")));
	}
	
	return args.This();

}

/**
 * Delete this file and call stat().
 */
Handle<Value> FileDelete(const Arguments& args) { 
	HandleScope scope;

	Handle<Value> handle = args.This()->Get(String::New("path"));
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);

	if (remove(cpath) == 0) {

		DoStat(handle->ToString(), args.This());

		return True();
	}
	
	return False();
}

/**
 * Lists a directory.
 * Returns a list of strings.
 */
Handle<Value> FileList(const Arguments& args) { 
	HandleScope scope;

	int64_t mode = args.This()->Get(String::New("mode"))->IntegerValue();
	if ( ! S_ISDIR(mode) ) {
		return ThrowException(Exception::TypeError(String::New("File is not a directory, can not list")));
	}
	
	Handle<Value> handle = args.This()->Get(String::New("path"));
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	struct dirent *dp;
	DIR *dir = opendir(cpath);
	
	Local<Array> jsArray = Array::New(0);
	Local<Value> fun = jsArray->Get(String::New("push"));
	
	if ( fun->IsFunction()) {
		Local<Function> push = Local<Function>::Cast(fun);
		
		while ( ( dp = readdir(dir) ) != NULL) {
			char *name = dp->d_name;

			v8::Handle<Value> argv[1] = { String::New(name) };
			push->Call(jsArray, 1, argv);

		}
		closedir(dir);
	
	}
	return jsArray;
	
}

/**
 * Reads the File into a v8 string.
 */
Handle<Value> FileRead(const Arguments& args) {

	bool exists = args.This()->Get(String::New("exists"))->ToBoolean()->Value();
	if ( ! exists ) {
		return ThrowException(Exception::TypeError(String::New("File does not exist")));
	}
	
	Handle<Value> handle = args.This()->Get(String::New("path"));
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	FILE* file = fopen(cpath, "rb");
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("Cannot read file")));
	}
	
	fseek(file, 0, SEEK_END);
	int size = ftell(file);
	rewind(file);

	char* chars = new char[size + 1];
	chars[size] = '\0';
	for (int i = 0; i < size;) {
		int read = fread(&chars[i], 1, size - i, file);
		i += read;
	}
	fclose(file);
	Handle<String> result = String::New(chars, size);
	delete[] chars;
	return result;
}


/**
 * Write a string to the file, overwriting any current contents.
 */
Handle<Value> FileWrite(const Arguments& args) {

	if (args.Length() < 1 || ! args[0]->IsString() ) {
		return ThrowException(Exception::TypeError(String::New("Missing data to write")));
	}
	
	String::Utf8Value contents(args[0]);
	const char* ccontents = ToCString(contents);
	
	Handle<Value> handle = args.This()->Get(String::New("path"));
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	FILE* file = fopen(cpath, "wb");
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("Can't open file for writing")));
	}

	int len = strlen(ccontents);
	int count = fwrite(ccontents, 1, len, file);	
	fflush(file);
	fclose(file);
	
	return count == len ? True() : False();
}


