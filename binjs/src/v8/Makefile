#
# Makefile for v8 modifications
#
#

CC=g++
CONTLINKS=-lv8 -lpthread
CONTINCS=-I../../contrib/include
CONTLIBS=-L../../contrib
DEPS = file.h util.h term.h bashexec.h
OBJS = file.o util.o term.o bashexec.o

%.o: %.cpp $(DEPS) librunjs.h
	$(CC) -Wall -fPIC -c -o $@ $< $(CONTINCS)

all: $(OBJS) 
	g++ -Wall -fPIC -c librunjs.cpp $(CONTINCS)
	g++ -Wall -fPIC -shared librunjs.cpp $(OBJS) $(CONTLINKS) $(CONTINCS) $(CONTLIBS) -lbash \
		-o librunjs.so.1
	rm -f librunjs.so
	ln -s librunjs.so.1 librunjs.so
	g++ -Wall -fPIC runjs.c librunjs.o $(OBJS) $(CONTLINKS) $(CONTINCS) $(CONTLIBS) -lbash \
		-o runjs
	ls -l runjs librunjs.so.1

.PHONY: clean

clean:
	rm -f *.o runjs librunjs.so.1 librunjs.so librunjs.o
