#!/bin/bash
#
# Synlink src tree to installation locations
#

INST_DIR=/lib/binjs

if [ `id -u` -ne "0" ] ; then
	echo -e "\033[93mMust be root \033[0m"
	echo "try  sudo $0"
	exit 1
fi

BASEDIR=`dirname $0`
cd "$BASEDIR"
BASEDIR=`pwd`

. ./binjs/version

echo -e "\033[32mSetting up #!/bin/js version ${VERSION} for hacking\033[0m"

if [ ! -d binjs/binjs-${VERSION} ] ; then
	echo -e "\033[93mBuild the code first!\033[0m"
        echo  "try  ./build.sh"  
        exit 2
fi

# symlink the whole build tree to /lib
ln -s ${BASEDIR}/binjs/binjs-${VERSION} ${INST_DIR}


# symlinking, we have real .so.1 files in one place
# and we create so.1 links in the correct dir found by linkers
# and the .so  from the so.1 in the same dir

cd ${INST_DIR}/lib
for so in `ls -1 *.so.1`
do
	SO=`echo ${so} | sed -e 's/^lib\([^.]*\)\.so.1$/\1/g'`

	# Linking ${SO}
	if [ -f /etc/debian_version ] ; then

		echo -e "Assuming \033[35mDebian\033[0m" /lib/${so}
		ln -s ${INST_DIR}/lib/${so} /lib/${so}
		ln -s /lib/lib${SO}.so.1 /lib/lib${SO}.so  

	elif [ -f /etc/redhat-release ] ; then
		if [ -d /usr/lib64 ] ; then
			echo -e "Assuming \033[91mRedHat 64bit\033[0m" /lib64/${so}
			ln -sv ${INST_DIR}/lib/${so} /lib64/${so} 
			ln -sv /lib64/lib${SO}.so.1 /lib64/lib${SO}.so  
		else
			echo -e "Assuming \033[91mRedHat 32bit\033[0m" /lib64/${so}
			ln -sv ${INST_DIR}/lib/${so} /lib/${so}
			ln -sv /lib/lib${SO}.so.1 /lib/lib${SO}.so  
		fi

	fi
done

echo -e "SymLinking  ${INST_DIR}/bin/binjs as \033[97m /bin/js\033[0m"
ln -sv ${INST_DIR}/bin/binjs /bin/js


