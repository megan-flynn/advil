import { applyMiddleware, combineReducers, createStore } from 'redux';
import appianReducer from './appianReducer';
import settingsReducer from './settingsReducer';
import thunkMiddleware from 'redux-thunk';
import { logger } from 'redux-logger';

const rootReducer = combineReducers({
  appian: appianReducer,
  settings: settingsReducer
});
const rootMiddleware =
  process.env.NODE_ENV === 'development'
    ? applyMiddleware(thunkMiddleware, logger)
    : applyMiddleware(thunkMiddleware);

export default function configureStore() {
  return createStore(rootReducer, rootMiddleware);
}
