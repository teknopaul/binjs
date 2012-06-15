#include <sys/ioctl.h>
#include <stdio.h>

#include "shell.h"
#include <v8.h>

using namespace v8;

Handle<Value> ShellWidth(const Arguments& args) {
	HandleScope scope;
	
	struct winsize w;
	ioctl(0, TIOCGWINSZ, &w);

	return Integer::New(w.ws_col);

}

Handle<Value> ShellHeight(const Arguments& args) {
	HandleScope scope;
	
	struct winsize w;
	ioctl(0, TIOCGWINSZ, &w);

	return Integer::New(w.ws_row);
	
}
