#!/bin/js
binjs_import("~lib/Assert.js");
var assert = new Assert();


function modGlobalGI() { 
	if (true) gi++; 
	BASH_VIEW=`echo "$gi"`
	assert.equal("6", $.env.BASH_VIEW); 
}

function modLocalGI() {
	var gi = 999; // create a local scopped gi
	gi++;       // modify it
	
	BASH_VIEW=`echo "X$gi"`  # confuse yourself by refering to global $gi
	assert.equal("X5", $.env.BASH_VIEW);
}

gi = 5;
modGlobalGI();

gi = 5;
modLocalGI();
 
// Fiddling with the global scope
// This is deliberatly nasty syntax we dont want you to do this

if (true) gx = 23;
$.watch.push("gx");

BASH_VIEW=`echo "X$gx"`

assert.equal("X23", $.env.BASH_VIEW);

