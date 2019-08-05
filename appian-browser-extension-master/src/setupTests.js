import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import chrome from 'sinon-chrome';
import sinon from 'sinon';

configure({ adapter: new Adapter() });

jest.mock('./api/extensionTelemetry', () => ({
  initializeTelemetry: jest.fn(),
  pageview: jest.fn()
}));

// Do not allow console errors.
// See https://github.com/facebook/jest/issues/6121#issuecomment-412063935
let isConsoleWarningOrError;
beforeEach(() => {
  isConsoleWarningOrError = false;
  const originalError = global.console.error;
  jest.spyOn(global.console, 'error').mockImplementation((...args) => {
    isConsoleWarningOrError = true;
    originalError(...args);
  });
  const originalWarn = global.console.warn;
  jest.spyOn(global.console, 'warn').mockImplementation((...args) => {
    isConsoleWarningOrError = true;
    originalWarn(...args);
  });
});
afterEach(() => {
  if (isConsoleWarningOrError) {
    throw new Error('Console warnings and errors are not allowed');
  }
});

beforeEach(() => {
  global.chrome = chrome;
  chrome.reset();
  global.fetch = jest.fn(
    () =>
      new Promise(resolve =>
        resolve({ status: 200, ok: true, json: () => ({}) })
      )
  );

  chrome.runtime.sendMessage
    .withArgs({
      messageType: 'setSettings',
      data: sinon.match.any
    })
    .yields({});
});
