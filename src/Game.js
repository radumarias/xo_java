var SignalingMessageType = {};

SignalingMessageType.SDP_OFFER = 'SDP_OFFER';
SignalingMessageType.SDP_ANSWER = 'SDP_ANSWER';
SignalingMessageType.ICE = 'ICE';
SignalingMessageType.PRESENCE = 'PRESENCE';
SignalingMessageType.CONNECTION_REQUEST = 'CONNECTION_REQUEST';

var GameMessageType = {};
GameMessageType.MOVE = "MOVE";
GameMessageType.RESTART = "RESTART";

function Game(type, roomId, onGameReady) {
	this.type = type;
	this.roomId = roomId;
	this.onGameReadyCallback = onGameReady;
}

Game.prototype.initiate = function () {
	this.isMaster = (roomId == null);

	this.localVideo = document.getElementById("local_video");
	this.remoteVideo = document.getElementById("remote_video");

	this.mediaInitiated = false;

	this.pendingOffer = null;
	this.pendingAnswer = null;

	this.prepareMatrix();

	this.prepareSignalingChannel();
}

Game.prototype.prepareMatrix = function () {
	this.matrix = new Array(3);
	this.matrix[0] = new Array(3);
	this.matrix[1] = new Array(3);
	this.matrix[2] = new Array(3);
}

Game.GAME_TYPE_0 = "0";
Game.GAME_TYPE_1 = "1";

Game.prototype.onButtonClick = function (button) {
	var pos = getPositionFromSuffix(button.id);

	this.syncClickToButton(button, pos, this.type);
	this.sendMove(pos, this.type);
}

Game.prototype.restart = function () {
	this.handleRestart();
	this.sendRestart();
}

Game.prototype.handleOtherMove = function (pos, type) {
	var button = document.getElementById("button_" + pos.x + "_" + pos.y);
	this.syncClickToButton(button, pos, type);
}

Game.prototype.syncClickToButton = function (button, pos, type) {
	this.applyStyleForType(button, type);
	button.disabled = true;

	this.matrix[pos.x][pos.y] = type;
}

Game.prototype.applyStyleForType = function (button, type) {
	button.value = (type == 0 ? "O" : "X");
	button.className = "button_" + type;
}

Game.prototype.prepareSignalingChannel = function () {
	var self = this;
	this.signalingChannel = new SignalingChannel(this.roomId,
			function onOpened(channelInfo) {
				self.roomId = channelInfo.roomId;

				self.prepareMedia();

				if (self.onGameReadyCallback != null) {
					self.onGameReadyCallback(self.roomId);
				}
			},

			function onMessage(message) {
				var messageObj = eval("(" + message + ")");

				switch (messageObj.type) {
					case SignalingMessageType.SDP_OFFER:
					{
						self.handleOffer(new RTCSessionDescription(messageObj.body));

						break
					}
					case SignalingMessageType.SDP_ANSWER:
					{
						self.handleAnswer(new RTCSessionDescription(messageObj.body));

						break
					}
					case SignalingMessageType.ICE:
					{
						var candidate = new RTCIceCandidate({
							sdpMLineIndex: messageObj.body.label,
							candidate: messageObj.body.candidate
						});
						self.addIceCandidate(candidate);

						break
					}
					case SignalingMessageType.PRESENCE:
					{
						break;
					}
					case SignalingMessageType.CONNECTION_REQUEST:
					{
						self.prepareP2PConnection();

						break;
					}
				}
			},

			function onError(error) {
			},

			function onClose() {
			}
	);
	this.signalingChannel.initiate();
}

Game.prototype.sendConnectionRequest = function () {
	var message = {
		type: SignalingMessageType.CONNECTION_REQUEST
	}
	this.signalingChannel.send(JSON.stringify(message))
}

Game.prototype.prepareP2PConnection = function () {
	var servers = {iceServers: [
		{url: "stun:stun.l.google.com:19302"}
	]};
	this.peerConnection = new webkitRTCPeerConnection(servers,
			{optional: [
				{RtpDataChannels: true}
			]});
	trace('Created peer connection object peerConnection');

	try {
		// Reliable Data Channels not yet supported in Chrome
		this.dataChannel = this.peerConnection.createDataChannel("dataChannel",
				{reliable: false});
		trace('Created data channel');
	} catch (e) {
		alert('Failed to create data channel. ' +
				'You need Chrome M25 or later with RtpDataChannel enabled');
		trace('createDataChannel() failed with exception: ' + e.message);
	}

	var self = this;
	this.peerConnection.onicecandidate = function (event) {
		self.gotIceCandidate(event);
	};
	// once remote stream arrives, show it in the remote video element
	this.peerConnection.onaddstream = function (evt) {
		trace(evt.stream);
		self.media.linkStream(evt.stream, self.remoteVideo);
	};
	this.dataChannel.onmessage = function (event) {
		self.handleDataMessage(event)
	};
}

Game.prototype.prepareMedia = function () {
	this.media = new Media();
	this.media.initiate();

	var self = this;
	this.media.getStream(
			function (stream) {
				self.media.linkStream(stream, self.localVideo);
//				if (self.peerConnection != null) {
//					self.peerConnection.addStream(stream);
//				} else {
//				}
				self.pendingMediaStream = stream;

				self.mediaInitiated = true;
				self.onMediaInitiated();
			},
			function (error) {
				trace("Media error: ", error);

				self.mediaInitiated = true;
				self.onMediaInitiated();
			}
	);
}

Game.prototype.onMediaInitiated = function () {
	if (!this.isMaster) {
		this.connect();
	}
}

Game.prototype.connect = function () {
	trace("connect");

	this.sendConnectionRequest();

	var self = this;
	setTimeout(function () {
		self.prepareP2PConnection();
		self.pendingOffer = self.createOffer();

		self.nextStep();
	}, 500);

}

Game.prototype.nextStep = function () {
	if (this.mediaInitiated) {
		if (this.pendingOffer) {
			this.pendingOffer();

			this.pendingOffer = null;
		}
		if (this.pendingAnswer) {
			this.pendingAnswer();

			this.pendingAnswer = null;
		}
	}
}

Game.prototype.createOffer = function () {
	var self = this;
	if (this.pendingMediaStream != null) {
		this.peerConnection.addStream(this.pendingMediaStream);
		this.pendingMediaStream = null;
	}
	this.peerConnection.createOffer(function (desc) {
		self.gotOffer(desc);
	});
}

Game.prototype.gotOffer = function (desc) {
	trace("send offer");

	this.peerConnection.setLocalDescription(desc);

	var message = {
		type: SignalingMessageType.SDP_OFFER,
		body: desc
	}
	this.signalingChannel.send(JSON.stringify(message));
}

Game.prototype.handleOffer = function (desc) {
	//trace('Offer \n' + desc.sdp);
	trace('handle Offer');
	this.peerConnection.setRemoteDescription(desc);
	if (this.pendingMediaStream != null) {
		this.peerConnection.addStream(this.pendingMediaStream);
		this.pendingMediaStream = null;
	}

	this.pendingAnswer = this.createAnswer;

	this.nextStep();
}

Game.prototype.createAnswer = function () {
	var self = this;
	this.peerConnection.createAnswer(function (desc) {
		self.gotAnswer(desc);
	});
}

Game.prototype.gotAnswer = function (desc) {
	trace("send answer");

	this.peerConnection.setLocalDescription(desc);
	var message = {
		type: SignalingMessageType.SDP_ANSWER,
		body: desc
	}
	this.signalingChannel.send(JSON.stringify(message));
}

Game.prototype.handleAnswer = function (desc) {
	//trace('Answer \n' + desc.sdp);
	trace('handle Answer');
	this.peerConnection.setRemoteDescription(desc);
}

Game.prototype.addIceCandidate = function (candidate) {
	this.peerConnection.addIceCandidate(candidate);
}

Game.prototype.gotIceCandidate = function (event) {
	trace('ice callback');
	if (event.candidate) {
		//trace('ICE candidate: \n' + event.candidate.candidate);

		var message = {
			type: SignalingMessageType.ICE,
			body: {
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			}
		}
		this.signalingChannel.send(JSON.stringify(message))
	}
}

Game.prototype.handleDataMessage = function (event) {
	trace('Received data message: ' + event.data);

	var message = eval("(" + event.data + ")");

	if (message.type == GameMessageType.MOVE) {
		this.handleOtherMove(createPosition(message.x, message.y), message.playerType);
	} else if (message.type == GameMessageType.RESTART) {
		this.handleRestart();
	}
}

Game.prototype.handleRestart = function () {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var button = document.getElementById("button_" + i + "_" + j);
			this.resetButton(button);
		}
	}

	this.prepareMatrix();
}

Game.prototype.resetButton = function (button) {
	button.disabled = false;
	button.value = "";
	button.className = "button_default";
}

Game.prototype.sendMove = function (pos, type) {
	var data =
			"{" +
			"type: '" + GameMessageType.MOVE + "'" +
			", x:" + pos.x +
			", y:" + pos.y +
			", playerType:" + type +
			"}";

	this.sendData(data);
}

Game.prototype.sendRestart = function () {
	var data =
			"{" +
			"type: '" + GameMessageType.RESTART + "'" +
			"}";

	this.sendData(data);
}

Game.prototype.sendData = function (data) {
	trace('Sent data: ' + data);

	this.dataChannel.send(data);
}
