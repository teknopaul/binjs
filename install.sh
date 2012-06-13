#!/bin/bash
#
# Installation script.
#
# This script copys everything needed to /lib/binjs then creates symlinks
#
# Run checkdeps.sh to verify if you have therequired build tools to install
#

# per HFS if the binary is /bin/js the libraries are in /lib/
INST_DIR=/lib/binjs



if [ `id -u` -ne "0" ] ; then
	echo -e "\033[93mMust be root \033[0m"
	echo "try  sudo $0"
	exit 1
fi

BASEDIR=`dirname $0`
cd "$BASEDIR"

. ./binjs/version

echo -e "\033[32mInstalling #!/bin/js version ${VERSION} \033[0m"

echo mkdir ${INST_DIR}
mkdir -p ${INST_DIR}

if [ ! -d binjs/binjs-${VERSION} ] ; then
	echo -e "\033[93mBuild the code first!\033[0m"
        echo  "try  ./build.sh"  
        exit 2
fi

# copy the whole build tree to /lib
cd "${BASEDIR}/binjs/binjs-${VERSION}"
cp -Rv * ${INST_DIR}

# symlinking, we have real .so.1 files in one place
# and we create so.1 links in the correct dir found by linkers
# and the .so  from the so.1 in the same dir

cd ${INST_DIR}/lib
for so in `ls -1 *.so.1`
do
	SO=`echo ${so} | sed -e 's/^lib\([^.]*\)\.so.1$/\1/g'`

	# Linking ${so}
	if [ -f /etc/debian_version ] ; then

		echo -e "Assuming \033[35mDebian\033[0m" /lib/${so}
		ln -s ${INST_DIR}/lib/${so} /lib/${so} 
		ln -s /lib/lib${SO}.so.1 /lib/lib${SO}.so  

	elif [ -f /etc/redhat-release ] ; then
		if [ -d /usr/lib64 ] ; then
			echo -e "Assuming \033[91mRedHat 64bit\033[0m" /lib64/${so}
			ln -s ${INST_DIR}/lib/${so} /lib64/${so} 
			ln -s /lib64/lib${SO}.so.1 /lib64/lib${SO}.so  
		else
			echo -e "Assuming \033[91mRedHat 32bit\033[0m" /lib64/${so}
			ln -s ${INST_DIR}/lib/${so} /lib/${so}
			ln -s /lib/lib${SO}.so.1 /lib/lib${SO}.so
		fi

	fi
done

echo -e "SymLinking  ${INST_DIR}/bin/binjs as \033[97m /bin/js\033[0m"
ln -s ${INST_DIR}/bin/binjs /bin/js


