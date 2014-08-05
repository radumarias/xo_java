var version = "1.1";
trace("version = " + version);

var roomId = ($.urlParam('roomId'));
var isMaster = (roomId == null);

var gameType = (roomId == null ? Game.GAME_TYPE_0 : Game.GAME_TYPE_1);

$('#your_score_container').addClass("score_container_" + gameType);
$('#his_score_container').addClass("score_container_" + (1 - gameType));

var game = new Game(gameType, roomId,
		// onGameCreated
		function (roomId) {
			trace("onGameCreated roomId = " + roomId);

			$('#waiting_for_opponent').addClass("waiting_for_opponent_visible");

			if (isMaster) {
				copyToClipboard("Send this to your friend.\nCtrl+C, Enter", window.location + "?roomId=" + roomId);
			}
		},

		// onGameReady
		function () {
			trace("onGameReady");

			$('#waiting_for_opponent').remove();
		},

		// onGameStatus
		function (status) {
			trace("onGameStatus = " + JSON.stringify(status));

			switch (status.operation) {
				case 'started':
					if (status.yourTurn) {
						$('#your_score_container').toggleClass("highlight_turn", 1000, "easeOutSine");
					} else {
						$('#his_score_container').toggleClass("highlight_turn", 1000, "easeOutSine");
					}

					break;
				case 'turn':
					$('#your_score_container').toggleClass("highlight_turn", 1000, "easeOutSine");
					$('#his_score_container').toggleClass("highlight_turn", 1000, "easeOutSine");

					break;

				case 'ended':
					if (status.win) {
						adjustScore($('#your_score_container'), $('#your_score'), status.yourScore);
					} else {
						adjustScore($('#his_score_container'), $('#his_score'), status.hisScore);
					}

					break;
			}
		}
);
game.initiate();

function onNewGame() {
//	if (confirm("Are you sure?")) {
	game.newGame();
//	}
}

var adjustScore = function (container, scoreView, score) {
	scoreView.text(score);
	container.fadeTo('slow', 0);
	container.fadeTo('slow', 1);
}
