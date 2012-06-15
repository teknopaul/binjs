#ifndef UTIL_H
#define UTIL_H

#include <v8.h>

using namespace v8;

Handle<String> SafeToString(Handle<Value> arg);

Handle<Value> Trim(const Arguments& args);

// TODO How to get Persistent Strings working
#define BJS_PSYMBOL(s) v8::Persistent<v8::String>::New(v8::String::NewSymbol(s))

#endif // UTIL_H
