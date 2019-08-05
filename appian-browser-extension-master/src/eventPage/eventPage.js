/*global chrome*/
import { getTaskCount } from './appianBackgroundTasks';
import { _setCurrentSite } from '../api/appianApi';

const messageHandler = {
  executeMessage(request) {
    if (typeof messageHandler[request.messageType] === 'function') {
      return messageHandler[request.messageType](request.data);
    }
  },

  openTab(siteUrl) {
    chrome.tabs.create({
      url: siteUrl
    });
  },

  retrieveSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(null, settings => {
        if (chrome.runtime.lastError) {
          reject('Error retrieving settings.');
        } else {
          resolve(settings);
        }
      });
    });
  },

  getSettings() {
    const tabQueryPromise = new Promise((resolve, reject) => {
      // Requires "tabs" permission in manifest for Firefox
      // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#tabs
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        tabs => {
          if (chrome.runtime.lastError) {
            reject('Error retrieving current tab.');
          } else {
            const currentTab = (tabs && tabs[0]) || {};
            const currentTabUrl = currentTab.url;
            const currentTabId = currentTab.id;
            const currentTabTitle = currentTab.title;
            resolve({ currentTabUrl, currentTabId, currentTabTitle });
          }
        }
      );
    });

    const readGmailDomPromise = tabId =>
      new Promise((resolve, reject) => {
        chrome.tabs.executeScript(
          tabId,
          {
            code: `
          (function() {
            const subjectEl = document.querySelector(".hP");
            const emailSubject = subjectEl && subjectEl.innerText;
            return {emailSubject};
          })();
        `
          },
          results => {
            const result = results && results[0];
            resolve(result);
          }
        );
      });

    const getGmailInfoPromise = tabQueryPromise.then(settings => {
      try {
        const currentTabUrlObj = new URL(settings.currentTabUrl);
        if ('mail.google.com' === currentTabUrlObj.host) {
          // Query the DOM for email subject and body
          return readGmailDomPromise(settings.currentTabId).then(result => {
            return { ...settings, ...result };
          });
        } else {
          return settings;
        }
      } catch (e) {
        return settings;
      }
    });

    return Promise.all([getGmailInfoPromise, this.retrieveSettings()]).then(
      ([tabSettings, otherSettings]) => {
        return { ...tabSettings, ...otherSettings };
      }
    );
  },

  setSettings(settings) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(settings, result => {
        if (chrome.runtime.lastError) {
          reject('Error persisting settings.');
        } else {
          // A successful change.  Was siteUrl updated?
          if (settings.siteUrl) {
            updateTasksBadge();
          }
          resolve(settings);
        }
      });
    });
  },

  setCurrentSite({ currentSite }) {
    _setCurrentSite(currentSite);
    return Promise.resolve({});
  },

  getAllowedOrigins({ allowedOriginsUrl }) {
    const responsePromise = fetch(allowedOriginsUrl, {
      credentials: 'include'
    });
    return responsePromise
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status || 'Unknown');
        }
        return response.text();
      })
      .then(responseText => {
        const reOrigins = /case '([^']*)':/gm;
        let match;
        let allowedOrigins = [];
        while ((match = reOrigins.exec(responseText))) {
          allowedOrigins.push(match[1]);
        }
        return allowedOrigins;
      });
  }
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

// Other helpers
const pollForTasksAlarmName = 'pollForTasks';
const updateTasksBadge = async () => {
  // Get the task count from Appian
  try {
    const taskCount = await getTaskCount();
    chrome.browserAction.setBadgeText({
      text: taskCount ? `${taskCount}` : ''
    });
  } catch (e) {
    // Not logged in yet, can't update tasks count.
    return;
  }

  // Set the chrome.alarm to callback so we can poll for task changes later, too.
  chrome.alarms.create(pollForTasksAlarmName, {
    delayInMinutes: 1
  });
};

// Other initialization
async function initExtension() {
  // Set up the SiteUrl
  const { siteUrl } = await messageHandler.retrieveSettings();
  if (!siteUrl) {
    return;
  }

  _setCurrentSite({ siteUrl });

  // Create a recurring task-count-updater
  chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name === pollForTasksAlarmName) {
      updateTasksBadge();
    }
  });

  updateTasksBadge();
}

initExtension();
