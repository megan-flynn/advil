import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './components/App/App';
import { initializeTelemetry } from './api/extensionTelemetry';
import configureStore from './model/configureStore';

initializeTelemetry();
const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
