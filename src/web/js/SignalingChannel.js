/**
 * Created by radu on 7/5/14.
 */

function SignalingChannel(roomId, onOpened, onMessage, onError, onClose) {
	this.roomId = roomId;
	this.onOpenedCallback = onOpened;
	this.onMessageCallback = onMessage;
	this.onErrorCallback = onError;
	this.onCloseCallback = onClose;
}

SignalingChannel.prototype.initiate = function () {
	var self = this;
	this.joinRoom(function (channelInfo) {
		self.onChannelInfo(channelInfo)
	});
}

SignalingChannel.prototype.joinRoom = function () {
	var url = "/joinRoom";

	if (roomId != null) {
		console.log("joining room " + roomId);

		url += "?roomId=" + roomId;
	} else {
		console.log("create new room");
	}

	var self = this;
	$.ajax({
		url: url,
		success: function (json) {
			console.log("json = " + json);
			var channelInfo = eval("(" + json + ")");
			self.onChannelInfo(channelInfo);
		}
	});
}

SignalingChannel.prototype.onChannelInfo = function (channelInfo) {
	this.channelInfo = channelInfo;

	console.log("channelId = " + channelInfo.channelId);
	console.log("token = " + channelInfo.token);
	console.log("roomId = " + channelInfo.roomId);

	var self = this;
	this.channel = new goog.appengine.Channel(channelInfo.token);
	this.socket = this.channel.open();
	this.socket.onopen = function () {
		self.onOpened()
	};
	this.socket.onmessage = function (message) {
		self.onMessage(message)
	};
	this.socket.onerror = function (error) {
		self.onError(error)
	};
	this.socket.onclose = function () {
		self.onClose()
	};
}

SignalingChannel.prototype.onOpened = function () {
	this.onOpenedCallback(this.channelInfo);
}
SignalingChannel.prototype.onMessage = function (message) {
	console.log("onMessage = " + message.data)

	this.onMessageCallback(message.data);
}

SignalingChannel.prototype.onError = function (error) {
	console.log("onError " + error);

	this.onErrorCallback(error);
}

SignalingChannel.prototype.onClose = function () {
	console.log("onClose ");

	this.onCloseCallback();
}

SignalingChannel.prototype.sendMessage = function (message) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', "/send?command=message&fromChannelId=" + this.channelInfo.channelId, true);
	xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
	xhr.send("{ message: '" + message + "' }");
};

SignalingChannel.prototype.send = function (message) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', "/send?fromChannelId=" + this.channelInfo.channelId, true);
	xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
	xhr.send(message);
}
