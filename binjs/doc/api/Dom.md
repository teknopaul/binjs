# Dom

XML Dom parser and Document model.

Dom.js is a clone of nodejs dom-js.

See [Xml parsing](../Xml.html)

----------------------------

## Include

The include should be `Xml.js` which imports both Sax.js and Dom.js.

`#include <Xml.js>`

-----------------------

## Provides

* Dom
* Element
* Text
* Comment
* ProcessingInstruction
* CDATASection

-----------------------

### /bin/js Usage

    var dom = new Dom();
    var root = dom.parser().parse(xmlString);
    
    

