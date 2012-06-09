#!/bin/bash

# make out/native/lib.target/libv8.so for this platform 
# using 4 compile threads to run gcc

make -j4 library=shared native

cp out/native/lib.target/libv8.so  ../binjs/contrib/libv8.so.1
mkdir -p ../binjs/contrib/include
cp include/*.h ../binjs/contrib/include

cd ../binjs/contrib
ln -s libv8.so.1 libv8.so
ls -l libv8.so*

echo -e "\033[33mBuilt v8.\033[0m"

