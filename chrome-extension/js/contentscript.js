var editorFrame = document.createElement("iframe");
editorFrame.name = "editorFrame";
editorFrame.style.cssText = convertJsonToCss({
	position : "fixed",
	left : "0px",
	top : "0px",
	right : "0px",
	bottom : "0px",
	width : "100%",
	height : "100%",
	border : "none",
	"background-color" : "rgba(255, 255, 255, 1.0)",
	"z-index" : "999998",
	cursor : "default",
	"float" : "none",
	margin : "0px",
	padding : "0px",
	opacity : "1",
	display : "none"
});
document.body.appendChild(editorFrame);
var editorDocument = editorFrame.contentDocument;

var timer = null;

function stopInterval() {
	if (timer != null) {
		window.clearInterval(timer);
		timer = null;
	}
}

function startInterval() {
	stopInterval();
	timer = window.setInterval("checkHideIcon()", 100);
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch(request.action){
		case "webRequest":
			if (checkDialog() == false) {
				return;
			}
		
			if( getSource() != null){
				startInterval();
				sendResponse({
					isSuccess : true
				});
				return;
			}
		
			stopInterval();
			sendResponse({
				isSuccess : false
			});
			break;
		case "showEditor" :
			showEditor(request.html);
			break;
	}
});

function showEditor(requestHtml){
	editorFrame.style.display = "inline";
	var html = requestHtml;
	var source = getSource();
	// source = replaceAll(source, "&", "&amp;");
	// html = replaceAll(html, "${source}", source);
	html = replaceAll(html, "${close.title}", getCloseTitle());
	editorDocument.open();
	editorDocument.write(html);
	editorDocument.getElementById("source").value = source;
	editorDocument.close();
	var attClose = editorDocument.getElementById("attClose");
	if( attClose ){
		attClose.addEventListener("click", closeEditor);
	}
	var btnApply = editorDocument.getElementById("btnApply");
	if( btnApply ){
		btnApply.addEventListener("click", applySource);
	}
}

function closeEditor(){
	editorFrame.style.display = "none";
	editorDocument.head.innerHTML = "";
	editorDocument.body.innerHTML = "";
}

function applySource(){
	editorFrame.style.display = "none";
	setSource(editorDocument.getElementById("source").value);
	editorDocument.head.innerHTML = "";
	editorDocument.body.innerHTML = "";
}

function getSource(){
	var textareas = document.getElementsByTagName("textarea");
	if (textareas.length > 0) {
		for ( var i = 0; i < textareas.length; i++) {
			if (textareas[i].dir == "ltr") {
				return textareas[i].value;
			}
		}
	}

	return null;
}

function setSource(source){
	var textareas = document.getElementsByTagName("textarea");
	if (textareas.length > 0) {
		for ( var i = 0; i < textareas.length; i++) {
			if (textareas[i].dir == "ltr") {
				textareas[i].value = source;
			}
		}
	}
}

function getCloseTitle(){
	if(checkDialog()){
		var as = document.getElementsByTagName("a");
		if (as.length > 0) {
			for ( var i = 0; i < as.length; i++) {
				var kindAttr = as[i].getAttribute("kind");
				if( kindAttr == "close"){
					return as[i].title;
				}
			}
		}
	}

	return null;
}

function checkDialog() {
	return (document.querySelector("div[role='dialog']") != null);
}

function checkHideIcon() {
	if (checkDialog()) {
		return;
	}

	var textareas = document.getElementsByTagName("textarea");
	if (textareas.length > 0) {
		for ( var i = 0; i < textareas.length; i++) {
			if (textareas[i].dir == "ltr") {
				return;
			}
		}
	}

	hideIcon();
};

function hideIcon() {
	stopInterval();
	chrome.extension.sendRequest({action:"hideIcon"}, function(response) {
	});
}

function replaceAll(str, originStr, replaceStr) {
	return str.split(originStr).join(replaceStr);
}

function convertJsonToCss(json) {
	var css = "";
	for (key in json)
		css += key + ": " + json[key] + "; ";
	return css;
}
