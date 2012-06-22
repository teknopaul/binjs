#!/bin/bash
#
# Script to build runjs, library for running JavaScript
#
cd `dirname $0`

g++ -Wall -fPIC -c util.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib

g++ -Wall -fPIC -c bashexec.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib

g++ -Wall -fPIC -c file.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib
		
g++ -Wall -fPIC -c shell.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib
		
g++ -Wall -fPIC -c librunjs.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib

# create runjs shared library
g++ -Wall -fPIC -shared librunjs.cpp bashexec.o file.o shell.o util.o\
		-lv8 -lpthread -lbash \
		-o librunjs.so.1 \
		-I../../contrib/include \
		-L../../contrib
		
ln -s librunjs.so.1 librunjs.so 2>/dev/null
		
# create runjs executable
g++ -Wall -fPIC runjs.c librunjs.o bashexec.o file.o shell.o util.o \
		-lv8 -lpthread -lbash \
		-o runjs \
		-I../../contrib/include \
		-L../../contrib

ls -l runjs librunjs.so.1
