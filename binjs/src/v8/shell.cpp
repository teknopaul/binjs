#include <sys/ioctl.h>
#include <stdio.h>
#include <string.h>
#include <termios.h>

#include "shell.h"
#include <v8.h>

#define B_0  0
#define B_10  2
#define B_110  6
#define B_1110  14
#define B_11110  30
#define B_111110  62
#define B_1111110  126

bool got_orig = false;
struct termios orig_termios;

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

Handle<Value> ShellV8Version(const Arguments& args) {
	return String::New(V8::GetVersion());
}

Handle<Value> ShellMakeRaw(const Arguments& args) {
	HandleScope scope;

	struct termios p;
	
	int FNIN = fileno(stdin);
	
	tcgetattr(FNIN, &p);
	
	if ( ! got_orig ) {
		memcpy(&orig_termios, &p, sizeof(struct termios));
		got_orig = true;
	}
	
	cfmakeraw(&p);
	
	tcsetattr(FNIN, TCSANOW, &p);
	
	return Undefined();
}

Handle<Value> ShellReset(const Arguments& args) {
	HandleScope scope;

	if (got_orig) {
		tcsetattr(0, TCSANOW, &orig_termios);
	}

	return Undefined();
}
/**
 * Read a UTF-8 char from the terminal, basically read one byte and itf the tope bit is 0
 * its multibyte and we need to work out howmany more to read and read them.
 * ref: http://en.wikipedia.org/wiki/UTF-8
 */
Handle<Value> ShellReadChar(const Arguments& args) {
	HandleScope scope;

	// Little leason in how to read Unicode form the stream it might read 1 to 6 bytes.
	char c[6];
	memset(c, 0, 6);
	int unicodeBytestoRead = 0;
	
	int read = getc(stdin);
	if (read == 0) {
		return Null();
	}
	
	     if ((read & 0xff) >> 7 == B_0)  unicodeBytestoRead = 0;
	else if ((read & 0xff) >> 5 == B_110) unicodeBytestoRead = 1;
	else if ((read & 0xff) >> 4 == B_1110) unicodeBytestoRead = 2;
	else if ((read & 0xff) >> 3 == B_11110) unicodeBytestoRead = 3;
	else if ((read & 0xff) >> 2 == B_111110) unicodeBytestoRead = 4;
	else if ((read & 0xff) >> 1 == B_1111110) unicodeBytestoRead = 5;
	
	c[0] = (char)(read & 0xff);
	
	for ( int i = 0 ; i < unicodeBytestoRead ; i++) {
		c[i+1] = (char)(getc(stdin) & 0xff);
		if ( (c[i+1] & 0xff) >> 6 != B_10 ) {
			return ThrowException(Exception::TypeError(String::New("Invalid Unicode Char on input")));
		}
	}
	
	if (unicodeBytestoRead == 0) {
		printf("char=%d", c[0] & 0xff);
	}

	return String::New(c);

}

Handle<Value> ShellReadByte(const Arguments& args) {
	HandleScope scope;

	return Integer::New(getc(stdin));
}

Handle<Value> ShellWriteByte(const Arguments& args) {
	HandleScope scope;

	for ( int i = 0 ; i < args.Length(); i++) {
		if (args[i]->IsInt32()) {
			putc(args[i]->Int32Value() & 0xff, stdout);
		}
	}
	
	return Undefined();
}
