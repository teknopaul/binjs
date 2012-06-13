/**
 * A Progress bas
 */
 
 
Progress = function(progressText, doneText) {
	this.progressText = progressText || "Progress...";
	this.doneText = doneText || "Done.";
	this.min = 0;
	this.max = 10;
	this.bar = "*";
	this.space = " ";
	
	// private
	this.pos = 0;
	this.onscreen = false;
	this.isDone = false;
}

Progress.prototype.render = function() {
	if ( ! this.onscreen ) {
		this.onscreen = true;
		$.println();
	}
	$.print("\r" + this.progressText, true); 
	$.print(" [" + this.getBar() + "]");
	binjs_flush();
}

Progress.prototype.tick = function() {
	this.pos++;
	this.render();
	if ( this.pos == this.max) this.done();
}

Progress.prototype.done = function() {
	if ( ! this.isDone ) {
		this.pos = this.max;
		$.print("\r" + this.getSpace());
		$.println("\r" + this.doneText, true); 
	}
	this.isDone = true;
}

Progress.prototype.getBar = function() {
	var buf = "";
	for(var i = this.min ; i < this.pos ; i++) buf += this.bar;
	for(var i = this.pos ; i < this.max ; i++) buf += this.space;
	return buf;
}
Progress.prototype.getSpace = function() {
	var buf = "";
	for(var i = this.min ; i < this.progressText.length + 3 + (this.max - this.min) ; i++) buf += ' ';
	return buf;
}
