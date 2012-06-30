#include <sys/ioctl.h>
#include <stdio.h>
#include <string.h>
#include <termios.h>

#include "term.h"
#include <v8.h>

#define B_0  0
#define B_10  2
#define B_110  6
#define B_1110  14
#define B_11110  30
#define B_111110  62
#define B_1111110  126

bool haveOriginalTermSettings = false;
struct termios originalTermSettings;

using namespace v8;

Handle<Value> TermWidth(const Arguments& args) {
	HandleScope scope;
	
	struct winsize w;
	ioctl(0, TIOCGWINSZ, &w);

	return Integer::New(w.ws_col);

}

Handle<Value> TermHeight(const Arguments& args) {
	HandleScope scope;
	
	struct winsize w;
	ioctl(0, TIOCGWINSZ, &w);

	return Integer::New(w.ws_row);
	
}

Handle<Value> TermMakeRaw(const Arguments& args) {
	HandleScope scope;

	struct termios p;
	
	int FNIN = fileno(stdin);
	
	tcgetattr(FNIN, &p);
	
	if ( ! haveOriginalTermSettings ) {
		memcpy(&originalTermSettings, &p, sizeof(struct termios));
		haveOriginalTermSettings = true;
	}

	// make raw
	cfmakeraw(&p);
	tcsetattr(FNIN, TCSANOW, &p);
	
	// raw is cool but prevents Ctrl+C exits which is annoying
	struct termios pass_sigint;
	tcgetattr(FNIN, &pass_sigint);
	pass_sigint.c_iflag |= BRKINT;
	pass_sigint.c_lflag |= ISIG;

	tcsetattr(FNIN, TCSANOW, &pass_sigint);
	
	
	return Undefined();
}

Handle<Value> TermReset(const Arguments& args) {
	HandleScope scope;
	
	DoTermReset();
	
	// put cursor on if JS code left it off 
	// TODO not working why not?
	/*
	unsigned int cursorOn[6];
	cursorOn[0] = 27;
	cursorOn[1] = 91;
	cursorOn[2] = 63;
	cursorOn[3] = 50;
	cursorOn[4] = 53;
	cursorOn[5] = 104;
	int i = 0;
	for(i = 0 ; i < 6 ; i++) putc(cursorOn[i] & 0xff, stdout);
	*/
	
	return Undefined();
}

void DoTermReset() {

	if (haveOriginalTermSettings) {
		tcsetattr(0, TCSANOW, &originalTermSettings);
	}

}

/**
 * Read a UTF-8 char from the terminal, basically read one byte and itf the tope bit is 0
 * its multibyte and we need to work out howmany more to read and read them.
 * ref: http://en.wikipedia.org/wiki/UTF-8
 */
Handle<Value> TermReadChar(const Arguments& args) {
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
	
	//if (unicodeBytestoRead == 0) {
	//	printf("char=%d", c[0] & 0xff);
	//}

	return String::New(c);

}

Handle<Value> TermReadByte(const Arguments& args) {
	HandleScope scope;

	return Integer::New(getc(stdin));
}

Handle<Value> TermWriteByte(const Arguments& args) {
	HandleScope scope;

	for ( int i = 0 ; i < args.Length(); i++) {
		if (args[i]->IsInt32()) {
			putc(args[i]->Int32Value() & 0xff, stdout);
		}
	}
	
	return Undefined();
}
