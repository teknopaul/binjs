#ifndef FILE_H
#define FILE_H

#include <v8.h>

using namespace v8;

void InitialiseFile(Handle<FunctionTemplate> fileTemplate);

Handle<Value> FileConstructor(const Arguments& args);

Handle<Value> FileStat(const Arguments& args);

Handle<Value> FileIsFile(const Arguments& args);

Handle<Value> FileIsDirectory(const Arguments& args);

Handle<Value> FileIsSymlink(const Arguments& args);

Handle<Value> FileIsRoot(const Arguments& args);

Handle<Value> FileTouch(const Arguments& args);

Handle<Value> FileRename(const Arguments& args);

Handle<Value> FileDelete(const Arguments& args);

Handle<Value> FileList(const Arguments& args);

Handle<Value> FileRead(const Arguments& args);

Handle<Value> FileWrite(const Arguments& args);

#endif // FILE_H
