
# Installation Instructions

Copyright (C) 2013 teknopaul

Copying and distribution of this file, with or without modification,
are permitted in any medium without royalty provided the copyright
notice and this notice are preserved.  This file is offered as-is,
without warranty of any kind.

## Basic Installation

This probject builds with make.

	./configure
	make
	sudo make install

you can also build or install .deb files.

## Compiling binjs

This project only builds on Unix (Linux) tested on Ubuntu.

bash source code is included in the source tree since it is 
modified. Original came from here.

	http://ftp.gnu.org/gnu/bash/bash-4.3.tar.gz

This should be post shell-shock, but I would not use binjs for uses that are exposed
to Internet input.

Unlike previous versions v8 is no longer built with binjs, install the dev
pacakge for you system.

	sudo aptitude install libv8-dev

bash is built by changing the way the normal bash binary is
compiled.  The normal bash build outputs a binary file "bash"
but this project requires that the bash code be compiled as a library 
and have various functions exported.  The functions to be exported
are in binjs/src/libbash/libbash.c. 

## Dependencies

v8 has no dependencies on libbash and libbash has no dependencies
on v8,  binjs uses both libraries in various programs that are built.

binjs depends on v8, libbash, glib and standard C and C++ libraries.


