#
#  autoconf script run with
#    autoreconf --force --install && ./configure
#
# All files built to /usr/lib/binjs by default changable with --prefix
# .so files are linked to /usr/lib  changable with --exec-prefix (this may not be correct thing to do but I'm an autoconf n00b)
# /bin/js is hardcoded.
#

## decide if we symlink to /usr/lib /usr/lib64 or somewhere else
AC_DEFUN([AX_FIND_USR_LIB],
[dnl
  if test "$exec_prefix" == NONE 
  then
    exec_prefix=/usr/lib
    if ( test -f /etc/redhat-release & test -d /usr/lib64)
    then
	  echo "assuming RedHat 64bit, change with --exec-prefix"
      exec_prefix=/usr/lib64
    fi
    if test -f /etc/debian_version 
    then
	  echo assuming Debian linking in /usr/lib64
	fi
  fi
  echo "linking in exec_prefix=$exec_prefix"
])

AC_DEFUN([AX_PREFIX_DEFAULT],
[dnl
  if test "$prefix" == NONE 
  then
    prefix=/usr/lib/binjs
  fi
  echo "prefix = $prefix"
])

# why  does this faile grrr autoconf can not be configured
#AC_INIT([binjs], m4_esyscmd([ cat ./binjs/version | tr -d 'a-zA-Z= \n' ]) , [me@teknopaul.com], [binjs], [http://code.abnoctus.com/binjs/])

# this is thus the golden source of the /bin/js version 
AC_INIT([binjs],[0.1],[me@teknopaul.com],[binjs],[http://code.abnoctus.com/binjs/])

# copy to something more readable
echo "export VERSION=${PACKAGE_VERSION}" > ./binjs/version

# this seems to reduce the amount of junk automake creates in ./
AC_CONFIG_AUX_DIR([binjs/config])

AM_INIT_AUTOMAKE([1.10 no-define foreign])

AC_PROG_CC
AC_PROG_CXX
AC_LANG(C)

AC_DEFINE(BINJS, yes, [/bin/js])

# by default install to /usr/lib/binjs , user can configure with --prefix (might break stuff at the moment)
# AC_PREFIX_DEFAULT prevents prefix getting to config.h for some reason use AX_PREFIX_DEFAULT instead
# AC_PREFIX_DEFAULT([/usr/lib/binjs])
AX_PREFIX_DEFAULT()
AX_FIND_USR_LIB()

AC_DEFINE_UNQUOTED(BINJS_PREFIX, ["$prefix"], [prefix])
AC_DEFINE_UNQUOTED(BINJS_EPREFIX, ["$exec_prefix"], [exec_prefix])

PKG_CHECK_MODULES([DEPS], [glib-2.0 >= 2.12.3])
# provides DEPS_CFLAGS=`pkg-config --cflags glib-2.0`
# and      DEPS_LIBS=`pkg-config --libs glib-2.0`
# which dont help unless theya re in CFLAGS CPPFLAGS and LIBS

CFLAGS=${DEPS_CFLAGS}
CPPFLAGS=${DEPS_CFLAGS}
LIBS=${DEPS_LIBS}


#echo CFLAGS=$CFLAGS, CPPFLAGS=$CPPFLAGS, LIBS=$LIBS
AC_SUBST(PACKAGE_VERSION)
AC_SUBST(PREFIX)
AC_SUBST(EPREFIX)

AC_CHECK_LIB(glib, g_hash_table_new)
AC_CHECK_HEADERS(glib.h)


AM_CONFIG_HEADER([binjs/src/binjs_config.h])

AC_CONFIG_FILES([
	Makefile
	binjs/Makefile
	binjs/src/c/Makefile
	binjs/src/libbash/Makefile
	binjs/src/v8/Makefile
	binjs/deploy/binjs.spec
	binjs/deploy/DEBIAN/control
])

AC_OUTPUT
