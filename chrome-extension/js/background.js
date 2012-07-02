var mainframe = "";

chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendRequest(tab.id, {
		action : "showEditor",
		tabId : tab.id,
		html : mainframe,
		url : chrome.extension.getURL("../html/mainframe.html")
	}, function(response) {
	});
});

chrome.webRequest.onCompleted.addListener(function(info) {
	if ("POST" == info.method.toUpperCase()) {
		var editorUrlPrefix = "http://www.blogger.com/blogger_rpc?blogID=";
		var urlPrefix = info.url.substring(0, editorUrlPrefix.length);
		if (editorUrlPrefix.toUpperCase() == urlPrefix.toUpperCase()) {
			var tabId = info.tabId;

			chrome.tabs.sendRequest(tabId, {
				action : "webRequest",
				tabId : tabId
			}, function(response) {
				if (response.isSuccess) {
					chrome.pageAction.show(tabId);
				} else {
					chrome.pageAction.hide(tabId);
				}
			});
		}
	}

},
// filters
{
	urls : [ "http://www.blogger.com/blogger_rpc*" ],
	types : [ "xmlhttprequest" ]
},
// extraInfoSpec
[ "responseHeaders" ]//
);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch (request.action) {
	case "showIcon":
		chrome.pageAction.show(sender.tab.id);
		sendResponse({});
		break;
	case "hideIcon":
		chrome.pageAction.hide(sender.tab.id);
		sendResponse({});
		break;
	}
});

function fetchUrl(url, callback, contentType) {
	var results = null;
	var request = new XMLHttpRequest();
	request.open("GET", url, callback != undefined);
	request.onreadystatechange = function() {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (contentType == "JSON")
				results = JSON.parse(this.responseText);
			else if (contentType == "XML")
				results = this.responseXML;
			else
				results = this.responseText;

			if (callback)
				callback(results);
		}
	};
	request.send();
	return results;
}

function replaceAll(str, originStr, replaceStr) {
	return str.split(originStr).join(replaceStr);
}

mainframe = fetchUrl(chrome.extension.getURL("../html/mainframe.html"));
mainframe = replaceAll(mainframe, "${ace.js}", fetchUrl(chrome.extension
		.getURL("../lib/ace-0.2.0/ace.js")));
mainframe = replaceAll(mainframe, "${theme-chrome.js}",
		fetchUrl(chrome.extension.getURL("../lib/ace-0.2.0/theme-chrome.js")));
mainframe = replaceAll(mainframe, "${mode-html.js}", fetchUrl(chrome.extension
		.getURL("../lib/ace-0.2.0/mode-html.js")));
