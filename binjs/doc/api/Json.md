# Json

Syntactic sugar around v8's native JSON parser and a pretty printer.

`JSON.stringify()` and `JSON.parse()` also work as expected, without any need for imports.

----------------------------

## Include

`#include <Json.js>`

-----------------------

## Provides

* Json

## Constructor

The constructor takes no arguments.

    var json = new Json();

-----------------------

## Attributes

None

-----------------------

## Methods

### parse

Parse a String and return a JavaScript object. This method delegates to v8s native JSON obejct.

### toJson

Convert the first argument passed to the method to a Json String. This method delegates to v8s native JSON obejct.
If the second argument is a boolena true the output is indented with strings.

### prettyPrint

Prints a colourised output of the Json object to the console.  The arguments should be a String.

### prettyPrintObject

Prints a colourised output of the Json object to the console.  The arguments should be a JavaScript Object.

