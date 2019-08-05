import {
  SETTINGS_USER_CLICK_SETUP,
  SETTINGS_GET_SUCCESS,
  SETTINGS_UPDATE_SUCCESS,
  SETTINGS_GET_FAILED,
  SETTINGS_VALIDATION_SUCCESS,
  SETTINGS_VALIDATION_FAILED
} from './settingsActions';

const initialState = {
  onlyShowStarred: true
};

export default function(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case SETTINGS_USER_CLICK_SETUP: {
      return {
        ...state,
        userClickedSetup: true
      };
    }
    case SETTINGS_GET_SUCCESS: {
      const { settings } = action;
      return {
        settingsLoaded: true,
        ...state,
        ...settings
      };
    }
    case SETTINGS_VALIDATION_SUCCESS: {
      const { additionalSettings } = action;
      return {
        ...state,
        ...additionalSettings,
        siteValidationError: undefined
      };
    }
    case SETTINGS_VALIDATION_FAILED: {
      const { error } = action;
      return {
        ...state,
        siteValidationError: error
      };
    }
    case SETTINGS_UPDATE_SUCCESS: {
      const { updatedSettings } = action;
      return {
        ...state,
        ...updatedSettings,
        userClickedSetup: undefined
      };
    }
    case SETTINGS_GET_FAILED:
      return {
        error: action.error,
        ...state
      };
    default:
      return state;
  }
}
