#ifndef SHELL_H
#define SHELL_H

#include <v8.h>

using namespace v8;

Handle<Value> ShellWidth(const Arguments& args);

Handle<Value> ShellHeight(const Arguments& args);

Handle<Value> ShellV8Version(const Arguments& args);

Handle<Value> ShellMakeRaw(const Arguments& args);

Handle<Value> ShellReset(const Arguments& args);

Handle<Value> ShellReadChar(const Arguments& args);

Handle<Value> ShellReadByte(const Arguments& args) ;

Handle<Value> ShellWriteByte(const Arguments& args);


#endif // SHELL_H
