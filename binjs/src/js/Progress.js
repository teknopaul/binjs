/**
 * A Progress bar
 */
 
/**
 * @param progressText the text to be dislpalyed while in progress
 * @param doneText the text to display when finished
 * @constructor
 */
Progress = function(progressText, doneText) {

	this.progressText = progressText || "Progress...";
	this.doneText = doneText || "Done.";
	this.min = 0;
	this.max = 10;
	this.bar = "*";
	this.space = " ";
	
	// private
	this._pos = 0;
	this._onScreen = false;
	this._isDone = false;
}

Progress.prototype.render = function() {
	if ( ! this._isDone ) {
		if ( ! this._onScreen ) {
			this._onScreen = true;
			$.println();
		}
		$.print("\r" + this.progressText, true); 
		$.print(" [" + this._getBar() + "]");
		binjs_flush();
	}
}

Progress.prototype.tick = function() {
	this._pos++;
	this.render();
	if ( this._pos == this.max) this.done();
}

Progress.prototype.done = function() {
	if ( ! this._isDone ) {
		this._pos = this.max;
		$.print("\r" + this._getSpace());
		$.println("\r" + this.doneText, true); 
	}
	this._isDone = true;
}

Progress.prototype._getBar = function() {
	var buf = "";
	for(var i = this.min ; i < this._pos ; i++) buf += this.bar;
	for(var i = this._pos ; i < this.max ; i++) buf += this.space;
	return buf;
}

Progress.prototype._getSpace = function() {
	var buf = "";
	for(var i = this.min ; i < this.progressText.length + 3 + (this.max - this.min) ; i++) buf += ' ';
	return buf;
}
