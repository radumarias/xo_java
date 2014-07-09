var roomId = ($.urlParam('roomId'));
trace("roomId = " + roomId);
var isMaster = (roomId == null);

var gameType = (roomId == null ? Game.GAME_TYPE_0 : Game.GAME_TYPE_1);

var game = new Game(gameType, roomId, onGameReady);
game.initiate();

function onGameReady(roomId) {
	trace("onGameReady roomId = " + roomId);

	if (isMaster) {
		copyToClipboard(window.location + "?roomId=" + roomId);
	}
}

function onRestart() {
//	if (confirm("Are you sure?")) {
	game.restart();
//	}
}