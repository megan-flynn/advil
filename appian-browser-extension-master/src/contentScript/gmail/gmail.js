/*global chrome*/
import { renderAppianObject } from './renderModal';
import { isAppianObject } from './emailParse';
import {
  getSiteUrlWithBaseFolder,
  getAllowedOrigins
} from '../../api/appianApi';

// Get the site url for and then initialize the gmail functionality
let siteUrlWithBaseFolder = null;

async function updateLocalSiteUrl(settingsSiteUrl) {
  if (settingsSiteUrl) {
    const allowedEmbeddedOrigins = await getAllowedOrigins(settingsSiteUrl);
    if (allowedEmbeddedOrigins.indexOf('mail.google.com') >= 0) {
      siteUrlWithBaseFolder = getSiteUrlWithBaseFolder(settingsSiteUrl);
    }
  }
}

chrome.storage.sync.get(['siteUrl'], result => {
  updateLocalSiteUrl(result.siteUrl);
});

chrome.storage.onChanged.addListener(changes => {
  const siteUrlChange = changes['siteUrl'];
  if (siteUrlChange) {
    updateLocalSiteUrl(siteUrlChange.newValue);
  }
});

// Listen for all links added to the page
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    const addedNodes = Array.from(mutation.addedNodes);
    addedNodes
      .concat(
        addedNodes
          .filter(node => node.querySelectorAll)
          .flatMap(node => Array.from(node.querySelectorAll('a')))
      )
      .forEach(addedNode => {
        const appianObject = isAppianObject(addedNode, siteUrlWithBaseFolder);
        if (appianObject) {
          renderAppianObject(appianObject, siteUrlWithBaseFolder);
        }
      });
  });
});

observer.observe(document, {
  childList: true,
  subtree: true,
  characterData: false,
  attributes: false
});
