// Background or EventPage script goes here
// In manifest:
//   "persistent": false // Background page
//   "persistent": true  // Event page

const messageHandler = {
  executeMessage(request) {
    if (typeof messageHandler[request.messageType] === 'function') {
      return messageHandler[request.messageType](request.data);
    }
  }

  // Add functions here, they can be called using sendChromeMessage from chromeApi.js
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const result = messageHandler.executeMessage(request);
  if (result) {
    Promise.resolve(result).then(value => {
      sendResponse(value);
    });

    return true;
  }
});
