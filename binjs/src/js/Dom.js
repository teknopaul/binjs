
/**
 * Simple XML DOM implementation based on Sax that works with Strings.
 *
 * This has been copied and modifed from nodejs code. There is actually very
 * few changes since the sax.js parser accepts a String and is not really
 * asynchronous code.  Whoda thunk it! This class returns an Element from the
 * parse method instead of accepting a callback but apart from that is the same.
 * as the nodejs version.
 * 
 * If you have an XML string and want a DOM this utility is convenient.
 * 
 * var parser = new Dom().parser();
 * var rootElement = parser.parse(xmlString);
 * 
 * If you want to compile C there are versions based on libxml2
 * and jsdom is full featured but complicated.
 * 
 * This is "lightweight" meaning simple and serves my purpose, it does not support namespaces or all
 * of the features of XML 1.0  it just takes a string and returns a JavaScript object graph. 
 * 
 * There are only 5 types of object supported 
 * Element, Text, ProcessingInstruction, CDATASection and Comment.
 * 
 * e.g.
 * 
 * take  <xml><elem att="val1"/><elem att="val1"/><elem att="val1"/></xml>
 * 
 * return 	{ name : "xml",
 * 			  attributes : {}
 * 			  children [
 * 				{ name : "elem", attributes : {att:'val1'}, children [] },
 * 				{ name : "elem", attributes : {att:'val1'}, children [] },
 * 				{ name : "elem", attributes : {att:'val1'}, children [] }
 * 			  ]
 * 			}
 * 
 * The object returned is an instance of Element and can be serialized back out with obj.toXml();
 * 
 * 
 * @constructor Dom
 */
var Dom = function() {
};

Dom.escape = function(string) {
	return string.replace(/&/g, '&amp;')
				 .replace(/>/g, '&gt;')
				 .replace(/</g, '&lt;')
				 .replace(/"/g, '&quot;')
				 .replace(/'/g, '&apos;');
};
Dom.prototype.escape = Dom.escape;
 
Dom.prototype.parser = function () { 
	var DOMParser = function() {
		/**
		 * The root element of the XML document currently being parsed.
		 */
		this.root = null;
		this.stack = new Array();
		this.currElement = null;
		/**
		 * Flag that is set to true if there was a Sax error parsing the XML.
		 */
		this.error = false;
		/**
		 * Use strict parsing, this value is passed to the sax parser.
		 */
		this.strict = true;
		/**
		 * Set to true to parse and write ProcessingInstructions
		 * By default false for backwards comatability
		 */
		this.parseProcessingInstructions = false;
		// undefined by default 
		// this.processingInstructions = new Array();
		
		this.parse = function(string) {
			if (typeof string != 'string') {
				throw new Error('Data is not a string');
			}
			var self = this;
			var parser = new Sax().parser(this.strict);
		
			parser.onerror = function (err) {
				self.error = true;
				throw new Error(err);
			};
			
			parser.ontext = function (text) {
				if (self.currElement == null) {
					// console.log("Content in the prolog " + text);
					return;
				}
				var textNode = new Text(text);
				self.currElement.children.push(textNode);
			};
			
			parser.onopencdata = function () {
				var cdataNode = new CDATASection();
				self.currElement.children.push(cdataNode);
			};
			
			parser.oncdata = function (data) {
				var cdataNode = self.currElement.children[self.currElement.children.length - 1];
				cdataNode.appendData(data);
			};
			
			// do nothing on parser.onclosecdata	
			parser.onopentag = function (node) {
				var elem = new Element(node.name, node.attributes);
				if (self.root == null) {
					self.root = elem;
					if ( self.processingInstructions ) {
						elem.processingInstructions = self.processingInstructions;
					}
				}
				if (self.currElement != null) {
					self.currElement.children.push(elem);
				}
				self.currElement = elem;
				self.stack.push(self.currElement);
			};
			
			parser.onclosetag = function (node) {
				self.stack.pop();
				self.currElement = self.stack[self.stack.length - 1 ];// self.stack.peek(); 
			};
			
			parser.oncomment = function (comment) {
				if (self.currElement == null) {
					//console.log("Comments in the prolog discarded " + comment);
					return;
				}		
				var commentNode = new Comment(comment);
				self.currElement.children.push(commentNode);
			};
			
			parser.onprocessinginstruction = function (node) {
				if (self.parseProcessingInstructions === true) {
					if ( self.processingInstructions === undefined) {
						self.processingInstructions = new Array();	
					}
					var pi = new ProcessingInstruction(node.name, node.body);
					self.processingInstructions.push(pi);
				}
			};
		
			parser.onend = function () {
			};
		
			parser.write(string).close();
			
			return self.root;
		};
		
		this.reset = function() {
			this.root = null;
			this.stack = new Array();
			this.currElement = null;
			this.error = false;
		};

	}
	return new DOMParser();
};

/**
 * 
 * @constructor Element
 */
var Element = function(name, attributes, children ) {
	this.name = name;
	this.attributes = attributes || [];
	this.children = children || [];
	// undefined by default 
	// this.processingInstructions = new Array();
};
Element.prototype.toXml = function(sb) {
	if (typeof sb == 'undefined') {
		sb = {buf:''}; // Strings are pass by value in JS it seems
	}
	
	if (this.processingInstructions) {
		for (var i = 0 ; i < this.processingInstructions.length ; i++) {
			sb.buf += '<?' + this.processingInstructions[i].name + ' ' + this.processingInstructions[i].body + '?>\n';
		}
	}
	
	sb.buf += '<' + this.name;
	for (att in this.attributes) {
		
		sb.buf += ' ' + att + '="' + Dom.escape(this.attributes[att]) + '"';
	}
	if (this.children.length != 0) {
		sb.buf += '>';
		for (var i = 0 ; i < this.children.length ; i++) {
			this.children[i].toXml(sb);
		}
		sb.buf += '</' + this.name + '>';
	}
	else {
		sb.buf += '/>';
	}
	return sb.buf;
};
Element.prototype.firstChild = function() {
	if ( this.children.length > 0) {
		return this.children[0];	
	}
	return null;
};	
Element.prototype.text = function() {
	if ( this.children.length > 0) {
		if (typeof this.children[0].text == 'string') {
			return this.children[0].text;
		};	
	}
	return null;
};

var Text = function(data){
	this.text = data;
};
Text.prototype.toXml = function(sb) {
	sb.buf += Dom.escape(this.text);
};

var Comment = function(comment) {
	this.comment = comment;
};
Comment.prototype.toXml = function(sb) {
	sb.buf += '<!--' + this.comment + '-->';
};

var ProcessingInstruction = function(name, body) {
  this.name = name;
  this.body = body;
};
ProcessingInstruction.prototype.toXml = function(sb) {
  sb.buf += '<?' + this.name + ' ' + this.body + '?>';
};

var CDATASection = function(data){
	this.text = data || '';
};
CDATASection.prototype.toXml = function(sb) {
	sb.buf += '<![CDATA[' + this.text + ']]>';
};
CDATASection.prototype.appendData = function(data) {
	this.text += data;
};

