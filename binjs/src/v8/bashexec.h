#ifndef BASHEXEC_H
#define BASHEXEC_H

#include <v8.h>

using namespace v8;

int InitBash(int argc, char **argv);

void ExitBash(int s);

Handle<Value> ExecAsBash(const Arguments& args);

Handle<Value> SetVariable(const Arguments& args);

Handle<Value> GetVariable(const Arguments& args);

Handle<Value> CopyEnv(const Arguments& args);

void CopyVars();

Handle<Value> LastCommandExitValue(const Arguments& args);

void InitialiseJob(Handle<FunctionTemplate> jobTemplate);

Handle<Value> GetJobs(const Arguments& args);

#endif // BASHEXEC_H
