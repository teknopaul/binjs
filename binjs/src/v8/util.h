#ifndef UTIL_H
#define UTIL_H

#include <v8.h>

using namespace v8;

Handle<String> SafeToString(Handle<Value> arg);

#define BJS_PSYMBOL(s) v8::Persistent<v8::String>::New(v8::String::NewSymbol(s))

#endif // UTIL_H
