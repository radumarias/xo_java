var signalingchannel = new SignalingChannel(onOpened, onMessage, onError, onClose);

var input = document.getElementById("inputText");
var messages = document.getElementById("messages");
var sendButton = document.getElementById("sendButton");

sendButton.addEventListener('click', onSend);

function onOpened(channelInfo) {
	var url = document.URL + "?roomId=" + channelInfo.roomId;
	var aObj = document.getElementById("shareLink");
	aObj.href = url;
}

function onMessage(message) {
	var messages = document.getElementById("messages");
	var messageObj = JSON.parse(message);
	messages.value += "\n" + messageObj.message;
}

function onError(error) {
}

function onClose() {
}

function onSend() {
	signalingchannel.sendMessage(input.value);
	input.value = "";
}
