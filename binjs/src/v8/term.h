#ifndef TERM_H
#define TERM_H

#include <v8.h>

using namespace v8;

Handle<Value> TermWidth(const Arguments& args);

Handle<Value> TermHeight(const Arguments& args);

Handle<Value> TermV8Version(const Arguments& args);

Handle<Value> TermMakeRaw(const Arguments& args);

Handle<Value> TermReset(const Arguments& args);

Handle<Value> TermReadChar(const Arguments& args);

Handle<Value> TermReadByte(const Arguments& args) ;

Handle<Value> TermWriteByte(const Arguments& args);

void DoTermReset();

#endif // TERM_H
