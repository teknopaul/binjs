/**
 * JavaScript launcher based heavily on example code from Google v8 installation and shell.cc.
 *
 * This is where most of the initialization of v8 and the JavaScript objects takes place.
 * 
 * This file has the following roles
 *
 * - init libbash
 * - init buildin JavaScript objects and methods (global)
 * - find and load libraries, including ~lib/binjs.js
 * - launch JavaScript files or JavaScript data passed in a pipe
 * - Run core methods like println 
 * - handles uncouaght exceptions
 *
 * @author teknopaul and others
 */

#include <string.h>
#include <assert.h>
#include <set>
#include <vector>

#include <v8.h>
#include <v8-debug.h>
#include <cstdio>
#include <cstdlib>
#include <unistd.h> 
#include <signal.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

#include "bashexec.h"
#include "file.h"
#include "util.h"
#include "term.h"
#include "runtime.h"

#include "../c/libpreparser.h"

using namespace v8;

// forward declarations

// The two main methods made available to C
/**
 * Execute a JavaScript file, exported to C as runjs_runjs.
 */
int RunJS(char* script_text);
/**
 * Execute JavaScript piped from the binjs C program. Exported to C as runjs_pipejs.
 */
int RunPipedJS(int pipe, int argc, char* argv[]);


// Forward declarations of methods made available to JavaScript.
Handle<Value> Print(const Arguments& args);
Handle<Value> PrintLine(const Arguments& args);
Handle<Value> Flush(const Arguments& args);
Handle<Value> Include(const Arguments& args);
Handle<Value> Sleep(const Arguments& args);
Handle<Value> Exit(const Arguments& args);

// Forward declarations of methods used to initialise the v8 instance.
Handle<String> ReadFile(const char* name);
Handle<String> ReadLibFile(const char* library);
Handle<String> ReadPipe(int pipe);
bool ExecuteString(Handle<String> source,
					 Handle<Value> name,
					 bool print_result,
					 bool report_exceptions);
Persistent<Context> CreateShellContext();
void ProcessArgs(Handle<Object> global, int argc , char* argv[]);
void ReportException(TryCatch* try_catch);

static bool IsLoaded(const char* library);

// constants TODO must come from autoconf
static const char* JS_LIBRARY_PATH = "/usr/lib/binjs/lib";

// Vector of libraries that have already been loaded.
static std::vector<const char*> *loadedLibraries = new std::vector<const char*>(); 

static bool bashInitialized = false;


// functions exported to C

extern "C" int runjs_init_bash(int argc, char** argv) {

	bashInitialized = true;
	return InitBash(argc, argv);

}

extern "C" int runjs_runjs(char *script_text) {

	return RunJS(script_text);

}

extern "C" int runjs_pipejs(int pipe, int argc, char* argv[]) {

	return RunPipedJS(pipe, argc, argv);

}

/**
 * Exit from a signal i.e. SIGINT; i.e. Ctrl + C was called
 */
extern "C" void runjs_exit(int status) {

	//printf("EXITing from runjs.\n");
	
	DoTermReset();

	if ( bashInitialized ) {
		ExitBash(status);
	}

	exit(128 + status);

}


/**
 *  Extracts a C string from a V8 Utf8Value.
 */
static const char* ToCString(const String::Utf8Value& value) {
	return *value ? *value : "<string conversion failed>";
}

void SetSignalHandler() {

	//	signal(SIGPIPE, runjs_exit);
	signal(SIGINT,  runjs_exit);

}

/**
 * Execute a script, parameter must be a valid JavaScript string in C format
 * i.e. terminated with \0
 */
int RunJS(char* scriptText) {
	
	// Create a stack-allocated handle scope.
	HandleScope handle_scope;

	// Create a new context.
	Persistent<Context> context = CreateShellContext();

	if (context.IsEmpty()) {
		fprintf(stderr, "Error creating context\n");
		return 1;
	}
	
	TryCatch try_catch;
	
	Context::Scope context_scope(context);
	
	Handle<String> sourceCode = String::New(scriptText);

	Handle<Script> script = Script::Compile(sourceCode);
	
	if (script.IsEmpty()) {
		ReportException(&try_catch);
		return 2;
	}
	
	// Run the script.
	script->Run();
	
	if( try_catch.HasCaught() ) {
		ReportException(&try_catch);
		return 3;
	}

	context.Dispose();

	return 0;

}

/**
 * Execute JavaScript piped on a stream.
 */
int RunPipedJS(int pipe, int argc, char* argv[]) {

	// Create a stack-allocated handle scope.
	HandleScope handle_scope;

	// Create a new context.
	Persistent<Context> context = CreateShellContext();

	if (context.IsEmpty()) {
		printf("Error creating context\n");
		return 1;
	}
	
	TryCatch try_catch;
	
	Context::Scope context_scope(context);

	ProcessArgs(context->Global(), argc, argv);

	Handle<String> sourceCode = ReadPipe(pipe);

	Handle<Script> script = Script::Compile(sourceCode);
	
	if (script.IsEmpty()) {
		ReportException(&try_catch);
		return 2;
	}
	
	// Run the script.
	script->Run();
	
	if( try_catch.HasCaught() ) {
		ReportException(&try_catch);
		return 3;
	}
	
	//printf("Script run\n");

	context.Dispose();

	return 0;

}

/*
This would be nice but introduces cyclical dependencies so would need to 
fix the Makefiles before implementing.
Ideas it to be able to execute *.bjs files.
/
  Execute a bjs script, using the existing v8 instance.
 /
Handle<Value> RunBinJS(const Arguments& args) {
	
	// Create a stack-allocated handle scope.
	HandleScope handle_scope;

	// read the script to memory
	struct stat stat_s;
	
	String::Utf8Value str(args[0]);
	const char* script_file = ToCString(str);
	
	int stat_ret = stat(script_file, &stat_s);

	if (stat_ret != 0) {
		return ThrowException(Exception::TypeError(String::New("Unable to stat bjs file")));
	}

	off_t file_size = stat_s.st_size;

	if ( file_size == 0) {
		return Undefined();
	}

	int in = open(script_file, O_RDONLY);
	if (in == -1) {
		return ThrowException(Exception::TypeError(String::New("Unable to open bjs file")));
	}


	int pipefd[2];
	pipe(pipefd);
	int out = pipefd[1];
	
	struct binjs_parsed_doc doc;
	memset(&doc, 0 , sizeof(struct binjs_parsed_doc));
	
	int prep_err = binjs_preparse(in, out, &doc);
	if (prep_err) {
		if (doc.err == 1) {
			return ThrowException(Exception::TypeError(String::New("Error preparsing")));
		}
		
		if (doc.err == 2) {
			fprintf(stderr, "Warning preparsing %s\n", doc.warning);
		}
	}

	close(out);

	TryCatch try_catch;
	
	Handle<String> sourceCode = ReadPipe(pipefd[0]);

	Handle<Script> script = Script::Compile(sourceCode);
	
	if (script.IsEmpty()) {
		ReportException(&try_catch);
		return Integer::New(2);
	}
	
	// Run the script.
	script->Run();
	
	if( try_catch.HasCaught() ) {
		ReportException(&try_catch);
		Integer::New(3);
	}

	return Integer::New(0);
}
*/

// TODO v8 debugging
void DebuggerCallback(DebugEvent event,
                        Handle<Object> exec_state,
                        Handle<Object> event_data,
                        Handle<Value> data){
printf("here %d\n", 2 );
return;

}

Handle<Value> ScopeDump(const Arguments& args) {
	HandleScope scope;
	
	//Local<Context> ctx = Context::GetCalling();
	Debug debug;
	Debug::ClientData clientData;
	//Debug::EventCallback that;
	Handle<Value> data;
	Debug::SetDebugEventListener(DebuggerCallback ,data); 
	//Debug::Message message;
	debug.DebugBreak();
	Debug::DebugBreakForCommand();
	Debug::ProcessDebugMessages();
	//debug.CancelDebugBreak();
	
	printf("here %d\n", 1 );
	
	return Integer::New(0);
}


/**
 * Creates a new execution environment containing the built-in functions and Objects.
 * 
 * Sets up the binjs_* functions into the global context and the File and Job Objects.
 * 
 */
Persistent<Context> CreateShellContext() {
	Handle<ObjectTemplate> global = ObjectTemplate::New();
	
	// global methods start wth binjs_  many callable via $.
	global->Set(String::New("binjs_print"),		FunctionTemplate::New(Print));
	global->Set(String::New("binjs_println"),	FunctionTemplate::New(PrintLine));
	global->Set(String::New("binjs_flush"),		FunctionTemplate::New(Flush));
	global->Set(String::New("binjs_import"),	FunctionTemplate::New(Include));
	global->Set(String::New("binjs_include"),	FunctionTemplate::New(Include));
	global->Set(String::New("binjs_sleep"),		FunctionTemplate::New(Sleep));
	global->Set(String::New("binjs_exit"),		FunctionTemplate::New(Exit));
	global->Set(String::New("binjs_trim"),		FunctionTemplate::New(Trim));
	global->Set(String::New("binjs_scopeDump"),	FunctionTemplate::New(ScopeDump));

	// libbash functions
	global->Set(String::New("binjs_exec"),		FunctionTemplate::New(ExecAsBash));
	global->Set(String::New("binjs_setEnv"),	FunctionTemplate::New(SetVariable));
	global->Set(String::New("binjs_getEnv"),	FunctionTemplate::New(GetVariable));
	global->Set(String::New("binjs_copyEnv"),	FunctionTemplate::New(CopyEnv));
	global->Set(String::New("binjs_getJobs"),	FunctionTemplate::New(GetJobs));
	
	// term functions
	global->Set(String::New("binjs_termWidth"),		FunctionTemplate::New(TermWidth));
	global->Set(String::New("binjs_termHeight"),	FunctionTemplate::New(TermHeight));
	global->Set(String::New("binjs_termMakeRaw"),	FunctionTemplate::New(TermMakeRaw));
	global->Set(String::New("binjs_termReset"),		FunctionTemplate::New(TermReset));
	global->Set(String::New("binjs_termReadChar"),	FunctionTemplate::New(TermReadChar));
	global->Set(String::New("binjs_termReadByte"),	FunctionTemplate::New(TermReadByte));
	global->Set(String::New("binjs_termWriteByte"),	FunctionTemplate::New(TermWriteByte));

	// runtime function
	global->Set(String::New("binjs_v8Version"),		FunctionTemplate::New(RuntimeV8Version));
	global->Set(String::New("binjs_bashVersion"),	FunctionTemplate::New(RuntimeBashVersion));
	global->Set(String::New("binjs_binjsVersion"),	FunctionTemplate::New(RuntimeBinjsVersion));
	global->Set(String::New("binjs_isatty"),		FunctionTemplate::New(RuntimeIsATTY));

	
	// The File object
	Handle<FunctionTemplate> fileTemplate = FunctionTemplate::New(FileConstructor);
	fileTemplate->SetClassName(String::New("File"));
	global->Set(String::New("File"),	fileTemplate);
	InitialiseFile(fileTemplate);

	// The Job object
	Handle<FunctionTemplate> jobTemplate = FunctionTemplate::New();
	jobTemplate->SetClassName(String::New("Job"));
	global->Set(String::New("Job"),	jobTemplate);
	InitialiseJob(jobTemplate);


	Persistent<Context> context = Context::New(NULL, global);
		
	return context;
}

/**
 * Process command line arguments, sets the "magic" vars argc and argv and errno and pid
 * and lastpid into the global scope.
 */
void ProcessArgs(Handle<Object> global, int argc , char* argv[]) {
	// program argc and argv
	Handle<Value> jsArgc = Integer::New(argc);
	global->Set(String::New("argc"), jsArgc);
	
	Local<Array> jsArgv = Array::New(0);
	global->Set(String::New("argv"),	jsArgv);

	Local<Value> fun = jsArgv->Get(String::New("push"));
	Local<Function> push = Local<Function>::Cast(fun);
	
	for (int i = 0 ; i < argc; i++) {
	
		v8::Handle<Value> methodArgv[1] = { String::New(argv[i]) };
		push->Call(jsArgv, 1, methodArgv);

	}
	
	global->Set(String::New("errno"), Integer::New(0));
	global->Set(String::New("pid"), Integer::New(getpid()));
	global->Set(String::New("lastpid"), Integer::New(0));
}

/**
 * Print a string to stdout, something JavaScript can't normally do.
 */
Handle<Value> Print(const Arguments& args) {
	HandleScope handle_scope;

	Handle<String> sss = SafeToString(args[0]); // TODO there is a Builtin for this
	String::Utf8Value str(sss);
	const char* cstr = ToCString(str);
	printf("%s", cstr);
	
	if ( cstr[strlen(cstr) -1] == '\n' ) fflush(stdout);
	
	return Undefined();
	
}

/**
 * Print a string to stderr.
 */
Handle<Value> PrintErr(const Arguments& args) {
	HandleScope handle_scope;

	Handle<String> sss = SafeToString(args[0]); // TODO there is a Builtin for this
	String::Utf8Value str(sss);
	const char* cstr = ToCString(str);
	fprintf(stderr, "%s", cstr);
	
	if ( cstr[strlen(cstr) -1] == '\n' ) fflush(stderr);
	
	return Undefined();
	
}
/**
 * Print a string to stdout terminated with a \n newline and flush stdout.
 */
Handle<Value> PrintLine(const Arguments& args) {

	Print(args);

	printf("\n");

	fflush(stdout);
	
	return Undefined();
	
}
/**
 * Flush stdout buffers.
 */
Handle<Value> Flush(const Arguments& args) {

	fflush(stdout);

	return Undefined();

}

/**
 * We are single threaded, so we need a sleep method not setTimeout and friends.
 */
Handle<Value> Sleep(const Arguments& args) {
	if (args.Length() == 1 && args[0]->IsNumber()) {
		int64_t millis = args[0]->ToInteger()->Value();
		usleep(millis * 1000);
	}
	return Undefined();
}

/**
 * Exit the application, calls the C function exit().
 */
Handle<Value> Exit(const Arguments& args) {
	if (args.Length() == 1 && args[0]->IsNumber()) {
		int64_t s = args[0]->ToInteger()->Value();
		exit(s);
	}
	return Undefined();
}

/**
 * The callback that is invoked by v8 whenever the JavaScript 'binjs_include'
 * function is called.	Compiles and executes its argument which is a file containg
 * JavaScript code.
 * If the file has the ~lib/ prefix it is loaded from the JS_LIBRARY_PATH location
 * otherwise normal filesystem rules apply.
 */
Handle<Value> Include(const Arguments& args) {

	for (int i = 0; i < args.Length(); i++) {
	
		TryCatch try_catch;
		
		HandleScope handle_scope;
		String::Utf8Value file(args[i]);
		if (*file == NULL) {
			return ThrowException(Exception::TypeError(String::New("Loading file, file was null")));
		}

		//printf("Loading %s\n", ToCString(file));
		if (IsLoaded(*file)) {
			return Undefined();
		}

		Handle<String> source;
		if (strncmp(*file, "~lib/", 5) == 0) {
			source = ReadLibFile(*file + 5);
		}
		else {
			source = ReadFile(*file);
		}
		
		if (source.IsEmpty()) {
			return ThrowException(Exception::TypeError(String::New("Error loading file")));
		}
		if (!ExecuteString(source, String::New(*file), false, true)) {
			printf("Error executing %s\n", ToCString(file));
			if (try_catch.HasCaught()) {
				ReportException(&try_catch);
			}
			return ThrowException(Exception::TypeError(String::New("Error executing file")));
		}

	}
	return Undefined();
}

/**
 * Reads a file into a v8 string.
 */
Handle<String> ReadFile(const char* name) {
	
	FILE* file = fopen(name, "rb");
	if (file == NULL) return Handle<String>();

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
 * Reads a library file into a v8 string.
 * 
 * libraries are marked with ~lib/ prefix
 */
Handle<String> ReadLibFile(const char* library) {

	int pathLen = strlen(JS_LIBRARY_PATH);
	char fileName[pathLen + 1 + strlen(library)];
	
	strcpy(fileName, JS_LIBRARY_PATH);
	fileName[pathLen] = '/';
	strcpy(fileName + 1 + pathLen, library);

	FILE* file = fopen(fileName, "rb");
	if (file == NULL) return Handle<String>();

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
 * Reads a unix pipe containing JavaScript data into a v8 string.
 */
Handle<String> ReadPipe(int pipe) {

	if (pipe == 0) return Handle<String>();

	int bufferSize = 1024 * 64;	// 64K should be enough for everyone :)

	int byteCount = 0; // total byte count for all the data
	int memorySize = bufferSize; // total available memory in the bigger array
	char* chars = new char[memorySize + 1]; // the array with all the data
	char* buffer[bufferSize];  // a buffer being loaded
	
	while ( true ) {

		int bytesRead = read(pipe, &buffer, bufferSize);
		
		if (bytesRead == 0) {

			chars[byteCount] = 0; // terminate the string

			Handle<String> result = String::New(chars, byteCount);
			delete[] chars;
			
			return result;
			
		}
		else if (bytesRead < 0) {
			
			fprintf(stderr, "Error reading pipe\n");
			delete[] chars;
			
			return Handle<String>();
			
		}
		else {
			
			if ( bytesRead > memorySize - byteCount) { // grow the chars array
				char* tmp = chars;
				memorySize *= 2;
				chars = new char[memorySize + 1];
				
				memcpy(chars, tmp, byteCount);
				delete[] tmp;
			}
			memcpy(chars + byteCount, buffer, bytesRead);
			byteCount += bytesRead;
			
		}
	}

}

/**
 * Executes a string within the current v8 context.
 */
bool ExecuteString(Handle<String> source,
					 Handle<Value> name,
					 bool print_result,
					 bool report_exceptions) {
	
	HandleScope handle_scope;
	TryCatch try_catch;
	
	Handle<Script> script = Script::Compile(source, name);
	if (script.IsEmpty()) {

		if (report_exceptions) ReportException(&try_catch);
		return false;
	
	} else {
		
		Handle<Value> result = script->Run();
		if (result.IsEmpty()) {
			assert(try_catch.HasCaught());
			if (report_exceptions) ReportException(&try_catch);
			return false;
		
		} else {
			
			assert(!try_catch.HasCaught());
			
			if (print_result && !result->IsUndefined()) {
				// If all went well and the result wasn't undefined then print the returned value.
				String::Utf8Value str(result);
				const char* cstr = ToCString(str);
				printf("%s\n", cstr);
			}
			
			return true;
			
		}
	}
}

/**
 * Report exceptions
 */
void ReportException(TryCatch* try_catch) {
	HandleScope handle_scope;
	
	String::Utf8Value exception(try_catch->Exception());
	const char* exception_string = ToCString(exception);
	Handle<Message> message = try_catch->Message();
	
	if (message.IsEmpty()) {
		
		// V8 didn't provide any extra information about this error; just print the exception.
		fprintf(stderr, "%s\n", exception_string);
		
	} else {
		
		// Print (filename):(line number): (message).
		String::Utf8Value filename(message->GetScriptResourceName());
		const char* filename_string = ToCString(filename);
		int linenum = message->GetLineNumber();
		
		fprintf(stderr, "%s:%i: %s\n", filename_string, linenum, exception_string);
		
		// Print line of source code.
		String::Utf8Value sourceline(message->GetSourceLine());
		const char* sourceline_string = ToCString(sourceline);
		fprintf(stderr, "%s\n", sourceline_string);
		
		// Print wavy underline (GetUnderline is deprecated).
		int start = message->GetStartColumn();
		for (int i = 0; i < start; i++) {
			fprintf(stderr, " ");
		}
		int end = message->GetEndColumn();
		for (int i = start; i < end; i++) {
			fprintf(stderr, "^");
		}
		fprintf(stderr, "\n");
		
		String::Utf8Value stack_trace(try_catch->StackTrace());
		if (stack_trace.length() > 0) {
			const char* stack_trace_string = ToCString(stack_trace);
			fprintf(stderr, "%s\n", stack_trace_string);
		}
	}
}

/**
 * Keeps track of loaded libraries.
 *
 * In orderto prevent infinite loops when .js files import libraries that have cyclical dependencies
 * libraries can only be loaded once.
 */
static bool IsLoaded(const char* library) {
	
	unsigned int i = 0;
	for (; i < loadedLibraries->size(); i++) {
		const char * next = loadedLibraries->at(i);
		if (strcmp(next, library) == 0) {
			
			return true;
			
		}
	}

	char * copy = new char[strlen(library) + 1 ];
	strcpy(copy, library);
	loadedLibraries->push_back(copy);
	
	return false;
	
}

























