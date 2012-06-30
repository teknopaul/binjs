#ifndef RUNTIME_H
#define RUNTIME_H

#include <v8.h>

using namespace v8;


Handle<Value> RuntimeV8Version(const Arguments& args);

Handle<Value> RuntimeBashVersion(const Arguments& args);

Handle<Value> RuntimeBinjsVersion(const Arguments& args);

Handle<Value> RuntimeIsATTY(const Arguments& args);

#endif // RUNTIME_H
