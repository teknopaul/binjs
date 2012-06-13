
# Installation Instructions

Copyright (C) 2013 teknopaul

   Copying and distribution of this file, with or without modification,
are permitted in any medium without royalty provided the copyright
notice and this notice are preserved.  This file is offered as-is,
without warranty of any kind.

## Basic Installation

   This project is buit with scripts called ./build.sh which
call the builds for bash and v8 and runjs and because root permissions
are needed installs with a separate script. To verify that you have the 
required build tool to compile the source run checkdeps.sh and install
usign yum or apt-get what ever is reported as missing. Then compile 
and install with.

    ./build.sh
    sudo ./install.sh

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
are in binjs/src/libbash/libbash.c.  Each object in the bash source
must be compiled again with -fPIC as the CFLAGS so that it can finally
be compiled with libbash.c and output as a shared library.  The existing 
build outputs libbash.so and is dynamically linked to binjs. To 
compile binjs without a newwer version of bash you have to mimic this
process but since bash provides no public API you have to ensure yourself
that the functions required by binjs are stil available in the newer 
version of bash.  When comiling libbash.sh a list of all the bash object
files is used inthe src/libbash/build.sh script, a newer version of
bash may need this list updated.

## Dependencies

   v8 has no dependencies on libbash and libbash has no dependencies
on v8,  binujs uses both libraries in various programs that are built.
If you like libbash you can link to your own programs and have an internal
bash commandline with exposed variables.  Its kinda cool go play.

   binjs depends on v8, libbash, glib and standard C and C++ libraries.

