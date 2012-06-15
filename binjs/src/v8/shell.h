#ifndef SHELL_H
#define SHELL_H

#include <v8.h>

using namespace v8;

Handle<Value> ShellWidth(const Arguments& args);

Handle<Value> ShellHeight(const Arguments& args);


#endif // SHELL_H
