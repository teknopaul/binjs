#!/bin/bash
#
#
#

cd `dirname $0`

rm -rf contrib/*


. ./version

rm -rf binjs-${VERSION} 2>/dev/null
rm binjs-${VERSION}.tar.gz 2>/dev/null

rm examples/*~

src/c/clean.sh
src/v8/clean.sh
src/libbash/clean.sh
