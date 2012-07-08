


.PHONY: clean all doc install develop buildrpm builddeb

all:

	test -f v8/build/gyp/gyp || ( cd v8 && make dependencies )
	
	cd v8 && make -s -j4 library=shared native

	mkdir -p binjs/contrib/include
	
	cp v8/out/native/lib.target/libv8.so  binjs/contrib/libv8.so.1

	cp v8/include/*.h binjs/contrib/include

	cd binjs/contrib && ln -sf libv8.so.1 libv8.so
	ls -l binjs/contrib/libv8*

	cd binjs && make -s

#
# Make HTML files form the Markdown input
#
doc:
	cd binjs/doc && ./toHtml.bjs
	echo file://$(CURDIR)/binjs/doc/CoverPage.html

#
# Install by copying files to /usr/lib/binjs and symlinking
#
install:
	test `id -u` -eq "0" || ( echo -e "Must be root \ntry  sudo make install" && exit 1 )
	test -d binjs/binjs-@PACKAGE_VERSION@ || ( echo -e "run make all first" && exit 1 )
	mkdir -p ${prefix}
	cd binjs/binjs-@PACKAGE_VERSION@ && cp -Rv * ${prefix}
	chmod -R ugo+r ${prefix}
	chmod -R go-w ${prefix}
	find ${prefix} -name "*.so" -exec chmod ugo+x {} \;
	find ${prefix} -name "*.so.1" -exec chmod ugo+x {} \;

	ln -svf $(prefix)/lib/libv8.so.1 $(exec_prefix)/libv8.so.1
	cd  $(exec_prefix) && ln -svf libv8.so.1 libv8.so

	ln -svf $(prefix)/bin/binjs /bin/js
		
	$(prefix)/examples/wink.bjs

#
# Uninstall by just deleting files
# funny test syntax is vbecaseu each make line must return 0
#
uninstall:
	(test -g $(prefix) && rm -f $(prefix) 2>/dev/null) || echo not a symlink
	(test -d $(prefix) && rm -rf $(prefix) 2>/dev/null) || echo not a dir
	cd $(exec_prefix) && rm libv8.so.1 libv8.so
#
# Symlink output binjs-@PACKAGE_VERSION@ for easy developing
# After this is run you can just run make in binjs directory
# to compile and deploy any changes.
# You can only install or develop, not both
#
develop:
	test `id -u` -eq "0" || ( echo -e "Must be root \ntry  sudo make develop" && exit 1 )
	
	rm -f $(prefix)
	ln -svf $(CURDIR)/binjs/binjs-@PACKAGE_VERSION@  $(prefix)

	ln -svf $(prefix)/lib/libv8.so.1 $(exec_prefix)/libv8.so.1
	cd  $(exec_prefix) && ln -svf libv8.so.1 libv8.so

	rm -f /bin/js
	ln -svf $(prefix)/bin/binjs /bin/js
	
	$(prefix)/examples/wink.bjs
	
rpm:
	cd binjs/deploy && ./buildrpm.sh
	
deb:
	cd binjs/deploy && ./builddeb.sh
	
clean:
	cd v8 && make clean
	cd binjs && make clean
	cd bash-4.2 && make clean
	rm bash-4.2/test_libbash

