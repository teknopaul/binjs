#!/bin/js
#
# Build the RPM,  N.B. latest build must be built and installed!"
#

#PROJECT_ROOT=/home/teknopaul/c_workspace/binjs

cd `dirname $0`
PROJECT_ROOT=`pwd`/../../
NAME=binjs
ARCH=`uname -i`
. $PROJECT_ROOT/binjs/version

# make and empty RPM build setup
mkdir -p /tmp/binjs_rpmbuild
mkdir -p /tmp/binjs_rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

#MACROS_FILE=~/.rpmmacros
MACROS_FILE=/tmp/binjs_rpmbuild/rpmrcs
echo '%_topdir /tmp/binjs_rpmbuild' > $MACROS_FILE
echo '%_builddir %{_topdir}/BUILD' >>  $MACROS_FILE
echo '%_rpmdir %{_topdir}/RPMS' >>  $MACROS_FILE
echo '%_sourcedir %{_topdir}/SOURCES' >>  $MACROS_FILE
echo '%_specdir %{_topdir}/SPECS' >>  $MACROS_FILE
echo '%_srcrpmdir %{_topdir}/SRPMS' >>  $MACROS_FILE
echo '' >>  $MACROS_FILE

echo 'include:	/usr/lib/rpm/rpmrc' > /tmp/binjs_rpmbuild/rpmrcs
echo 'macrofiles: /tmp/binjs_rpmbuild/macros' >> /tmp/binjs_rpmbuild/rpmrcs
cat /usr/lib/rpm/macros | sed -e 's/^%_topdir.*$/%_topdir \/tmp\/binjs_rpmbuild/' > /tmp/binjs_rpmbuild/macros

# make an empty src tar
mkdir -p binjs-$VERSION
tar cvf binjs-$VERSION.tar.gz binjs-$VERSION
cp binjs-$VERSION.tar.gz /tmp/binjs_rpmbuild/SOURCES

mkdir -p /tmp/binjs_rpmbuild/BUILD/binjs-$VERSION

# make the list of file included inthe RPM by looking at the build dirname

cd $PROJECT_ROOT/binjs/binjs-$VERSION
ALL_FILES=`find . -type f`  # gives a list of files starting with ./

var files = $.env.ALL_FILES.split('\n');
var fileListString = "";

for ( var i = 0 ; i < files.length ; i++ ) {

  fileListString += "\n/usr/lib/binjs" + files[i].substring(1) ;
  $.setEnv("FILE_NAME", "/usr/lib/binjs" + files[i].substring(1) ) ;
  DIR=`dirname /tmp/binjs_rpmbuild/BUILDROOT/binjs-${VERSION}-1.${ARCH}/$FILE_NAME`
  mkdir -p $DIR
  cp $FILE_NAME $DIR 

}

# $.println(fileListString); // list of all generated fiel s, ext symlinks

# copy this list into the spec file

var specTemplate = new File($.env.PROJECT_ROOT + "/binjs/deploy/binjs.spec").read().split('\n');

var finalSpec = "";
for ( var i = 0 ; i < specTemplate.length ; i++ ) {
	if  (specTemplate[i] == "@FILES_LIST@" ) {
		finalSpec += fileListString
	}
	else finalSpec += '\n' + specTemplate[i];
}
#$.println(finalSpec);

new File("/tmp/binjs_rpmbuild/SPECS/binjs-" + $.env.VERSION + "-1.spec").write(finalSpec);

$.println("Created /tmp/binjs_rpmbuild/SPECS/binjs-" + $.env.VERSION + "-1.spec", true);

## now build
#--buildroot /tmp/binjs_rpmbuild/BUILDROOT/binjs-${VERSION}-1.${ARCH} \

rpmbuild -bb \
	--rcfile /tmp/binjs_rpmbuild/rpmrcs \
	--macros /tmp/binjs_rpmbuild/macros \
	/tmp/binjs_rpmbuild/SPECS/binjs-${VERSION}-1.spec

if ( new File("/tmp/binjs_rpmbuild/RPMS/" 
		+ $.env.ARCH 
		+ "/binjs-" +$.env.VERSION  + "-1." + $.env.ARCH + ".rpm").exists ) {

	rm $PROJECT_ROOT/binjs-${VERSION}-1.${ARCH}.rpm 2>/dev/null
	mv /tmp/binjs_rpmbuild/RPMS/${ARCH}/binjs-${VERSION}-1.${ARCH}.rpm $PROJECT_ROOT
	if (errno === 0) $.println("Done.", 'green');
	
}
else {
	$.println("File not created : ", 'red');
}

rm -rf /tmp/binjs_rpmbuild
