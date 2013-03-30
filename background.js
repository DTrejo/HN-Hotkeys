chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	// if (request.localstorage == "gmail")
  	//   sendResponse({style: localStorage.email});
  	// else 
  	// Open a new friggin tab.
  	if (request.opentab) {
  		chrome.tabs.create({
  			url: request.opentab
  		});
  		sendResponse({});
  	} else {
  		sendResponse({}); // snub them.
  	}
  });
