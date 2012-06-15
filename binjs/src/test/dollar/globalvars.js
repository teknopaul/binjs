#!/bin/js

function modGlobalI() {i++;}
function modLocalI() {
	var gi = 999; // createa local scopped i
	gi++;       // modify it
	echo scoped gi is $gi  # confuse yourself by refering to global $i
}

for (gi = 0 ; gi < 5 ; gi++) {
	modGlobalGI();
	modLocalGI();
	echo gi is $gi
}

var gi = 23

$.println("local i is now " + gi);
 
// Fiddling with the global scope
// This is deliberatly nasty syntax we dont want you to do this

if (true) gx = 23;
$.watch.push("gx");

echo gx is $gx
if (true) gx = 24;
echo gx is $gx

