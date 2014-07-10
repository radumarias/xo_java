var GameMessageType = {
	MOVE: "MOVE",
	RESTART: "RESTART",
	ENDED: "ENDED"
};

Game.GAME_TYPE_0 = "0";
Game.GAME_TYPE_1 = "1";

function Game(type, roomId, onGameCreated, onReady, onGameStatus) {
	this.type = type;
	this.roomId = roomId;
	this.onGameCreated = onGameCreated;
	this.onReady = onReady;
	this.onGameStatus = onGameStatus;

	this.gameContentId = "game_content";
	this.gameBoardId = "c";

	this.isMaster = (roomId == null);

	this.yourScore = 0;
	this.hisScore = 0;
	this.yourTurn = this.isMaster;
}

Game.prototype.initiate = function () {
	setViewEnabled(this.gameContentId, false, true);

	this.localStream = document.getElementById("local_video");
	this.remoteStream = document.getElementById("remote_video");

	this.mediaInitiated = false;

	this.pendingOffer = null;
	this.pendingAnswer = null;

	this.prepareMatrix();

	this.prepareConnection();
}

Game.prototype.prepareMatrix = function () {
	this.matrix = new Array(3);
	this.matrix[0] = new Array(3);
	this.matrix[1] = new Array(3);
	this.matrix[2] = new Array(3);
}

Game.prototype.prepareConnection = function () {
	var self = this;
	this.connection = new Connection(self.roomId,
			// onRoomCreated
			function (roomId) {
				self.onGameCreated(roomId);
			},

			// onConnectionReady
			function () {
				setViewEnabled(self.gameContentId, true, true);
				self.handleGameStarted();

				self.onReady();
			},

			// onLocalStream
			function (stream) {
				linkStream(stream, self.localStream);
			},

			// onRemoteStream
			function (stream) {
				linkStream(stream, self.remoteStream);
			},

			// onDataMessage
			function (data) {
				self.handleDataMessage(data);
			});
	this.connection.initiate();
}

Game.prototype.onButtonClick = function (button) {
	var pos = getPositionFromSuffix(button.id);

	this.syncClickToButton(button, pos, this.type);
	this.sendMove(pos, this.type);

	this.afterMove();
}

Game.prototype.newGame = function () {
	this.handleRestart();
	this.sendRestart();
}

Game.prototype.handleOtherMove = function (pos, type) {
	var button = document.getElementById("button_" + pos.x + "_" + pos.y);
	this.syncClickToButton(button, pos, type);

	this.afterMove();
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

Game.prototype.handleRestart = function () {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var button = document.getElementById("button_" + i + "_" + j);
			this.resetButton(button);
		}
	}

	this.prepareMatrix();
}

Game.prototype.handleEnded = function (win) {
	if (win) {
		this.yourScore++;
	} else {
		this.hisScore++;
	}

//	this.handleRestart();

	this.onGameStatus({
		operation: 'ended',
		win: win,
		yourScore: this.yourScore,
		hisScore: this.hisScore
	});
}

Game.prototype.handleGameStarted = function () {
	setViewEnabled(this.gameBoardId, this.yourTurn, false);
	this.onGameStatus({
		operation: 'started',
		yourTurn: this.yourTurn
	});
}

Game.prototype.resetButton = function (button) {
	button.disabled = false;
	button.value = "";
	button.className = "button_default";
}

Game.prototype.handleDataMessage = function (data) {
	var message = eval("(" + data + ")");

	switch (message.type) {
		case GameMessageType.MOVE:
			var pos = createPosition(message.x, message.y);
			var type = message.playerType;

			this.handleOtherMove(pos, type);

			break;
		case GameMessageType.RESTART:
			this.handleRestart();

			break;
		case GameMessageType.ENDED:
			this.handleEnded(message.win);

			break;
	}
}

Game.prototype.sendMessage = function (message) {
	var data = JSON.stringify(message);
	this.connection.sendData(data);
}

Game.prototype.sendMove = function (pos, type) {
	this.sendMessage(
			{
				type: GameMessageType.MOVE,
				x: pos.x,
				y: pos.y,
				playerType: type
			}
	);
}

Game.prototype.sendRestart = function () {
	this.sendMessage(
			{
				type: GameMessageType.RESTART
			}
	);
}

Game.prototype.sendGameEnded = function (win) {
	this.sendMessage(
			{
				type: GameMessageType.ENDED,
				win: win
			}
	);
}

Game.prototype.checkGameEnded = function () {
	var ended = false;
	var win = false;

	if (ended) {
		this.handleEnded(win);
		this.sendGameEnded(!win);
	}
}

Game.prototype.afterMove = function () {
	this.yourTurn = !this.yourTurn;

	trace("yourTurn = " + this.yourTurn);

	setViewEnabled(this.gameBoardId, this.yourTurn, false);

	this.onGameStatus({
		operation: 'move',
		yourTurn: this.yourTurn
	});

	if (this.isMaster) {
		this.checkGameEnded();
	}
}

Game.prototype.checkLine = function (points) {
	if ((points[0] != null) && (points[0] === points[1] === points[2])) {
		return {
			status: 1,
			value: points[0]
		};
	} else {
		return {
			status: 0
		};
	}
}
