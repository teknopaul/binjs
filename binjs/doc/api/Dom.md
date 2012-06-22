# Dom

XML Dom parser and implementation

Dom.js is a clone of nodejs dom-js

See [Xml parsing](../../html/Xml.html)

----------------------------

## Import

The import should be `~lib/Xml.js` which imports both Sax and Dom.

`binjs_import("~lib/Xml.js")`

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
    
    