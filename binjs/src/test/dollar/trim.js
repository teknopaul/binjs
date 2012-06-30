#!/bin/js
binjs_import("~lib/Assert.js");

var assert = new Assert();

assert.equal("Hello World",  " Hello World ".trim());
assert.equal("a",  " a".trim());
assert.equal("a",  "a ".trim());
assert.equal("",  " ".trim());
assert.equal("",  "  ".trim());


