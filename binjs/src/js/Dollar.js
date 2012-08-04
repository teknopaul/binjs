/**
 * Defines the functions avaiable using the global $ variable.
 */
 
binjs_include("~lib/Color.js");


if ( typeof $ === 'undefined' ) {

 /**
  * The $ object provides access to /bin/js core features.
  */
 $ = {};
 
 /**
  * $.env is synced to Bashes Environment after each call to bash.
  * delete $.env if you dont want the environment synced
  */
 $.env = {};
 
 /**
  * $.watch is an array of variables that are always coppied to the Bash environment from JavaScript
  * before every call to bash.
  *
  * By default the typical indexing vars i,j,k are in the watch list.
  *
  * delete $.watch if you dont want any syncing of variables.
  */
 $.watch = [];
 
 /**
  * Watch all  UPPERCASE JavaScript variables in the global scope.
  *
  * delete $.watchUpper if you dont want any syncing of variables.
  */
 $.watchUpper = true;
 
 // copy the default bash envirionment to JavaScript land
 binjs_copyEnv();
 
 // add trim() method to JavaScript String
 String.prototype.trim = function() { 
	return binjs_trim(this); 
 }
 
 /**
  * Flag to determine if messages are printed when $.debug() is called.
  */
 $.debugOn = false;
 
}

// Global Magic vars that are shared with bash
var gi,gj,gk;
$.watch =  ["gi","gj","gk"];

/**
 * Print a line of text to stdout.
 * 
 * @pram text the String to print
 * @param formatting if true print in bold, if a String print colourized text
 */
$.println = function(text, format) {
	if (typeof text == 'undefined') {
		binjs_print('\n');
		return;
	}
	if (format === true) text = $.bold(text);
	if (typeof format == 'string') text = $.color(format, text);
	binjs_println(text);
}

/**
 * Print text to stdout wihtout a new line character at the end, the text is not flushed
 * and may not be visible untill println() is called.
 */
$.print = function(text, format) {
	if (format === true) text = $.bold(text);
	if (typeof format == 'string') text = $.color(format, text);
	binjs_print(text);
}

/**
 * Sleep the thread for the specified number of milliseconds.
 */
$.sleep = function(millis) {
	binjs_sleep(millis);
}

/**
 * Alias for binjs_include, include a js file into the global context.
 * for preference use #include <Lib.js> syntax
 */
$.include = function(lib) {
	binjs_include(lib);
}

/**
 * Set a variable into the bash environment, both arguments must be strings.
 */
$.setEnv = function(name, value) {
	if (typeof value !== 'string') {
		value = "" + value;
	}
	binjs_setEnv(name, value);
	$.env[name] = value;
}

/**
 * Get the value of an environment variable.
 */
$.getEnv = function(name) {
	return binjs_getEnv(name);
}

/**
 * Add colours to text.
 * 
 * @return the input text marked up with colour ESC sequences for terminals.
 */
$.color = function(color, message) {
	return Color.fromModifier(color) + message + Color.COLOR_OFF;
}

/**
 * Markup a string with bold tags.
 * @return a string
 */
$.bold = function(message) {
	return Color.BOLD + message + Color.COLOR_OFF;
}

/**
 * Markup a string so it blinks onth conosle.
 * @return a string
 */
$.blink = function(message) {
	return Color.BLINK + message + Color.COLOR_OFF;
}

/**
 * Markup a string so it appears underlined on the console.
 * @return a string
 */
$.underline = function(message) {
	return Color.UNDERLINE + message + Color.COLOR_OFF;
}

/**
 * Print an error with a number and a machine readable text string.
 * 
 * In a future version the 2nd parameter will be used to lookup a translated message
 * for the current language.
 * For now i18n features are not implemented.
 * 
 * @param errNo an integer erro number
 * @param errTag A property value used to lookup the string (in future versions)
 * @param errText default text to display
 */
$.error = function(errNo, errTag, errText) {
	if (typeof errText === 'undefined' || errText == null) errText = "";
	if (typeof errTag === 'undefined' || errTag == null) errTag = "";

	var message = $.color('red', "ERR" + (errNo == 0 ? "" : errNo))
		 + ":"
		 + errTag.replace(/ /g, "_")
		 + " " + errText;

	binjs_println(message);

}

/**
 * Print a warning accepts the same parameters as $.error()
 */
$.warn = function(errNo, errTag, errText) {
	if (typeof errText === 'undefined') errText ="";
	if (errTag === null) errTag = "";

	var message = $.color('orange', "WARN" + (errNo == 0 ? "" : errNo))
		 + ":"
		 + errTag.replace(/ /g, "_")
		 + " " + errText;

	binjs_println(message);

}

/**
 * Print an informational message accepts the same parameters as $.error()
 */
$.info = function(errNo, errTag, errText) {
	if (typeof errText === 'undefined') errText ="";
	if (errTag === null) errTag = "";

	var message = $.color('blue', "INFO" + (errNo == 0 ? "" : errNo))
		 + ":"
		 + errTag.replace(/ /g, "_")
		 + " " + errText;

	binjs_println(message);

}

$.debug = function(text) {
	if ($.debugOn) this.println(text)
}

/**
 * Returns a list o the background Jobs executed by bash.
 */
$.getJobs = function() {
    return binjs_getJobs();
}


// Functions copied from nodeJS,   inherits() and format()

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be revritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
$.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

$.formatRegExp = /%[sdj%]/g;
$.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace($.formatRegExp, function(x) {
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      case '%%': return '%';
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + JSON.stringify(x);
    }
  }
  return str;
}


