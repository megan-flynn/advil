import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import App from './App';
import MainContent from '../MainContent/MainContent';
import Setup from '../Setup/Setup';
import Spinner from '../Spinner/Spinner';
import chrome from 'sinon-chrome';
import '../../api/appianApi';
import configureStore from '../../model/configureStore';

jest.mock('../../api/appianApi');

function completePromises() {
  return new Promise(resolve => setImmediate(resolve));
}

function renderApp() {
  const store = configureStore();
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

describe('App', () => {
  test('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(renderApp(), div);
  });

  test('initial state is not initialized, shows Spinner', () => {
    const app = mount(renderApp());
    expect(app.find('App').instance().props.settingsLoaded).toBeFalsy();
    expect(app.find(Spinner)).toHaveLength(1);
  });

  test('initialized after getSettings response received, no Spinner', async () => {
    chrome.runtime.sendMessage
      .withArgs({ messageType: 'getSettings' })
      .yields({ currentUrl: 'current.tab.com' });
    const app = mount(renderApp());
    await completePromises();
    app.update();
    expect(chrome.runtime.sendMessage.called).toBeTruthy();
    expect(app.find('App').instance().props.settingsLoaded).toBeTruthy();
    expect(app.find(Spinner)).toHaveLength(0);
  });

  describe('if settings has a siteUrl', () => {
    test('displays MainContent', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: 'http://home.appian.com',
          pinnedActionId: '1234'
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      expect(app.find(MainContent)).toHaveLength(1);
      expect(app.find(Setup)).toHaveLength(0);
    });

    test('MainContent can request Setup page be displayed through callback', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: 'http://home.appian.com',
          pinnedActionId: '1234',
          activeView: 'actions'
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const userClickSetup = app
        .find('TabBar')
        .first()
        .props().userClickSetup;
      expect(userClickSetup).toBeDefined();
      userClickSetup();
      app.update();
      expect(app.find(MainContent)).toHaveLength(1);
      expect(app.find('ActionsList')).toHaveLength(0);
      expect(app.find(Setup)).toHaveLength(1);
    });

    test('Setup page can cancel setup through callback and siteUrl will still be set', async () => {
      const siteUrl = 'http://home.appian.com';
      const pinnedActionId = '1234';
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'current.tab.com',
          siteUrl,
          pinnedActionId,
          activeView: 'actions'
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const userClickSetup = app
        .find('TabBar')
        .first()
        .props().userClickSetup;
      expect(userClickSetup).toBeDefined();
      userClickSetup();
      app.update();
      const updateSettings = app
        .find('Setup')
        .first()
        .props().updateSettings;
      expect(updateSettings).toBeDefined();
      updateSettings({});
      app.update();
      await completePromises();
      app.update();
      await completePromises();
      expect(app.find(MainContent)).toHaveLength(1);
      expect(app.find('MainContent').instance().props.siteUrl).toEqual(siteUrl);
    });
  });

  describe('if settings does not have a siteUrl', () => {
    test('displays Setup page', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({ currentUrl: 'http://current.tab.com', siteUrl: undefined });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      expect(app.find('ActionsList')).toHaveLength(0);
      expect(app.find(Setup)).toHaveLength(1);
    });

    test('Setup page can set the siteUrl through callback and app will show MainContent', async () => {
      const siteUrl = 'http://newSite.appian.com';
      const getFn = chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: undefined
        });
      const setFn = chrome.runtime.sendMessage
        .withArgs({
          messageType: 'setSettings',
          data: { siteUrl }
        })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl,
          pinnedActionId: '1234'
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const updateSettings = app
        .find('Setup')
        .first()
        .props().updateSettings;
      expect(updateSettings).toBeDefined();
      updateSettings({ siteUrl });
      await completePromises();
      app.update();
      expect(getFn.called).toBeTruthy();
      expect(setFn.called).toBeTruthy();
      expect(app.find(MainContent)).toHaveLength(1);
      expect(app.find(Setup)).toHaveLength(0);
      expect(app.find('MainContent').instance().props.siteUrl).toEqual(siteUrl);
    });

    test('Setup page cannot cancel setup without a siteUrl', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: undefined,
          activeView: 'actions'
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const updateSettings = app
        .find('Setup')
        .first()
        .props().updateSettings;
      expect(updateSettings).toBeDefined();
      updateSettings({});
      expect(app.find('ActionsList')).toHaveLength(0);
      expect(app.find(Setup)).toHaveLength(1);
      expect(app.find('App').instance().props.siteUrl).toBeUndefined();
    });
  });
});
