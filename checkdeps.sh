#!/bin/bash
#
# Check for the required build tools on this system 
#
#  todo  autoconf needed
# failed v8 does not stop th ebuild why not?
#

# need googls gyp or svn to download it
which gyp >/dev/null
if [ $? -ne 0 ] ; then
  which svn >/dev/null
  if [ $? -ne 0 ] ; then
    echo install svn or gyp && exit 1
  fi
fi

# need make and build env
which make >/dev/null
if [ $? -ne 0 ] ; then
  echo install make and friends && exit 1
fi

# need gcc 
which gcc >/dev/null
if [ $? -ne 0 ] ; then
  echo install gcc && exit 1
fi

# need pkg-config and glib.h
which pkg-config >/dev/null
if [ $? -ne 0 ] ; then
  echo install pkg-config && exit 1
fi

pkg-config --cflags glib-2.0 >/dev/null
if [ $? -ne 0 ] ; then
  echo install glib-2.0 development packages  && exit 1
fi

# glibc-headers

# also need coreutils and a bunch of other normal stuff 

## TODO this should be a ./configure script
