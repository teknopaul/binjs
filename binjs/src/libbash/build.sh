#!/bin/bash
#
# Script to fix the bash build to enable compiling a shared libray containing the bash shell.
#
# This is waaaay hacky, I should really patch bash and run make and rpmbuild.
# This script does not apply redhat patches.
#

# Get bash source with 
#	yumdownloader --source bash
#	mkdir wherever && cd wherever && copy bash-4*.rpm wherever
#	rpm -ivv bash-4*.rpm
#	cd /root/rpmbuild/SOURCES
#	gunzip bash-4.2.tar.gz
#	tar xvf bash-4.2.tar
#	then set BASH_SRC in this script

# Change this to where ever you installed bash

cd `dirname $0`
SRC=`pwd`

export BASH_SRC=../../../bash-4.2

BASH_OBJECTS="libbash.o eval.o y.tab.o general.o make_cmd.o print_cmd.o \
			dispose_cmd.o execute_cmd.o variables.o copy_cmd.o error.o expr.o \
			flags.o jobs.o subst.o hashcmd.o hashlib.o mailcheck.o trap.o input.o \
			unwind_prot.o pathexp.o sig.o test.o version.o alias.o array.o arrayfunc.o \
			assoc.o braces.o bracecomp.o bashhist.o bashline.o  list.o stringlib.o \
			locale.o findcmd.o redir.o pcomplete.o pcomplib.o syntax.o xmalloc.o"
			
BASH_DEPENDENCIES="-lbuiltins -lglob -lsh -lreadline -lhistory ./lib/termcap/libtermcap.a -ltilde -lmalloc -ldl"
			
if [ ! -d $BASH_SRC ] ; then
	echo "Read the comments in this script for how to build libbash yourself"
	if [ -f ../../contrib/libbash.sh ] ; then
		echo "Not the end of the world you have the lib version"
		exit 0
	fi
	exit 1
fi

cd ${BASH_SRC}

# you only need to build bash with -fPIC once for dev of libbash.c itself
if [ "$1" != "--quick" ] ; then
	make clean
	./configure CFLAGS=-fPIC
	make
fi

cp ${SRC}/libbash.* .

# compile libbash.c
gcc  -DPROGRAM='"bash"' -DCONF_HOSTTYPE='"x86_64"' -DCONF_OSTYPE='"linux-gnu"' -DCONF_MACHTYPE='"x86_64-unknown-linux-gnu"' \
		-DCONF_VENDOR='"unknown"' -DLOCALEDIR='"/usr/local/share/locale"' -DPACKAGE='"bash"' -DSHELL -DHAVE_CONFIG_H   \
		-I.  -I. -I./include -I./lib  \
		-fPIC -c libbash.c

# link it, create libbash.so.1
gcc -L./builtins -L./lib/readline -L./lib/readline -L./lib/glob -L./lib/tilde -L./lib/malloc -L./lib/sh -L./lib/termcap  \
	-rdynamic  -fPIC -shared ${BASH_OBJECTS} \
	-o libbash.so.1 \
	${BASH_DEPENDENCIES}
	
# make libbash.a
ar -r libbash.a ${BASSH_OBJECTS}

rm ${SRC}/../../contrib/libbash.*

cp -v libbash.so.1 libbash.a ${SRC}/../../contrib
ln -s ${SRC}/../../contrib/libbash.so.1 ${SRC}/../../contrib/libbash.so
# ls -l $SRC/../../contrib

cd ${SRC}
gcc -Wall -fPIC  test/test_libbash.c -o test/test_libbash -lbash -L../../contrib

ls -l test/test_libbash

