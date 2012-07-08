# Runtime

Runtime allows the script to interface with the environment in which it is running.

----------------------------

## Import

`binjs_import("~lib/Runtime.js")`

------------------------

##  Provides

 * Runtime
 
------------------------

## Constructor

`var runtime = new Runtime();`

----------------------------

## Attributes


### binjsVersion

Returns a String for the /bin/js version. 
e.g. 0.1

### bashVersion

Returns a String for the bash version. 
e.g. 4.2

### javaScriptVersion

Returns the v8 version a String as returned by v8::V8::GetVersion
e.g. 3.11.9 (candidate)

### isatty

Returns true if both standard in and standard out are TTYs, stderr is not checked.


------------------------

## Methods

