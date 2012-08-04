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

#define B_0  0
#define B_10  2
#define B_110  6
#define B_1110  14
#define B_11110  30
#define B_111110  62
#define B_1111110  126

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
 * 
 * @since 0.9 supports open() and close() and stdio read and write methods.
 * also constructor supports 0 1 and 2 for stdin, stdout stderr
 */
 
#define UNIXTIME(t) Date::New(1000*static_cast<double>(t))

// TODO using C style prefixes should use namespaces some how I guess

using namespace v8;

static void SetPath(Handle<String> path, Handle<Object> self);
static void DoStat(Handle<String> path, Handle<Object> self);

static FILE* unwrap(const Arguments& args);
static bool isNaF(const Arguments& args);

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
	
	Local<ObjectTemplate> instanceTemplate = fileTemplate->InstanceTemplate();
	instanceTemplate->SetInternalFieldCount(1);

	fileTemplate->PrototypeTemplate()->Set( String::New("open"),			FunctionTemplate::New(FileOpen));
	fileTemplate->PrototypeTemplate()->Set( String::New("close"),			FunctionTemplate::New(FileClose));
	fileTemplate->PrototypeTemplate()->Set( String::New("readByte"),		FunctionTemplate::New(FileReadByte));
	fileTemplate->PrototypeTemplate()->Set( String::New("writeByte"),		FunctionTemplate::New(FileWriteByte));
	fileTemplate->PrototypeTemplate()->Set( String::New("readString"),		FunctionTemplate::New(FileReadString));
	fileTemplate->PrototypeTemplate()->Set( String::New("writeString"),		FunctionTemplate::New(FileWriteString));
	fileTemplate->PrototypeTemplate()->Set( String::New("readChar"),		FunctionTemplate::New(FileReadChar));
}

/**
 * Constructor executed from JavaScript with `new`.
 */
Handle<Value> FileConstructor(const Arguments& args) {
	HandleScope scope;


	if ( args.Length() < 1 ) {
		return ThrowException(Exception::TypeError(String::New("File constructor needs a file name")));
	}
	
	if ( ! args.IsConstructCall() ) {
		return ThrowException(Exception::TypeError(String::New("File must be called with new File(\"file.txt\")")));
	}
	
	Handle<Object> self = args.This();
	if ( args[0]->IsNumber() ) {
		self->Set(String::New("name"), Null());
		self->Set(String::New("path"), Null());
		int32_t num = args[0]->Int32Value();
		switch ( num ) {
			case 0 : self->SetInternalField(0, External::New(stdin));  break;
			case 1 : self->SetInternalField(0, External::New(stdout)); break;
			case 2 : self->SetInternalField(0, External::New(stderr)); break;
			default : return ThrowException(Exception::TypeError(String::New("File must be called with new File(\"file.txt\")")));
		}
		return Undefined();
	}
	else {
		self->SetInternalField(0, External::New(NULL));
	}

	if ( ! args[0]->IsString() ) {
		return ThrowException(Exception::TypeError(String::New("File constructor needs a file name")));
	}
	
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
	
	if ( isNaF(args) ) return Boolean::New(false);
	
	int64_t mode = args.This()->Get(String::New("mode"))->IntegerValue();
	
	return Boolean::New(S_ISREG(mode));
	
}

/**
 * Returns true if this path points to a directory
 */
Handle<Value> FileIsDirectory(const Arguments& args) { 
	HandleScope scope;
	
	if ( isNaF(args) ) return Boolean::New(false);
	
	int64_t mode = args.This()->Get(String::New("mode"))->IntegerValue();
	
	return Boolean::New(S_ISDIR(mode));
	
}

/**
 * Returns true if this path points to a symbolic link
 */
Handle<Value> FileIsSymlink(const Arguments& args) { 
	HandleScope scope;
	
	if ( isNaF(args) ) return Boolean::New(false);
	
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
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));
	
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
	
	Handle<Value> handle = args.This()->Get(String::New("path"));
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));
	
	DoStat(handle->ToString(), args.This());
	
	return args.This();
	
}

/**
 * Touch this file and call stat().
 */
Handle<Value> FileTouch(const Arguments& args) {
	HandleScope scope;

	Handle<Value> handle = args.This()->Get(String::New("path"));
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));
	
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

	Handle<Value> handle = args.This()->Get(String::New("path"));
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));
	
	if (args.Length() < 1 || ! args[0]->IsString() ) { // TODO support file.rename(otherFile);
		return ThrowException(Exception::TypeError(String::New("Rename to what?")));
	}
	
	String::Utf8Value newpath(args[0]);
	const char* cnewpath = ToCString(newpath);
	
	
	String::Utf8Value path(handle);

	
	const char* cpath = ToCString(path);

	if ( rename(cpath, cnewpath) == 0 ) {
	
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
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));
	
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);

	if ( remove(cpath) == 0 ) {

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

	Handle<Value> handle = args.This()->Get(String::New("path"));
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));

	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	int64_t mode = args.This()->Get(String::New("mode"))->IntegerValue();
	if ( ! S_ISDIR(mode) ) {
		return ThrowException(Exception::TypeError(String::New("File is not a directory, can not list")));
	}
	
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
	HandleScope scope;

	Handle<Value> handle = args.This()->Get(String::New("path"));
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	bool exists = args.This()->Get(String::New("exists"))->ToBoolean()->Value();
	if ( ! exists ) {
		return ThrowException(Exception::TypeError(String::New("File does not exist")));
	}
	
	
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
	HandleScope scope;

	Handle<Value> handle = args.This()->Get(String::New("path"));
	if ( handle->IsNull() ) return ThrowException(Exception::TypeError(String::New("NaF")));
	String::Utf8Value path(handle);
	const char* cpath = ToCString(path);
	
	if (args.Length() < 1 || ! args[0]->IsString() ) {
		return ThrowException(Exception::TypeError(String::New("Missing data to write")));
	}
	
	String::Utf8Value contents(args[0]);
	const char* ccontents = ToCString(contents);

	
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

/**
 * Open a file for reading or writing
 */
Handle<Value> FileOpen(const Arguments& args) {
	HandleScope scope;

	if ( isNaF(args) ) return ThrowException(Exception::TypeError(String::New("NaF")));

	FILE* file = unwrap(args);
	if (file != NULL) {
		return ThrowException(Exception::TypeError(String::New("File already open")));
	}

	if (args.Length() < 1 || ! args[0]->IsString() ) {
		return ThrowException(Exception::TypeError(String::New("Missing parameter to open")));
	}
	
	String::Utf8Value openFlag(args[0]);
	const char* copenFlag = ToCString(openFlag);
	
	Handle<Value> phandle = args.This()->Get(String::New("path"));
	String::Utf8Value path(phandle);
	const char* cpath = ToCString(path);
	
	file = fopen(cpath, copenFlag);
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("Can't open file")));
	}
	args.This()->SetInternalField(0, External::New(file));
	
	return Undefined();
}


/**
 * Close an open file.
 */
Handle<Value> FileClose(const Arguments& args) {
	HandleScope scope;

	if ( isNaF(args) ) return ThrowException(Exception::TypeError(String::New("NaF")));

	FILE* file = unwrap(args);
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("File not open")));
	}
	
	fclose(file);
	args.This()->SetInternalField(0, External::New(NULL));
	
	return Undefined();
}


/**
 * Read a single byte from a file, or null if the end of the stream is reached
 * @return an int
 */
Handle<Value> FileReadByte(const Arguments& args) {
	HandleScope scope;

	FILE* file = unwrap(args);
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("File not open")));
	}
	
	int c = fgetc(file);
	
	if (c == EOF) {
		return Null();
	}
	
	return Integer::New(c);
	
}

/**
 * Write a single byte to the file.
 */
Handle<Value> FileWriteByte(const Arguments& args) {
	HandleScope scope;

	FILE* file = unwrap(args);
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("File not open")));
	}

	if (args.Length() < 1 || ! args[0]->IsNumber() ) {
		return ThrowException(Exception::TypeError(String::New("Missing parameter to writeByte")));
	}
	int32_t c = args[0]->ToInt32()->Int32Value();
	
	c = fputc(c, file);
	
	if (c == EOF) {
		return ThrowException(Exception::TypeError(String::New("Error writing byte")));
	}
	
	return Undefined();
	
}

/**
 * Read a line of utf-8 text from the stream. This reads till the next `\n` or `EOF` the end of the file.
 * @return a String
 */
Handle<Value> FileReadString(const Arguments& args) {
	HandleScope scope;

	FILE* file = unwrap(args);
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("File not open")));
	}
	
	int CHUNK_SIZE = 1024;
	int size = CHUNK_SIZE;
	char* buffer = new char[size];
	
	int c = 0;
	int i = 0;
	
	do {
		c = fgetc(file); // TODO persumably fgets would be faster
		if ( c == EOF ) {
			break;
		}
		buffer[i++] = c;
		if ( i == size ) {
			char* newBuffer = new char[size + CHUNK_SIZE];
			memcpy(newBuffer, buffer, size);
			delete[] buffer;
			buffer = newBuffer;
			size += CHUNK_SIZE;
		}
	} while (c  != '\n' && c != EOF);

	if (c == EOF && i == 0) {
		return Null();
	}
	
	Handle<String> result = String::New(buffer, i);
	delete[] buffer;
	return result;
}

/**
 * Write a String.
 */
Handle<Value> FileWriteString(const Arguments& args) {
	HandleScope scope;

    FILE* file = unwrap(args);
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("File not open")));
	}

	if (args.Length() < 1 || ! args[0]->IsString() ) {
		return ThrowException(Exception::TypeError(String::New("Missing parameter to writeString")));
	}
	
	String::Utf8Value toWrite(args[0]);
	const char* ctoWrite = ToCString(toWrite);
	
	int c = fputs(ctoWrite, file);
	
	if (c == EOF) {
		return ThrowException(Exception::TypeError(String::New("Error writing string")));
	}
	
	return Undefined();
}
/**
 * Read a UTF-8 char from the terminal, basically read one byte and if the top bit is 0
 * its multibyte and we need to work out how many more to read and read them.
 * ref: http://en.wikipedia.org/wiki/UTF-8
 */
Handle<Value> FileReadChar(const Arguments& args) {
	HandleScope scope;

	FILE* file = unwrap(args);
	if (file == NULL) {
		return ThrowException(Exception::TypeError(String::New("File not open")));
	}

	char c[6];
	memset(c, 0, 6);
	int unicodeBytesToRead = 0;
	
	int read = getc(file);
	if (read <= 0) {
		return Null();
	}
	
	     if ((read & 0xff) >> 7 == B_0)  unicodeBytesToRead = 0;
	else if ((read & 0xff) >> 5 == B_110) unicodeBytesToRead = 1;
	else if ((read & 0xff) >> 4 == B_1110) unicodeBytesToRead = 2;
	else if ((read & 0xff) >> 3 == B_11110) unicodeBytesToRead = 3;
	else if ((read & 0xff) >> 2 == B_111110) unicodeBytesToRead = 4;
	else if ((read & 0xff) >> 1 == B_1111110) unicodeBytesToRead = 5;
	
	c[0] = (char)(read & 0xff);
	
	for ( int i = 0 ; i < unicodeBytesToRead ; i++) {
		c[i+1] = (char)(getc(stdin) & 0xff);
		if ( (c[i+1] & 0xff) >> 6 != B_10 ) {
			return ThrowException(Exception::TypeError(String::New("Invalid Unicode Char on input")));
		}
	}
	
	//if (unicodeBytesToRead == 0) {
	//	printf("char=%d", c[0] & 0xff);
	//}

	return String::New(c);

}
/**
 * @return the wrapped pointer to a FILE, may be NULL.
 */
static FILE* unwrap(const Arguments& args) {
	Local<Object> self = args.This();
	Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
	void* ptr = wrap->Value();
    return static_cast<FILE*>(ptr);
}

/**
 * Is not a file, NaF is thrown when file operations are tried on pipes.
 */
static bool isNaF(const Arguments& args) {
	Handle<Value> handle = args.This()->Get(String::New("path"));
	return handle->IsNull();
}