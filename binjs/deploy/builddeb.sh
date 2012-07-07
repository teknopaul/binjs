#!/bin/js
#
# Build the .deb, you must have built first.
#

cd `dirname $0`
PROJECT_ROOT=`pwd`/../..
NAME=binjs
. $PROJECT_ROOT/binjs/version
TMP_DIR=/tmp/binjs_debbuild

# make and empty DEB build setup
#rm -rf ${TMP_DIR}
mkdir -p ${TMP_DIR}/usr/lib/binjs
mkdir -p ${TMP_DIR}/DEBIAN
cp --archive -R  ${PROJECT_ROOT}/binjs/binjs-${VERSION}/* ${TMP_DIR}/usr/lib/binjs
cp --archive -R  ${PROJECT_ROOT}/binjs/deploy/DEBIAN/* ${TMP_DIR}/DEBIAN
find ${TMP_DIR} -type d | xargs chmod 755

dpkg-deb --build ${TMP_DIR} ../../binjs-${VERSION}-1.x86_64.deb

test -f ../../binjs-${VERSION}-1.x86_64.deb

if (errno === 0) {
	$.println("Done.", 'green');
}
else {
	$.println("File not created", 'red');
}
