$.urlParam = function (name) {
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results == null) {
		return null;
	}
	else {
		return results[1] || 0;
	}
}

function getPositionFromSuffix(str) {
	var x, y;

	x = str.substring(str.length - 3, str.length - 2);
	y = str.substring(str.length - 1, str.length);

	return createPosition(x, y);
}

function getUiForType(type) {
	return (type == 0 ? "O" : "X");
}

function trace(text) {
	console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function createPosition(x, y) {
	return { x: x, y: y};
}

function copyToClipboard(text) {
	window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

function showWaitDialog() {
	popupWindow = window.open('child_page.html', 'name', 'width=200,height=200');
	popupWindow.focus();

	return popupWindow;
}

function isLocalHost() {
	return window.location.hostname == "locahost" || window.location.hostname == "127.0.0.1";
}

function linkStream(stream, video) {
	if (window.URL) {
		video.src = window.URL.createObjectURL(stream);
	} else {
		video.src = stream;
	}
	video.play();
}

function setViewEnabled(viewId, enabled, fade) {
	if (enabled) {
		if (fade) {
			$('#' + viewId).fadeTo('slow', 1);
		}
		$('#' + viewId + '_disable_overlay').remove();
	} else {
		if (fade) {
			$('#' + viewId).fadeTo('slow', .2);
		}
		$('#' + viewId).append('<div id="' + viewId + '_disable_overlay"></div>');
		var viewOffset = $('#' + viewId).offset();
		$('#' + viewId + '_disable_overlay').attr("style", "position: absolute;top:" + viewOffset.top + ";" + viewOffset.left + ":0;width:" + $('#' + viewId).width() + ";height:" + $('#' + viewId).height() + ";z-index:2;opacity:0.4;filter: alpha(opacity = 50)");
	}
}
