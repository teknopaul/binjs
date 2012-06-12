#!/bin/js
binjs_import("~lib/assert.js");
#
#  CommonJS spec assert library, copied from NodeJS and (and abused)
#

if (true) assert.ok(true);


try {
  if (true) assert.ok(false);
  $.error(1, "Assert failure should throw an error");
}
catch(err) {
  $.info(0, "Assert correctly threw Exception");
  if (err instanceof Error) {
    $.info(0, "Assert correctly threw Exception of type Error");
  }
}
