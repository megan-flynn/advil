import { sendChromeMessage } from './chromeApi';

// Feature flags, represent what this client (the extension) is capable of understanding from the server
const DEFAULT_FEATURE_FLAGS = 'e4bc';

// Settings, can be overridden by results from the connect response
const appianSettings = {
  urls: {
    ping: '/cors/ping',
    allowedOrigins: '/cors/wc',
    connect: '/webapi/browser-extension-connect',
    allActionsEmbedOnly: '/api/tempo/open-a-case/available-actions?sf=true',
    starredActionsEmbedOnly:
      '/api/tempo/open-a-case/available-actions?sf=true&f=true',
    allActions: '/api/tempo/open-a-case/available-actions?',
    starredActions: '/api/tempo/open-a-case/available-actions?f=true',
    embeddedIFrame:
      '/webapi/browser-extension-embed-from-parameters?embeddedType=action&processModelUuid=',
    embeddedTask:
      '/webapi/browser-extension-embed-from-parameters?embeddedType=task&taskId=',
    assignedTasks:
      '/api/feed/tempo?m=menu-tasks&t=t&s=pt&defaultFacets=%255Bstatus-open%255D',
    action: '/tempo/actions/item/', // Append actionID
    task: '/tempo/tasks/task/' // Append taskId
  },
  currentSite: {}
};

export function getSiteUrlWithBaseFolder(siteUrl) {
  return `${siteUrl}/${getBaseFolder(siteUrl)}`;
}

function getAbsoluteUrlForSite(
  relativeUrl,
  siteUrl = _getCurrentSite().siteUrl
) {
  if (!siteUrl) {
    throw new Error('Site not specified.');
  }
  return `${getSiteUrlWithBaseFolder(siteUrl)}${relativeUrl}`;
}

function getBaseFolder(siteUrl) {
  const url = new URL(siteUrl);
  const firstFolder = url.pathname.split('/')[1];
  if (firstFolder) {
    return firstFolder;
  }

  // For internal testing
  if (url.host.indexOf('appiancorp.com') > 0 && url.port === '8080') {
    return 'ae';
  } else {
    return 'suite';
  }
}

async function connectToAppianCompanionApp() {
  const connectUrl = getAbsoluteUrlForSite(appianSettings.urls.connect);
  const response = await fetch(connectUrl, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(response.status);
  }

  const responseJson = await response.json();
  if (responseJson) {
    Object.assign(appianSettings, responseJson);
  }
  return appianSettings;
}

export function _getCurrentSite() {
  return appianSettings.currentSite;
}
export function _setCurrentSite(currentSite) {
  appianSettings.currentSite = currentSite;
}

export async function getAllowedOrigins(siteUrl) {
  const allowedOriginsUrl = getAbsoluteUrlForSite(
    appianSettings.urls.allowedOrigins,
    siteUrl
  );

  const allowedOrigins = await sendChromeMessage({
    messageType: 'getAllowedOrigins',
    data: { allowedOriginsUrl }
  });
  return allowedOrigins;
}

export async function _getSiteToken(siteUrl) {
  const { siteUrl: currentSiteUrl, __appianCsrfToken } = _getCurrentSite();
  if ((!siteUrl || siteUrl === currentSiteUrl) && __appianCsrfToken) {
    return __appianCsrfToken;
  }

  if (!siteUrl) {
    siteUrl = currentSiteUrl;
    if (!siteUrl) {
      throw new Error(400);
    }
  }

  const pingUrl = getAbsoluteUrlForSite(appianSettings.urls.ping, siteUrl);
  const response = await fetch(pingUrl, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(response.status);
  }

  let responseJson;
  try {
    responseJson = await response.json();
  } catch (e) {
    // User is not logged on
    throw new Error(401);
  }

  if (!responseJson || !responseJson.__appianCsrfToken) {
    // User is not logged on
    throw new Error(401);
  }

  _setCurrentSite({
    __appianCsrfToken: responseJson.__appianCsrfToken,
    siteUrl
  });

  return responseJson.__appianCsrfToken;
}

export async function validateSiteUrl(siteUrl) {
  await _getSiteToken(siteUrl);

  await sendChromeMessage({
    messageType: 'setCurrentSite',
    data: { currentSite: _getCurrentSite() }
  });

  try {
    const settingsResponse = await connectToAppianCompanionApp();
    return {
      ...settingsResponse,
      siteValidationWarning: undefined
    };
  } catch (e) {
    // This site does not have the companion app installed.
    return {
      siteValidationWarning: `The Appian Browser Extension application does not seem to exist on ${siteUrl}. The extension may be used, but functionality may be reduced. Please check the URL or contact your system administrator.`,
      noCompanionApp: true
    };
  }
}

export async function getActionsForSite(onlyFetchStarred, onlyEmbeddable) {
  const __appianCsrfToken = await _getSiteToken();

  const getActionsUrl = getAbsoluteUrlForSite(
    onlyFetchStarred
      ? onlyEmbeddable
        ? appianSettings.urls.starredActionsEmbedOnly
        : appianSettings.urls.starredActions
      : onlyEmbeddable
        ? appianSettings.urls.allActionsEmbedOnly
        : appianSettings.urls.allActions
  );
  const response = await fetch(getActionsUrl, {
    credentials: 'include',
    headers: {
      'x-appian-csrf-token': __appianCsrfToken,
      'X-Appian-Features-Extended': DEFAULT_FEATURE_FLAGS
    }
  });

  if (!response.ok) {
    return [];
  }

  const responseJson = await response.json();
  if (!responseJson || responseJson.length === 0) {
    return [];
  }
  return responseJson[0].actions.map(action => ({
    isStarred: action.favorite,
    toggleStarredUrl: action.favoriteLink,
    processModelUuid: action.processModelUuid,
    clickThroughHref: action.clickThroughHref,
    displayName: action.displayLabel
  }));
}

export function getEmbeddedIframeUrl(actionId, isTask = false) {
  return getAbsoluteUrlForSite(
    `${
      isTask
        ? appianSettings.urls.embeddedTask
        : appianSettings.urls.embeddedIFrame
    }${actionId}`
  );
}

export async function getTasksForSite() {
  const __appianCsrfToken = await _getSiteToken();
  const getTasksUrl = getAbsoluteUrlForSite(appianSettings.urls.assignedTasks);
  const response = await fetch(getTasksUrl, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'x-appian-csrf-token': __appianCsrfToken,
      'X-Appian-Features-Extended': DEFAULT_FEATURE_FLAGS
    }
  });

  if (!response.ok) {
    return [];
  }

  const responseJson = await response.json();
  if (!responseJson || responseJson.length === 0) {
    return [];
  }

  return (
    responseJson.feed.entries
      // TODO: implement social tasks.  For now, filter to only regular (starts with t-) tasks.
      .filter(entry => entry.id && entry.id.startsWith('t-'))
      .map(entry => ({
        id: entry.id,
        displayName: entry.content,
        taskId: entry.id.replace(/^t-/, ''),
        clickThroughHref: entry.links.find(link => link.rel === 'share').href
      }))
  );
}
