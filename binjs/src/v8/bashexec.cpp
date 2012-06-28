/**
 * C++ functions for calling libbash's methods.
 *
 * @author teknopaul
 */
 
#include <string.h>
#include <unistd.h>

#include <v8.h>

#include "bashexec.h"

#include "../libbash/libbash.h"
#include "util.h"
#include "librunjs.h"


using namespace v8;

static Handle<FunctionTemplate> JOB_TEMPLATE;

static int lastCommandExitValue = 0;

// TODO String values allocated on the heap because they will be reused and dont benefit from GC
//static Persistent<String> PS_id = BJS_PSYMBOL("id");

/**
 * Extracts a C string from a V8 Utf8Value.
 */
static const char* ToCString(const String::Utf8Value& value) {
	return *value ? *value : "<string conversion failed>";
}


/**
 * Initialise the bash interpreter, override the signal handler.
 */
int InitBash(int argc, char **argv) {

	int ret = libbash_init(argc, argv);
	SetSignalHandler();
	return ret;
}

/**
 * Exit the bash shell.
 */
void ExitBash(int s) {

	libbash_exit(s);

}

/**
 * Execute a string as bash.  Calls libbash_run_one_command.
 * Prior to executing bash, watched vars from the global context are copied to
 * environment variables.
 * After execting the command
 *   env is copied back
 *   signal handler is reset
 *   erro not is set
 *   if cd was called, change directory
 *   threw builtin is processed
 *  
 */
Handle<Value> ExecAsBash(const Arguments& args) {
	HandleScope scope;

	Local<Context> context = Context::GetCurrent();
	Local<Object> global = context->Global();

	// get the comand to exec as a C string
	String::Utf8Value str(args[0]);
	const char* cstr = ToCString(str);

	// sync JavaScript variables to Bash env
	CopyVars();

	// exec
	libbash_run_one_command((char *)cstr);
		
	// set return value
	lastCommandExitValue = libbash_last_command_exit_value();
	global->Set(String::New("errno"), Integer::New(lastCommandExitValue));

	// set last asyncrnonous pid
	global->Set(String::New("lastpid"), Integer::New(libbash_last_asynchronous_pid()));
	
	// Set new Current Directory
	char *pwd = libbash_peak_variable("PWD");
	if ( pwd != NULL) {
		chdir(pwd);
	}
	
	// restore our signal handler
	SetSignalHandler();
	
	// Copy back any environment changes
	CopyEnv(args);
	
	// throw any exceptions
	char *exception = libbash_peak_variable("_EX");
	if ( exception != NULL) {
/*		
		printf("_EX=%s\n", exception);
*/
		char value[strlen(exception)];
		strcpy(value, exception);
		
		libbash_unset_variable("_EX");
		
		return ThrowException(Exception::TypeError(String::New(value)));
	}

	return Undefined();

}

/**
 * Set an environment variable into the scope of the embeded Bash runtime.
 */
Handle<Value> SetVariable(const Arguments& args) {
	HandleScope scope;

	if (args.Length() == 0) {
		return Undefined();
	}
	String::Utf8Value strName(args[0]);
	const char* cname = ToCString(strName);

	if (args.Length() == 1) {
		libbash_unset_variable(cname);
	}
	else {
		String::Utf8Value strValue(args[1]);
		const char *cvalue = ToCString(strValue);
		// copy needed becaue somehow the value gets deleted before libbash_set_variable finishes
		char copy[strlen(cvalue)];
		strcpy(copy, cvalue);
		libbash_set_variable(cname, copy);
	}

	return Undefined();
}

/**
 * Get an environment variable from Bash, might not be the same as
 * the env the program was started with.
 */
Handle<Value> GetVariable(const Arguments& args) {
	HandleScope scope;

	if (args.Length() == 0) {
		return Undefined();
	}
	
	String::Utf8Value strName(args[0]);
	const char* cname = ToCString(strName);
	
	char *var = libbash_peak_variable(cname);
	if (var == NULL) {
		return Null();
	}
	
	char value[strlen(var)];
	strcpy(value, var);

	return String::New(value);
}

/**
 * Return the exit value of the last command run by bash.
 */
Handle<Value> LastCommandExitValue(const Arguments& args) {
	HandleScope scope;
	
	return Integer::New(lastCommandExitValue);
}


void InitialiseJob(Handle<FunctionTemplate> jobTemplate) {

	JOB_TEMPLATE = jobTemplate;

}
/**
 * Returns an Array of Objects representing a running job.
 * Jobs are started by taking & on the end of the command line.
 * Jobs are indexed and have a pid, future versions should provide kill()
 * for now you can use bash syntax
 */
Handle<Value> GetJobs(const Arguments& args) {
	HandleScope scope;

	
	Local<Array> jsArray = Array::New(0);
	Local<Value> fun = jsArray->Get(String::New("push"));
	Local<Function> push = Local<Function>::Cast(fun);
	
	struct bash_job* jobs = libbash_get_jobs();
	int j = 1;
	while(jobs != NULL) {
	
		Handle<Object> jobsObject = JOB_TEMPLATE->GetFunction()->NewInstance();
		jobsObject->Set(String::New("id"),		Integer::New(j++));
		jobsObject->Set(String::New("pid"),		Integer::New(jobs->pid));
		jobsObject->Set(String::New("command"),	String::New(jobs->command));
		jobsObject->Set(String::New("running"),	Boolean::New(jobs->running != 0));
		jobsObject->Set(String::New("state"),	Integer::New(jobs->state));
		Handle<Value> argv[1] = { jobsObject };
		push->Call(jsArray, 1, argv);

		jobs = jobs->next;
	}
	
	libbash_free_jobs(jobs);
	
	return jsArray;
}

/**
 *  Copy environment from Bash to v8
 */
Handle<Value> CopyEnv(const Arguments& args) {
	HandleScope scope;

	// Find the $ variables
	Local<Context> context = args.This()->CreationContext();
	Local<Object> global = context->Global();
	
	Handle<Value> dollar = global->Get(String::New("$"));

	if (dollar->IsObject()) {
		Local<Object> dollarObj = dollar->ToObject();
		Handle<Value> env = dollarObj->Get(String::New("env"));
		if (env->IsObject()) {
			Local<Object> envObj = env->ToObject();
			
			struct bash_var* vars = libbash_get_all_variables();
		
			while (vars != NULL) {
				envObj->Set(String::New(vars->name), vars->value == NULL ? Null() : String::New(vars->value));
				vars = vars->next;
			}
			libbash_free_vars(vars);
			return True();
		}
	}
	return False();
	
}

/**
 *  Copy vars from JavaScript to Bash environment
 */
void CopyVars() {
	HandleScope scope;

	Local<Context> context = Context::GetCurrent();
	Local<Object> global = context->Global();

	// Find the $ variables
	Handle<Value> dollar = global->Get(String::New("$"));

	if (dollar->IsObject()) {
		Local<Object> dollarObj = dollar->ToObject();
		Handle<Value> watch = dollarObj->Get(String::New("watch"));
		if ( watch->IsArray()) {
			
			
			Local<Array> watchListObj(Array::Cast(*watch));
			//Local<Object> watchListObj = watch->ToObject();
			//Local<Array> names = watchListObj->GetPropertyNames();
			
			//printf("Found watch %d\n", names->Length());
			
			for ( uint32_t  i = 0 ; i < watchListObj->Length() ; i++) {
				Handle<Value> var = watchListObj->Get(i);
				Handle<Value> value = global->Get(var);
				
				if ( ! value->IsUndefined() && ! value->IsNull()) {
					String::Utf8Value varStr(var);
					String::Utf8Value valueStr(value);
					//printf("Setting %s=%s \n", ToCString(varStr), ToCString(valueStr));
					libbash_set_variable(
						ToCString(varStr), 
						const_cast<char *>(ToCString(valueStr))
						);
				}
			}
		}
	}
}






