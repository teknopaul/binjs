#
# Start of a Makefile
#
# Compile with gcc and link with g++ so the C++ libraries get resolved properly
#
CC=gcc
CFLAGS=-I.
DEPS = libpreparser.h
EXT_OBJS=../v8/bashexec.o ../v8/file.o ../v8/util.o ../v8/shell.o ../v8/librunjs.o
GLIBS=`pkg-config --cflags --libs glib-2.0`
LIBS=-lv8 -lbash

%.o: %.c $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS) $(GLIBS)

all: libpreparser.o 
	gcc -Wall libpreparser.o binjs_preparser.c -o binjs_preparser $(GLIBS)
	gcc -Wall -c binjs.c `pkg-config --cflags glib-2.0`
	g++ -Wall binjs.o libpreparser.o $(EXT_OBJS) -o binjs $(LIBS) $(GLIBS)

.PHONY: clean

clean:
	rm -f *.o binjs binjs_preparser
