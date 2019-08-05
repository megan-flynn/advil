import {
  APPIAN_GET_ACTIONS_SUCCESS,
  APPIAN_GET_ACTIONS_FAILED,
  APPIAN_GET_TASKS_SUCCESS,
  APPIAN_GET_TASKS_FAILED,
  APPIAN_ACTION_COMPLETE
} from './appianActions';

const initialState = {
  actions: undefined
};

export default function(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case APPIAN_GET_ACTIONS_SUCCESS: {
      const { actions } = action;
      return {
        ...state,
        actions
      };
    }
    case APPIAN_GET_ACTIONS_FAILED: {
      const { error } = action;
      return {
        error: error,
        ...state
      };
    }
    case APPIAN_GET_TASKS_SUCCESS: {
      const { tasks } = action;
      return {
        ...state,
        tasks
      };
    }
    case APPIAN_GET_TASKS_FAILED: {
      const { error } = action;
      return {
        error: error,
        ...state
      };
    }
    case APPIAN_ACTION_COMPLETE: {
      return {
        actionComplete: true,
        ...state
      };
    }
    default:
      return state;
  }
}
