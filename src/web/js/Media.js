function Media() {
}

Media.prototype.initiate = function() {
	this.constraints = {audio: false, video: true};
}

Media.prototype.play = function(video) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

	var self = this;
	if (navigator.getUserMedia) {
		navigator.getUserMedia(this.constraints,
			function(stream) { self.onMediaAvailable(stream, video); },
			function(error) { self.onMediaError(error); }
		);
	} else {
		trace('Native device media streaming (getUserMedia) not supported in this browser.');
	}
}

Media.prototype.getStream = function(onSuccess, onError) {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

	var self = this;
	if (navigator.getUserMedia) {
		navigator.getUserMedia(this.constraints,
			function(stream) { onSuccess(stream); },
			function(error) { onError(error); }
		);
	} else {
		trace('Native device media streaming (getUserMedia) not supported in this browser.');
	}
}

Media.prototype.onMediaAvailable = function(stream, video) {
	trace("stream = " + stream);

	this.linkStream(stream, video);
}

Media.prototype.onMediaError = function(error) {
	trace("navigator.getUserMedia error: ", error);
}
