#!/bin/js
#
# Ensure that CD works as expected
#
echo $0
echo PWD before cd $PWD
cd `dirname $0`
echo PWD after cd $PWD
echo pwd after cd `pwd`


// N.B. JavaScript does not behave as we would want it to!!

var cdFile = new File("./cd.bjs");

$.info(0, "cd_behaviour", JSON.stringify(cdFile));


