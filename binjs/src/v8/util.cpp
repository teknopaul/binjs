#include "util.h"

#include <v8.h>

using namespace v8;

Handle<String> SafeToString(Handle<Value> arg) {
	
	//if ( arg->IsEmpty() ) return String::New("[missing]");
    if ( arg->IsNull() ) return String::New("[null]");
    if ( arg->IsUndefined() ) return String::New("[undefined]");
   	return arg->ToString();

}

