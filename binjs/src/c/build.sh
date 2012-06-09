#!/bin/bash
#
# Build in bash, make does my head in
#
cd `dirname $0`

# this is needed because of some bug in some tool on Fedora16, apparently
if [ -f /usr/lib64/libstdc++.so.6 ] ; then
	EXTRA=/usr/lib64/libstdc++.so.6
fi

GLIBFLAGS=`pkg-config --cflags glib-2.0`
GLIBS=`pkg-config --libs glib-2.0`

gcc -Wall -fPIC -c libpreparser.c ${GLIBS} ${GLIBFLAGS}

gcc -Wall -fPIC preparser.c libpreparser.o ${GLIBS} \
					-o binjs_preparser\
					-I. ${GLIBFLAGS} 

gcc -Wall -fPIC binjs.c libpreparser.o ${EXTRA} ../v8/bashexec.o ../v8/file.o ../v8/util.o ../v8/librunjs.o  \
					-lv8 -lbash ${GLIBS} \
					-o binjs \
					${GLIBFLAGS} -L../../contrib

ls -l binjs_preparser binjs
