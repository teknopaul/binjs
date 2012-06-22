#!/bin/bash
#
# Script to fix the bash build to enable compiling a shared libray containing the bash shell.
#
# This is a tad hacky, I should really patch bash and run make and rpmbuild.
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

			
if [ ! -d $BASH_SRC ] ; then
	echo "Read the comments in this script for how to build libbash yourself"
	if [ -f ../../contrib/libbash.so ] ; then
		echo "Not the end of the world you have the lib version"
		exit 0
	fi
	exit 1
fi

cd ${BASH_SRC}

cp -v ${SRC}/libbash.* .

# you only need to build bash with -fPIC once for dev of libbash.c itself
if [ "$1" != "--quick" ] ; then
	make -s clean
	./configure CFLAGS=-fPIC
	make -s
else 
	make -s
fi

# make libbash.a
ar -r libbash.a ${BASSH_OBJECTS}

rm ${SRC}/../../contrib/libbash.*

cp -v libbash.so.1 libbash.a ${SRC}/../../contrib
ln -s ${SRC}/../../contrib/libbash.so.1 ${SRC}/../../contrib/libbash.so
# ls -l $SRC/../../contrib

cd ${SRC}
gcc -Wall -fPIC  test/test_libbash.c -o test/test_libbash -lbash -L../../contrib

ls -l test/test_libbash

