#include <stdio.h>
#include <cstring>

#include "util.h"

#include <v8.h>

using namespace v8;

//static const char* ToCString(const String::Utf8Value& value) {
//	return *value ? *value : "<string conversion failed>";
//}

Handle<String> SafeToString(Handle<Value> arg) {
	
	//if ( arg->IsEmpty() ) return String::New("[missing]");
	if ( arg->IsNull() ) return String::New("[null]");
	if ( arg->IsUndefined() ) return String::New("[undefined]");
	return arg->ToString();

}

Handle<Value> Trim(const Arguments& args) {
	
	if ( args.Length() == 0 ) return Null();
	if ( args[0]->IsNull() ) return Null();
	if ( args[0]->IsUndefined() ) return Undefined();
	
	bool modified = 0;
	String::Utf8Value str(args[0]);
	char* cstr = *str;
	
	// top
	while ( *cstr == ' ') {
		modified = true;
		cstr++;
	}
	
	// tail
	int len = strlen(cstr);
	while ( cstr[len -1] == ' ') {
		modified = true;
		len--;
		cstr[len] = 0;
	};
	
	return modified ? String::New(cstr) : args[0]->ToString();

}

