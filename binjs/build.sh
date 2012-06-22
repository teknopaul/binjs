#!/bin/bash
#
# Hacky 'ol build script for the moment (whadya expect this is a scripting project)
#
#  add --quick to skip make clean in the bash part
#

cd `dirname $0`
BASEDIR=`pwd`

. ./version

echo -e "\033[97mBuilding #!/bin/js version ${VERSION} \033[0m"

mkdir -p $BASEDIR/build
cd $BASEDIR/build
mkdir -p bin lib examples doc

cd $BASEDIR

# make libbash tests to see if you have made bash as default  or if the -fPIC build has been done
echo -e "\033[33mMake libbash \033[0m"
src/libbash/build.sh $1		||  exit 1

# make runjs v8 JavaScript runner
echo -e "\033[33mMake runjs \033[0m"
cd $BASEDIR/src/v8
./build.sh				||  exit 1

cp librunjs.so.1 $BASEDIR/build/lib
cp runjs $BASEDIR/build/bin

# make binjs  and preparser tools
echo -e "\033[33mMake binjs \033[0m"
cd $BASEDIR/src/c
./build.sh				||  exit 1
cp binjs binjs_preparser $BASEDIR/build/bin

echo -e "\033[33mCopying artifacts to build dir \033[0m"
cd $BASEDIR/src/js
cp *.js $BASEDIR/build/lib

cd $BASEDIR/contrib
cp *.so.1 $BASEDIR/build/lib

cd $BASEDIR/examples
cp * $BASEDIR/build/examples

cd $BASEDIR/doc
cp * $BASEDIR/build/doc

test -d $BASEDIR/binjs-${VERSION} && rm -rf $BASEDIR/binjs-${VERSION}
mv $BASEDIR/build $BASEDIR/binjs-${VERSION}

if [ "$1" == "--package" ] ; then
	echo -e "\033[33mMakeing binjs-${VERSION}.tar.gz 033[0m"
	cd $BASEDIR
	test -f binjs-${VERSION}.tar.gz && rm binjs-${VERSION}.tar.gz
	tar cvfz binjs-${VERSION}.tar.gz binjs-${VERSION}
fi

echo -e "\033[32mDone.\033[0m"


