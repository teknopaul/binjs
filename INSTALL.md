
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

## Compiling binjs With different versions of Bash or v8

   This project only builds on Unix (Linux) and because of the way 
bash is built in a non-standard manner may not integrate very well 
with other build systems e.g. rpm and deb.

   v8 and bash source code are included in the source tree for this
reason but it is possible to build with a different version of bash
and/or v8 and it is possible to link to an existing version of v8 
library if you wish.

   v8 builds in the standard way, you can download any newwer 
version and compile it with gyp or whatever is the current flavour 
of the month.  Once build the .so file should be renamed but it is
a standard shared library.

   bash is built by changing the way the normal bash binary is
compiled.  The normal bash build outputs a binary file "bash"
but this project requires that the bash code be compiled as a library 
and have various functions exported.  The functions to be exported
are in binjs/src/libbash/libbash.c. 
   To compile binjs with a newer version of bash you have to mimic this
process but since bash provides no public API you have to ensure yourself
that the functions required by binjs are still available in the newer 
version of bash.

## Dependencies

   v8 has no dependencies on libbash and libbash has no dependencies
on v8,  binjs uses both libraries in various programs that are built.

   binjs depends on v8, libbash, glib and standard C and C++ libraries.


