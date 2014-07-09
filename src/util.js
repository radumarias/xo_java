$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null){
		return null;
	}
	else{
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
	return { "x" : x, "y" : y};
}

function copyToClipboard(text) {
	window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}
