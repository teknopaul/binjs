
binjs_include("~lib/tui/Input.js");

/**
 * An Input that accepts files and support tab completion.
 *
 * Tab comletion is not identical to bash but pretty close, click tab a few times and
 * it feels natural.
 * 
 * @constructor
 */
tui.FileInput = function() {
	
	// N.B. the atts are not copied in JS subclassing 
	// so here we must have ALL the atts defined in Input's constructor
	this.text = "";
	this.term = new Term();
	this.returnOnEnter = true;
	this.acceptTabs = false;
	this.acceptNewLines = false;
	this.filter = false;
	this.complete = this._tabCompletion

}
$.inherits(tui.FileInput, tui.Input);

tui.FileInput.prototype.requireFile = function() {
	this.validator = this._checkFile;
}
tui.FileInput.prototype.requireDir= function() {
	this.validator = this._checkDir;
}

tui.FileInput.prototype._tabCompletion = function(c) {

	var pos = this.term.cursorPosition();
  // exapand simple tilde
	if (this.text.charAt(0) == '~') {
	  this.text = $.env.HOME + this.text.substring(1);
	  this._rewriteLine();
	}

//  if (this.text.indexOf("./") == 0) {
//	this.text = $.env.PWD + "/" + this.text.substring(2);
//	this._rewriteLine();
//  }
  
	// find path
	var file = new File(this.text);

	if ( file.isRoot() ) return;
  
	// if valid directory without / at the end add it
	if (file.exists && file.isDir()&& this.text.lastIndexOf('/') != this.text.length -1 ) {
		this.text = this.text + '/';
		this._rewriteLine();
		this._positionCursor(pos);
		return;
	}

	if (file.exists && file.isFile()) {
		$.print(" ");
		return;
	}

	var parent = file.getParentFile();
	var glob = file.name;

	// has trailing / and is a valid directory 
	if (file.exists && file.isDir() && this.text.lastIndexOf('/') == this.text.length -1 ) {
		parent = file;
		glob = "";
	}

	//$.println("parent=" + parent.path + ", glob:" + glob);
	
	// do tab completion
	var files = parent.listFiles(glob + '*');
	if (files.length == 0) {
	  // BEL should be configurable
	  this.term.writeByte(7);
	  this._positionCursor(pos);
	  return;
	}
	
	else if (files.length == 1) {
		var prefix = parent.path;
		if (prefix === '/') prefix = "";
		this.text = prefix + "/" + files[0].name;
		this._rewriteLine();
		this._positionCursor(pos);
		return;
	}
	
	else {
		// current path is a directory and no extra chars entered  yet
		if ( file.exists && file.isDir() ) return;
	  
		files.sort( function(a,b) {
			return a.name > b.name;
		});
		
		var i = 0;
		loop: for (var j = glob.length ; j < 255 ; j++) {
			var c = 0;
			for (i = 0 ; i < files.length ; i++) {
			  if (c === 0) {
				 c = files[i].name.charAt(j);
				 continue;
			  }
			  if (files[i].name.charAt(j) !== c) break loop;
			}
			this.text += c;
		}

		if (files.length < 50) {
			this.term.deleteLine();
			$.print("\r");
			for (i = 0 ; i < files.length ; i++) {
				$.print(files[i].name + " ");
			}
			$.println();
		} else {
			this.term.deleteLine();
			$.print("\r");
			$.println(files.length + " matches");
		}
		$.print("\r" + this.text);
		return;
	}
}

tui.FileInput.prototype._rewriteLine = function(row) {
	this.term.deleteLine();
	$.print("\r" + this.text);
}
tui.FileInput.prototype._positionCursor= function(pos) {
	this.term.cursorPosition(pos[0], this.text.length + 1);

}

tui.FileInput.prototype._checkFile = function() {
	var file = new File(this.text);
	if ( ! file.exists || ! file.isFile() ) {
		this._warn();
		return false;
	}
	return true;
}
tui.FileInput.prototype._checkDir= function() {
	var file = new File(this.text);
	if ( ! file.exists || ! file.isDir() ) {
		this._warn();
		return false;
	}
	return true;
}

tui.FileInput.prototype._warn = function() {

	$.print("\r" + Color.RED + this.text + Color.COLOR_OFF);
	this.term.flush();
	$.sleep(100);
	$.print("\r" + this.text);
	this.term.flush();
	$.sleep(100);
	$.print("\r" + Color.RED + this.text + Color.COLOR_OFF);
	this.term.flush();
	$.sleep(100);
	$.print("\r" + this.text);
	this.term.flush();

}
