#!/bin/bash
#
#  build bash v8 and binjs
#

#  TODO get dependencies from yum or apt
#  currenly only glibc-devel needed and standard build tools


cd `dirname $0`
BASEDIR=`pwd`

echo -e "\033[97mBuilding the v8 JavaScript interpreter \033[0m"
cd  v8
./build.sh		|| exit 1

cd $BASEDIR

echo -e "\033[97mBuilding the mighty Borne Again SHell \033[0m"
cd  bash-4.2
./configure		|| exit 2
make && touch make_normal.flag	|| exit 3

cd $BASEDIR

echo "Building #!/bin/js"

cd binjs
./build.sh

