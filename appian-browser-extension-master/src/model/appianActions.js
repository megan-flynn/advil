import { getActionsForSite, getTasksForSite } from '../api/appianApi';

export const APPIAN_GET_ACTIONS_INPROGRESS = 'APPIAN_GET_ACTIONS_INPROGRESS';
export const APPIAN_GET_ACTIONS_SUCCESS = 'APPIAN_GET_ACTIONS_SUCCESS';
export const APPIAN_GET_ACTIONS_FAILED = 'APPIAN_GET_ACTIONS_FAILED';
export const APPIAN_ACTION_COMPLETE = 'APPIAN_ACTION_COMPLETE';
export const APPIAN_GET_TASKS_INPROGRESS = 'APPIAN_GET_TASKS_INPROGRESS';
export const APPIAN_GET_TASKS_SUCCESS = 'APPIAN_GET_TASKS_SUCCESS';
export const APPIAN_GET_TASKS_FAILED = 'APPIAN_GET_TASKS_FAILED';

export function appianActionComplete() {
  return {
    type: APPIAN_ACTION_COMPLETE
  };
}

function appianGetActionsInProgress() {
  return {
    type: APPIAN_GET_ACTIONS_INPROGRESS
  };
}

function appianGetActionsSuccess(actions) {
  return {
    type: APPIAN_GET_ACTIONS_SUCCESS,
    actions
  };
}

function appianGetActionsFailed(error) {
  return {
    type: APPIAN_GET_ACTIONS_FAILED,
    error
  };
}

export function appianGetActions(onlyShowStarred, onlyEmbeddable) {
  return async dispatch => {
    dispatch(appianGetActionsInProgress());
    try {
      const actions = await getActionsForSite(onlyShowStarred, onlyEmbeddable);
      if (Array.isArray(actions)) {
        dispatch(appianGetActionsSuccess(actions));
      } else {
        throw new Error('Unable to get actions');
      }
    } catch (e) {
      dispatch(appianGetActionsFailed(e));
    }
  };
}

function appianGetTasksInProgress() {
  return {
    type: APPIAN_GET_TASKS_INPROGRESS
  };
}

function appianGetTasksSuccess(tasks) {
  return {
    type: APPIAN_GET_TASKS_SUCCESS,
    tasks
  };
}

function appianGetTasksFailed(error) {
  return {
    type: APPIAN_GET_TASKS_FAILED,
    error
  };
}

export function appianGetTasks() {
  return async dispatch => {
    dispatch(appianGetTasksInProgress());
    try {
      const tasks = await getTasksForSite();
      if (Array.isArray(tasks)) {
        dispatch(appianGetTasksSuccess(tasks));
      } else {
        throw new Error('Unable to get Tasks');
      }
    } catch (e) {
      dispatch(appianGetTasksFailed(e));
    }
  };
}
