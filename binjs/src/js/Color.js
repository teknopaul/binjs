/**
 * Color class suports instantiating with var color = new Color() like other
 * Libraries, but also support sstatic type calls like Color.disable()
 *
 * You can not call Color.disable() directly in a /bin/js script because
 * the preparser forbids it, but all changes are global they do not affect
 * the instance of Color if you create one.
 *
 */
 
 
var Color = function() {
};

// \033 is 27 ie ESC
// People who write term code talk in octal, FIIK why

Color.BLACK   = "\033[30m";
Color.WHITE   = "\033[97m";
Color.GREY    = "\033[37m";
Color.DARKGREY= "\033[90m";
Color.BLUE    = "\033[94m";
Color.GREEN   = "\033[32m";
Color.RED     = "\033[91m";
Color.YELLOW  = "\033[93m";
Color.CYAN    = "\033[36m";
Color.MAGENTA = "\033[35m";
Color.ORANGE  = "\033[33m";
Color.COLOR_OFF = "\033[0m";

Color.BOLD      = "\033[1m";
Color.UNDERLINE = "\033[4m";
Color.BLINK     = "\033[5m";

Color.disable = function() {
	Color.BLACK   = "";
	Color.WHITE   = "";
	Color.GREY    = "";
	Color.DARKGREY= "";
	Color.BLUE    = "";
	Color.GREEN   = "";
	Color.RED     = "";
	Color.YELLOW  = "";
	Color.CYAN    = "";
	Color.MAGENTA = "";
	Color.ORANGE  = "";
	Color.COLOR_OFF = "";
	
	Color.BOLD      = "";
	Color.UNDERLINE = "";
	Color.BLINK     = "";
}
Color.prototype.disable = Color.disable;

Color.enable = function() {
	Color.BLACK   = "\033[30m";
	Color.WHITE   = "\033[97m";
	Color.GREY    = "\033[37m";
	Color.DARKGREY= "\033[90m";
	Color.BLUE    = "\033[94m";
	Color.GREEN   = "\033[32m";
	Color.RED     = "\033[91m";
	Color.YELLOW  = "\033[93m";
	Color.CYAN    = "\033[36m";
	Color.MAGENTA = "\033[35m";
	Color.ORANGE  = "\033[33m";
	Color.COLOR_OFF = "\033[0m";
	
	Color.BOLD      = "\033[1m";
	Color.UNDERLINE = "\033[4m";
	Color.BLINK     = "\033[5m";
}
Color.prototype.enable = Color.enable;

Color.fromModifier = function(colour) {
	switch(colour) {
		case true		  : return Color.BOLD; 
		case 'black'	  : return Color.BLACK; 
		case 'white'	  : return Color.WHITE; 
		case 'grey'	  	  : return Color.GREY; 
		case 'darkgrey'	  : return Color.DARKGREY; 
		case 'blue'	 	  : return Color.BLUE; 
		case 'green'	  : return Color.GREEN; 
		case 'red'	  	  : return Color.RED; 
		case 'yellow'	  : return Color.YELLOW; 
		case 'cyan'	  	  : return Color.CYAN; 
		case 'magenta'	  : return Color.MAGENTA; 
		case 'orange'	  : return Color.ORANGE;
		default :
		  throw new Error("invalid colour choose from black,white,grey,darkgrey,blue,green,red,yellow,cyan,magenta,orange");
	}
}
Color.prototype.fromModifier = Color.fromModifier;


if ( ! binjs_isatty() ) {
	Color.disable();
}
