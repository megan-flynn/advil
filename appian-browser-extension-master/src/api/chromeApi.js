/*global chrome*/

export const sendChromeMessage = request =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(request, response => {
      if (!response) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });

export function findRecents(host, callback) {
  return chrome.history.search({ text: host, maxResults: 100 }, data => {
    // history.search() does a text search, not a URL match.  Need to post-process to filter links
    // See https://stackoverflow.com/questions/8649057/how-do-i-use-chromes-history-api-to-search-for-visits-matching-a-given-url
    // Also, don't include process modeler links since they need to be opened from /design
    // See see issue #4
    const visitedPages = data.filter(
      page =>
        page.url &&
        page.url.startsWith(host) &&
        page.url.indexOf('/process/startdesigner.none') === -1
    );
    callback(visitedPages);
  });
}

export function openTab(newURL) {
  chrome.tabs.create({ url: newURL });
}

export function getExtensionManifest() {
  return chrome.runtime.getManifest();
}
