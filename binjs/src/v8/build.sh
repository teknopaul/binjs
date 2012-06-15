#!/bin/bash
#
# Script to build runjs, library for running JavaScript
#
cd `dirname $0`

# this is needed because of some bug in some tool on Fedora16, apparently
if [ -f /usr/lib64/libstdc++.so.6 ] ; then
	EXTRA=/usr/lib64/libstdc++.so.6
fi

gcc -Wall -fPIC -c util.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib

gcc -Wall -fPIC -c bashexec.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib

gcc -Wall -fPIC -c file.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib
		
gcc -Wall -fPIC -c shell.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib
		
gcc -Wall -fPIC -c librunjs.cpp \
		-lv8 -lpthread \
		-I../../contrib/include \
		-L../../contrib

# create runjs shared library
gcc -Wall -fPIC -shared librunjs.cpp bashexec.o file.o shell.o util.o\
		-lv8 -lpthread -lbash \
		-o librunjs.so.1 \
		-I../../contrib/include \
		-L../../contrib
		
ln -s librunjs.so.1 librunjs.so 2>/dev/null
		
# create runjs executable
gcc -Wall -fPIC runjs.c librunjs.o bashexec.o file.o shell.o util.o ${EXTRA} \
		-lv8 -lpthread -lbash \
		-o runjs \
		-I../../contrib/include \
		-L../../contrib

ls -l runjs librunjs.so.1
