# Assert

Assert is a CommonJS like library for unit testing.  

The library closely conforms to the CommonJS spec, but is not identical, code is copied and modified from nodejs.

----------------------------

## Import

`binjs_import("~lib/Assert.js")`
    
----------------------------

## Provides

* Assert
* AssertionError extends Error

------------------------

## Constructor

The constructor takes no arguments.

    var assert = new Assert();

This import method is not as CommonJS specifies, CommonJS specifies the use of `require()` which is not, currently, available in /bin/js, apart from that, the code for Assert follows the CommonJS spec.

Functions and methods as per CommonJS specifications.

  <http://wiki.commonjs.org/wiki/Unit_Testing/1.0>

The most commonly used methods of Assert are as follows.

 * ok(bool, message)
 * equal(actual, expect, message)
 * fail()

### /bin/js Usage

    var assert = new Assert();
    assert.ok(someTest());
    assert.equals(someFunc(), "Hello World", "got some incorrect text from someFunc()");
    
    