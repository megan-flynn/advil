import React from 'react';
import { Provider } from 'react-redux';
import { mount, shallow } from 'enzyme';
import App from '../App/App';
import { TabBar } from '../TabBar/TabBar';
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

describe('TabBar', () => {
  test('renders without crashing', () => {
    shallow(
      <TabBar
        userClickSetup={jest.fn()}
        handleTabChange={jest.fn()}
        activeTab={''}
        getTasks={jest.fn()}
      />
    );
  });

  test('User can click all the tabs', async () => {
    const expectedTabs = [
      { label: 'TASKS', view: 'TaskList' },
      { label: 'ACTIONS', view: 'ActionsList' },
      { label: 'RECENTS', view: 'RecentsList' },
      { label: 'FAVORITES', view: 'Favorites' },
      { label: null, view: 'Setup' }
    ];

    chrome.runtime.sendMessage.withArgs({ messageType: 'getSettings' }).yields({
      currentUrl: 'http://current.tab.com',
      siteUrl: 'http://home.appian.com',
      pinnedActionId: '1234',
      activeView: 'favorites'
    });
    const app = mount(renderApp());
    await completePromises();
    app.update();
    const tabs = app
      .find('TabBar')
      .first()
      .find('button');
    expect(tabs).toHaveLength(expectedTabs.length);
    function getButtonForIndex(index) {
      return app
        .find('TabBar')
        .first()
        .find('button')
        .at(index);
    }
    for (const [index, tab] of expectedTabs.entries()) {
      const button = getButtonForIndex(index);
      expect(button.props().disabled).toBeFalsy();
      const labelElement = button.find('div.buttonLabel');
      const label = labelElement.length
        ? button.find('div.buttonLabel').text()
        : null;
      expect(button.hasClass('active')).toBeFalsy();
      expect(label).toEqual(tab.label);
      button.simulate('click');
      await completePromises();
      app.update();
      expect(app.find(tab.view)).toHaveLength(1);
      const newButton = getButtonForIndex(index);
      expect(newButton.hasClass('active')).toBeTruthy();
    }
  });

  test('Tab color is configurable via settings', async () => {
    chrome.runtime.sendMessage.withArgs({ messageType: 'getSettings' }).yields({
      currentUrl: 'http://current.tab.com',
      siteUrl: 'http://home.appian.com',
      pinnedActionId: '1234',
      activeView: 'favorites',
      branding: { accentColor: '#0A4F0C' }
    });
    const app = mount(renderApp());
    await completePromises();
    app.update();
    const tabs = app.find('TabBar').first();
    expect(tabs).not.toBeUndefined();
    const tabProps = tabs.get(0).props;
    expect(tabProps).toHaveProperty('backgroundColor', '#0A4F0C');
  });
});
