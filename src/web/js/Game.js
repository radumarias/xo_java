var GameMessageType = {
	MOVE: "MOVE",
	NEW_GAME: "NEW_GAME",
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
	this.gameBoardId = "game_board";

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
				$("#no_local_media_image").remove();
			},

			// onRemoteStream
			function (stream) {
				linkStream(stream, self.remoteStream);
				$("#no_remote_media_image").remove();
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
	this.handleNewGame();
	this.sendNewGame();
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
	$(button).addClass("button_" + type);
}

Game.prototype.handleNewGame = function () {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var button = document.getElementById("button_" + i + "_" + j);
			this.resetButton(button);
		}
	}

	this.prepareMatrix();

	this.afterMove();
}

Game.prototype.handleEnded = function (win, linePoints) {
	if (win) {
		this.yourScore++;
	} else {
		this.hisScore++;
	}

//	this.handleNewGame();

	this.highlightLinePoints(linePoints);

	this.onGameStatus({
		operation: 'ended',
		win: win,
		yourScore: this.yourScore,
		hisScore: this.hisScore
	});
}

Game.prototype.highlightLinePoints = function (linePoints) {
	var self = this;
	$.each(linePoints, function (index, value) {
		self.highlightLinePoint(value)
	});
}

Game.prototype.highlightLinePoint = function (point) {
	var buttonId = "#button_" + point.x + "_" + point.y;
	$(buttonId).addClass("highlight_line_point");
	for (var i = 0; i < 2; i++) {
		$(buttonId).fadeTo('fast', 0);
		$(buttonId).fadeTo('fast', 1);
	}
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
		case GameMessageType.NEW_GAME:
			this.handleNewGame();

			break;
		case GameMessageType.ENDED:
			this.handleEnded(message.win, message.linePoints);

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

Game.prototype.sendNewGame = function () {
	this.sendMessage(
			{
				type: GameMessageType.NEW_GAME
			}
	);
}

Game.prototype.sendGameEnded = function (win, linePoints) {
	this.sendMessage(
			{
				type: GameMessageType.ENDED,
				win: win,
				linePoints: linePoints
			}
	);
}

Game.prototype.checkGameEnded = function () {
	var ended = false;
	var win = false;

	var linePoints = this.getLinePoints();
	trace("linePoints = " + linePoints);
	if (linePoints != null) {
		ended = true;
		win = this.matrix[linePoints[0].x][linePoints[0].y] == this.type;
		trace("win = " + win);
		trace("first point type = " + this.matrix[linePoints[0].x][linePoints[0].y]);
	}

	if (ended) {
		this.handleEnded(win, linePoints);
		this.sendGameEnded(!win, linePoints);
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

/**
 *
 * @param points
 * @returns (number} <br/>
 *        0 - no winner,
 *        1 - type 1 wins.
 *        -1 - type 0 wins
 */
Game.prototype.isLine = function (points) {
	var values = [this.matrix[points[0].x][points[0].y], this.matrix[points[1].x][points[1].y], this.matrix[points[2].x][points[2].y]]

	var firstNotNull = (this.matrix[points[0].x][points[0].y] != null);
	var allValuesEquals = (values[0] == values[1]) && (values[0] == values[2]);

	var isLine = firstNotNull && allValuesEquals;
//	trace("isLine =  " + isLine + " firstNotNull = " + firstNotNull + " allValuesEquals " + allValuesEquals + " points " + JSON.stringify(points) + " values " + values);

	return isLine;
}

Game.prototype.getLinePoints = function () {
	var points;

	if ((points = [createPosition(0, 0), createPosition(0, 1), createPosition(0, 2)]) && this.isLine(points)) {
		// o o o
		// _ _ _
		// _ _ _

		return points;

	} else if ((points = [createPosition(0, 0), createPosition(1, 1), createPosition(2, 2)]) && this.isLine(points)) {
		// o _ _
		// _ o _
		// _ _ o

		return points;
	} else if ((points = [createPosition(0, 0), createPosition(1, 0), createPosition(2, 0)]) && this.isLine(points)) {
		// o _ _
		// o _ _
		// o _ _

		return points;
	} else if ((points = [createPosition(0, 1), createPosition(1, 1), createPosition(2, 1)]) && this.isLine(points)) {
		// _ o _
		// _ o _
		// _ o _

		return points;
	} else if ((points = [createPosition(0, 2), createPosition(1, 2), createPosition(2, 2)]) && this.isLine(points)) {
		// _ _ o
		// _ _ o
		// _ _ o

		return points;
	} else if ((points = [createPosition(0, 2), createPosition(1, 1), createPosition(2, 0)]) && this.isLine(points)) {
		// _ _ o
		// _ o _
		// o _ _

		return points;
	} else if ((points = [createPosition(1, 0), createPosition(1, 1), createPosition(1, 2)]) && this.isLine(points)) {
		// _ _ _
		// o o o
		// _ _ _

		return points;
	} else if ((points = [createPosition(2, 0), createPosition(2, 1), createPosition(1, 2)]) && this.isLine(points)) {
		// _ _ _
		// _ _ _
		// o o o

		return points;
	} else {
		return null;
	}
}