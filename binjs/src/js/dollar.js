/**
 * Defines the functions avaiable using the global $ variable.
 */
 
binjs_import("~lib/colours.js");


if ( typeof $ == 'undefined' ) {
 /**
  * The $ object provides access to/bin/js core features.
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
  * By default the typical indexing vars i,j,k are int eh watch list.
  *
  * delete $.watch if you dont want any syncing of variables.
  */
 $.watch = ['i', 'j', 'k'];
 
 binjs_copyEnv();
 
}

/**
 * Print a line of text to std out.
 * @pram text the String to print
 * @ param formatting if true print in bold , if a String prinit colourized text
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
 *  Print text to stdout wihtout a new line character at the end the text is not flushed
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
 * Set a variabl into the bash environment, both arguments must be strings.
 */
$.setEnv = function(name, value) {
	if (typeof value !== 'string') {
		value = "" + value;
	}
	binjs_setEnv(name, value);
}

/**
 * Get the value of an environment variable
 */
$.getEnv = function(name) {
	return binjs_getEnv(name);
}

/**
 * Add colours to text.
 * @return the input text marked up with colour tags for bash shells.
 */
$.color = function(colour, message) {
	switch(colour) {
		case 'black'	  : return binjs_BLACK + message + binjs_COLOUR_OFF; 
		case 'white'	  : return binjs_WHITE + message + binjs_COLOUR_OFF; 
		case 'grey'	  	  : return binjs_GREY + message + binjs_COLOUR_OFF; 
		case 'darkgrey'	  : return binjs_DARKGREY + message + binjs_COLOUR_OFF; 
		case 'blue'	 	  : return binjs_BLUE + message + binjs_COLOUR_OFF; 
		case 'green'	  : return binjs_GREEN + message + binjs_COLOUR_OFF; 
		case 'red'	  	  : return binjs_RED + message + binjs_COLOUR_OFF; 
		case 'yellow'	  : return binjs_YELLOW + message + binjs_COLOUR_OFF; 
		case 'cyan'	  	  : return binjs_CYAN + message + binjs_COLOUR_OFF; 
		case 'magenta'	  : return binjs_MAGENTA + message + binjs_COLOUR_OFF; 
		case 'orange'	  : return binjs_ORANGE + message + binjs_COLOUR_OFF;
		default :
		  return "invalid colour choose from black,white,grey,darkgrey,blue,green,red,yellow,cyan,magenta,orange";
	}
}

/**
 * Markup a string with bold tags.
 * @return a string
 */
$.bold = function(message) {
	return binjs_BOLD + message + binjs_COLOUR_OFF;
}

/**
 * Markup a string so it blinks onth conosle.
 * @return a string
 */
$.blink = function(message) {
	return binjs_BLINK + message + binjs_COLOUR_OFF;
}

/**
 * Markup a string so it appears underlined on the console.
 * @return a string
 */
$.underline = function(message) {
	return binjs_UNDERLINE + message + binjs_COLOUR_OFF;
}

/**
 * Print an error with a number and a machine readable text string
 * In a future version the 2nd parameter will be used to lookup a translated message
 * for the current language.
 * For now i18n features are not implemented
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
		 + " " + errText + "\n";

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
		 + " " + errText + "\n";

	binjs_println(message);

}

/**
 * Print an information al message accepts the same parameters as $.error()
 */
$.info = function(errNo, errTag, errText) {
	if (typeof errText === 'undefined') errText ="";
	if (errTag === null) errTag = "";

	var message = $.color('blue', "INFO" + (errNo == 0 ? "" : errNo))
		 + ":"
		 + errTag.replace(/ /g, "_")
		 + " " + errText + "\n";

	binjs_println(message);

}

/**
 * Returns a list o the background Jobs executed by bash.
 */
$.getJobs = function() {
    return binjs_getJobs();
}
