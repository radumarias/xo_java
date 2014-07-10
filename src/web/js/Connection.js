var SignalingMessageType = {};

SignalingMessageType.SDP_OFFER = 'SDP_OFFER';
SignalingMessageType.SDP_ANSWER = 'SDP_ANSWER';
SignalingMessageType.ICE = 'ICE';
SignalingMessageType.PRESENCE = 'PRESENCE';
SignalingMessageType.CONNECTION_REQUEST = 'CONNECTION_REQUEST';

function Connection(roomId, onRoomCreated, onConnectionReady, onLocalStream, onRemoteStream, onDataMessage) {
	this.roomId = roomId;
	trace("roomId = " + this.roomId);
	this.isMaster = (roomId == null);
	trace("isMaster = " + this.isMaster);
	this.onRoomCreated = onRoomCreated;
	this.onConnectionReady = onConnectionReady;
	this.onLocalStream = onLocalStream;
	this.onRemoteStream = onRemoteStream;
	this.onDataMessage = onDataMessage;

	this.mediaInitiated = false;

	this.pendingOffer = null;
	this.pendingAnswer = null;
}

Connection.prototype.initiate = function () {
	this.prepareSignalingChannel();
}

Connection.prototype.prepareSignalingChannel = function () {
	var self = this;
	this.signalingChannel = new SignalingChannel(this.roomId,
			function onOpened(channelInfo) {
				self.roomId = channelInfo.roomId;

				self.prepareMedia();

				self.onRoomCreated(self.roomId);
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

Connection.prototype.sendConnectionRequest = function () {
	var message = {
		type: SignalingMessageType.CONNECTION_REQUEST
	}
	this.signalingChannel.send(JSON.stringify(message))
}

Connection.prototype.prepareP2PConnection = function () {
	var servers = isLocalHost() ? {} :
	{iceServers: [
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
		self.onRemoteStream(evt.stream)
	};
	this.dataChannel.onmessage = function (event) {
		trace('Received data message: ' + event.data);

		self.onDataMessage(event.data)
	};
	this.dataChannel.onopen = function (event) {
		self.onConnectionReady();
	};
}

Connection.prototype.prepareMedia = function () {
	this.media = new Media();
	this.media.initiate();

	var self = this;
	this.media.getStream(
			function (stream) {
				self.pendingMediaStream = stream;

				self.mediaInitiated = true;
				self.onMediaInitiated();

				self.onLocalStream(stream);
			},
			function (error) {
				trace("Media error: ", error);

				self.mediaInitiated = true;
				self.onMediaInitiated();
			}
	);
}

Connection.prototype.onMediaInitiated = function () {
	trace("onMediaInitiated isMaster = " + this.isMaster);
	if (!this.isMaster) {
		this.connect();
	}
}

Connection.prototype.connect = function () {
	trace("connect");

	this.sendConnectionRequest();

	var self = this;
	setTimeout(function () {
		self.prepareP2PConnection();
		self.pendingOffer = self.createOffer();

		self.nextStep();
	}, 500);

}

Connection.prototype.nextStep = function () {
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

Connection.prototype.createOffer = function () {
	var self = this;
	if (this.pendingMediaStream != null) {
		this.peerConnection.addStream(this.pendingMediaStream);
		this.pendingMediaStream = null;
	}
	this.peerConnection.createOffer(function (desc) {
		self.gotOffer(desc);
	});
}

Connection.prototype.gotOffer = function (desc) {
	trace("send offer");

	this.peerConnection.setLocalDescription(desc);

	var message = {
		type: SignalingMessageType.SDP_OFFER,
		body: desc
	}
	this.signalingChannel.send(JSON.stringify(message));
}

Connection.prototype.handleOffer = function (desc) {
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

Connection.prototype.createAnswer = function () {
	var self = this;
	this.peerConnection.createAnswer(function (desc) {
		self.gotAnswer(desc);
	});
}

Connection.prototype.gotAnswer = function (desc) {
	trace("send answer");

	this.peerConnection.setLocalDescription(desc);
	var message = {
		type: SignalingMessageType.SDP_ANSWER,
		body: desc
	}
	this.signalingChannel.send(JSON.stringify(message));
}

Connection.prototype.handleAnswer = function (desc) {
	//trace('Answer \n' + desc.sdp);
	trace('handle Answer');
	this.peerConnection.setRemoteDescription(desc);
}

Connection.prototype.addIceCandidate = function (candidate) {
	this.peerConnection.addIceCandidate(candidate);
}

Connection.prototype.gotIceCandidate = function (event) {
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

Connection.prototype.sendData = function (data) {
	trace('Sent data message: ' + data);

	this.dataChannel.send(data);
}
