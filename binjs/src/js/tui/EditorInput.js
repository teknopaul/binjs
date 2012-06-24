/**
 * Launch a system editor to load data from the user, 
 * like git or svn does when it wants a submit comment.
 */
 
if (typeof tui === 'undefined') tui = {};

tui.EditorInput = function(defaultText) {

	// text to put in the editor
	this.defaultText = defaultText;
	
	// vi should be there by default on any NIX
	this.editor = "/bin/vi";
	
	// Ubuntu style alternatives
	if (new File("/usr/bin/editor").exists) {
		this.editor = "/usr/bin/editor";
	}
	
	// If the user has specifed an editor with the EDITOR env variable use that
	if ($.env.EDITOR != null && $.env.EDITOR.length > 0 && new File($.env.EDITOR).exists) {
		this.editor = $.env.EDITOR;
	}
	
}


tui.EditorInput.prototype.edit = function() {
	
	var file = null;
	do {
		var name = Math.floor(Math.random() * 10000000000).toString(32);
		file = new File("/tmp/" + name);
	} while (file.exists);
	
	file.touch();
	file.write(this.defaultText);
	
	binjs_exec("chmod go-rwx " + file.path);
	
	binjs_exec("\"" + this.editor + "\" " + file.path);
	
	if (errno === 0) {
		var text = file.read();
		file.delete();
		if (text !== this.defaultText && text.trim().length > 0) {
			return text;
		}
	}
	else return errno;
}
