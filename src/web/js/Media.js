navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function Media() {
}

Media.prototype.initiate = function() {
	this.constraints = {audio: true, video: true};
}

Media.prototype.play = function(video) {
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

	this.linkStream(video, stream);
}

Media.prototype.onMediaError = function(error) {
	trace("getUserMedia error: ", error);
}
