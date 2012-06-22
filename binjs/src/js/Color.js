
Color = function() {
	throw new Error("Color can not be instantiated");
};

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
