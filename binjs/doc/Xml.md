
# Xml Support

Modifying XML files in scripts is fiddly with only Linux tools like awk and sed at your disposal so /bin/js comes with an XML parser built in, it is lifted from nodejs code with a couple of changes to make it more fitting for synchronous scripts.

## Usage

### Dom

The following header is needed to import the xml libraries.  This imports both `Sax` and `Dom` parsers, Dom uses Sax.

    binjs_import("~lib/Xml.js");

To parse a document to a dom first read it as a JavaScript String then pass it to the Dom parser.

    var text = new File("./doc.xml").read();
    var parser = new Dom();
    var rootElement = parser.parse(text);

A heirarchy of objects is returned, inspect an example with `JSON.stringify()` to understand how to navigate the Dom once parsed.

    $.println(JSON.stringify(rootElement));

The object can be modified and written back out with `dom.toXml()`

### Sax

To parse with Sax the same import is needed, or you can just import `Sax.js`.

    binjs_import("~lib/Xml.js");
    
or 

    binjs_import("~lib/Sax.js");

Parsing with Sax requires passing callback functions which is nodejs's style of working. The Sax nodejs parser can be used as synchronous code by passing the whole XML document as one string to the `write` method, as follows.

    var parser = new Sax().parser();
    var text = new File("./doc.xml").read();

    var xmlVer = "";
    parser.onopentag = function (node) {
        if (node.name == "abc") 
          xmlVer = node.attributes["version"];
    };

    parser.write(text).close();

    $.println("Xml version is: " + xmlVer);
    
