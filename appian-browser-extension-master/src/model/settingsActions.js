import { sendChromeMessage } from '../api/chromeApi';
import { validateSiteUrl } from '../api/appianApi';

export const SETTINGS_FETCHING = 'SETTINGS_FETCHING';
export const SETTINGS_UPDATING = 'SETTINGS_UPDATING';
export const SETTINGS_VALIDATING = 'SETTINGS_VALIDATING';
export const SETTINGS_VALIDATION_SUCCESS = 'SETTINGS_VALIDATION_SUCCESS';
export const SETTINGS_VALIDATION_FAILED = 'SETTINGS_VALIDATION_FAILED';
export const SETTINGS_GET_SUCCESS = 'SETTINGS_GET_SUCCESS';
export const SETTINGS_GET_FAILED = 'SETTINGS_GET_FAILED';
export const SETTINGS_UPDATE_SUCCESS = 'SETTINGS_UPDATE_SUCCESS';
export const SETTINGS_USER_CLICK_SETUP = 'SETTINGS_USER_CLICK_SETUP';
export const SETTINGS_ADD_TO_FAVORITES = 'SETTINGS_ADD_TO_FAVORITES';
export const SETTINGS_REMOVE_FROM_FAVORITES = 'SETTINGS_REMOVE_FROM_FAVORITES';

function settingsFetching() {
  return {
    type: SETTINGS_FETCHING
  };
}

export function userClickSetup() {
  return {
    type: SETTINGS_USER_CLICK_SETUP
  };
}
function settingsUpdating() {
  return {
    type: SETTINGS_UPDATING
  };
}

// Returns boolean indicating if successfully validated
function settingsValidating(settings) {
  return async dispatch => {
    dispatch({
      type: SETTINGS_VALIDATING
    });

    const { siteUrl } = settings;
    if (!siteUrl) {
      return true;
    } else {
      const { success, errorMessage, ...siteInfo } = await siteValidation(
        siteUrl
      );

      if (success) {
        dispatch(settingsValidationSuccess(siteInfo));
        return true;
      } else {
        dispatch(settingsValidationFailed(errorMessage));
        return false;
      }
    }
  };
}

function settingsValidationSuccess(additionalSettings) {
  return {
    type: SETTINGS_VALIDATION_SUCCESS,
    additionalSettings
  };
}
function settingsValidationFailed(error) {
  return {
    type: SETTINGS_VALIDATION_FAILED,
    error
  };
}

function settingsUpdateSuccess({ updatedSettings }) {
  return {
    type: SETTINGS_UPDATE_SUCCESS,
    updatedSettings
  };
}

function settingsGetSuccess({ settings }) {
  return {
    type: SETTINGS_GET_SUCCESS,
    settings
  };
}

function settingsGetFailed(error) {
  return {
    type: SETTINGS_GET_FAILED,
    error
  };
}

// Site Validation may also add additonal settings
// For example, it may return branding information in the format:
// Object
//   branding:
//     accentColor: "#0A4F0C",
//   user: {id: "jed.fonner"}
async function siteValidation(siteUrl) {
  try {
    const response = await validateSiteUrl(siteUrl);
    return {
      ...response,
      success: true
    };
  } catch (e) {
    switch (e.message) {
      case '401':
        return {
          errorMessage: `It doesn't seem like you are logged in to ${siteUrl}. Please try logging in first.`
        };
      case '404':
        return {
          errorMessage: `The site at ${siteUrl} is not compatible with the Appian Browser Extension.  Please check the URL or contact your system administrator.`
        };
      default:
        return { errorMessage: 'Invalid site URL' };
    }
  }
}

export function settingsUpdate(updatedSettings) {
  return async dispatch => {
    dispatch(settingsUpdating());
    const isSettingsValid = await dispatch(settingsValidating(updatedSettings));
    if (isSettingsValid) {
      // Only commit the updated settings if they are valid
      await sendChromeMessage({
        messageType: 'setSettings',
        data: updatedSettings
      });
    }
    dispatch(
      settingsUpdateSuccess({
        updatedSettings
      })
    );
  };
}

export function settingsGet() {
  return async dispatch => {
    dispatch(settingsFetching());
    try {
      const settings = await sendChromeMessage({ messageType: 'getSettings' });
      if (!settings) {
        throw new Error('Unable to get settings.');
      }

      await dispatch(settingsValidating(settings));
      dispatch(
        settingsGetSuccess({
          settings
        })
      );
    } catch (e) {
      dispatch(settingsGetFailed(e));
    }
  };
}

export function settingsAddToFavorites(favorite) {
  return async (dispatch, getState) => {
    dispatch({ type: SETTINGS_ADD_TO_FAVORITES, favorite });
    const oldFavorites = getState().settings.favorites || [];
    const { title, url } = favorite;
    if (oldFavorites.some(favorite => favorite.url === url)) {
      return;
    }

    const favorites = [{ url: url, title: title }, ...oldFavorites];
    dispatch(settingsUpdate({ favorites }));
  };
}

export function settingsRemoveFromFavorites(favorite) {
  return async (dispatch, getState) => {
    dispatch({ type: SETTINGS_REMOVE_FROM_FAVORITES, favorite });
    const oldFavorites = getState().settings.favorites || [];
    const favorites = oldFavorites.filter(
      thisFavorite => thisFavorite.url !== favorite.url
    );
    dispatch(settingsUpdate({ favorites }));
  };
}
