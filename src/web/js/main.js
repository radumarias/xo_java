$('#game_content').fadeTo('slow', .2);
$('#game_content').append('<div id="game_content_disable_overlay" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');

var roomId = ($.urlParam('roomId'));
trace("roomId = " + roomId);
var isMaster = (roomId == null);

var gameType = (roomId == null ? Game.GAME_TYPE_0 : Game.GAME_TYPE_1);

var game = new Game(gameType, roomId, onGameInitiated, onGameReady);
game.initiate();

function onGameInitiated(roomId) {
	trace("onGameInitiated roomId = " + roomId);

	if (isMaster) {
		copyToClipboard(window.location + "?roomId=" + roomId);
	}
}

function onGameReady() {
	trace("onGameReady");

	$('#game_content').fadeTo('slow', 1);
	$('#game_content_disable_overlay').remove();
	$('#waiting_for_opponent').remove();
}

function onRestart() {
//	if (confirm("Are you sure?")) {
	game.restart();
//	}
}