import React from 'react';
import { Provider } from 'react-redux';
import { mount, shallow } from 'enzyme';
import App from '../App/App';
import { ActionsList } from '../ActionsList/ActionsList';
import chrome from 'sinon-chrome';
import '../../api/appianApi';
import configureStore from '../../model/configureStore';

const mockActions = [
  {
    isStarred: false,
    toggleStarredUrl: '',
    processModelUuid: 'uuid-1',
    displayName: 'unstarred action',
    clickThroughHref: 'https://www.doanaction.com/go'
  },
  {
    isStarred: true,
    toggleStarredUrl: '',
    processModelUuid: 'uuid-2',
    displayName: 'starred action'
  }
];

const mocks = {
  mockActions
};

jest.mock('../../api/appianApi', () => {
  return {
    validateSiteUrl: jest.fn(() => {
      return Promise.resolve(true);
    }),
    getActionsForSite: () => {
      return Promise.resolve(mocks.mockActions);
    },
    getEmbeddedIframeUrl: () => {
      return Promise.resolve('embedded.iframe.url');
    }
  };
});

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

describe('ActionsList', () => {
  test('renders without crashing', () => {
    shallow(
      <ActionsList
        siteUrl={''}
        currentTab={{ url: '' }}
        getActions={jest.fn()}
      />
    );
  });

  test('Displays when actions tab is active', async () => {
    chrome.runtime.sendMessage.withArgs({ messageType: 'getSettings' }).yields({
      currentUrl: 'http://current.tab.com',
      siteUrl: 'http://home.appian.com',
      activeView: 'actions'
    });
    const app = mount(renderApp());
    await completePromises();
    app.update();
    const actions = app.find(ActionsList);
    expect(actions).toHaveLength(1);
  });

  test('Lists actions when provided', async () => {
    chrome.runtime.sendMessage.withArgs({ messageType: 'getSettings' }).yields({
      currentUrl: 'http://current.tab.com',
      siteUrl: 'http://home.appian.com',
      activeView: 'actions',
      onlyShowStarred: false
    });
    const app = mount(renderApp());
    await completePromises();
    app.update();
    const actionList = app.find(ActionsList);
    expect(actionList).toHaveLength(1);
    expect(app.find('div.actionListLoading')).toHaveLength(0);
    const actions = actionList.find('span.actionName');
    expect(actions).toHaveLength(mockActions.length);
    function getActionForIndex(index) {
      return app
        .find(ActionsList)
        .find('li')
        .at(index);
    }
    for (const [index, expectedAction] of mockActions.entries()) {
      const action = getActionForIndex(index);
      expect(action.find('span.actionName').text()).toEqual(
        expectedAction.displayName
      );
      if (expectedAction.isStarred) {
        expect(action.find('img').hasClass('starIcon')).toBeTruthy();
      } else {
        expect(action.find('img')).toHaveLength(0);
      }
    }
  });

  describe('WHEN there are no tasks', () => {
    beforeAll(() => {
      mocks.mockActions = [];
    });
    afterAll(() => {
      mocks.mockActions = mockActions;
    });

    test('Fails gracefully when there are no tasks', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: 'http://home.appian.com',
          activeView: 'actions',
          onlyShowStarred: false
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const actionList = app.find(ActionsList);
      expect(actionList).toHaveLength(1);
      expect(actionList.find('div.actionListLoading')).toHaveLength(0);
      const actions = actionList.find('span.actionName');
      expect(actions).toHaveLength(0);
    });
  });

  describe('WHEN there is no Companion App', () => {
    test('Embedded mode is not enabled', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: 'http://home.appian.com',
          activeView: 'actions',
          onlyShowStarred: false,
          noCompanionApp: true
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const actionsList = app.find(ActionsList);
      expect(actionsList.props().disableEmbedded).toBeTruthy();
    });

    test('Actions are links', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: 'http://home.appian.com',
          activeView: 'actions',
          onlyShowStarred: false,
          noCompanionApp: true
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const actionList = app.find(ActionsList);
      expect(actionList).toHaveLength(1);
      const actions = actionList.find('span.actionName');
      expect(actions).toHaveLength(mockActions.length);
      const firstAction = app
        .find(ActionsList)
        .find('li')
        .at(0);
      expect(chrome.tabs.create.notCalled).toBeTruthy();
      firstAction.find('span').simulate('click');
      expect(chrome.tabs.create.calledOnce).toBeTruthy();
      expect(chrome.tabs.create.args).toHaveLength(1);
      expect(chrome.tabs.create.args[0][0]).toEqual({
        url: mockActions[0].clickThroughHref
      });
    });
  });

  describe('WHEN Cmd is held down', () => {
    test('Actions open in new tab', async () => {
      chrome.runtime.sendMessage
        .withArgs({ messageType: 'getSettings' })
        .yields({
          currentUrl: 'http://current.tab.com',
          siteUrl: 'http://home.appian.com',
          activeView: 'actions'
        });
      const app = mount(renderApp());
      await completePromises();
      app.update();
      const firstAction = app
        .find(ActionsList)
        .find('li')
        .at(0);
      expect(chrome.tabs.create.notCalled).toBeTruthy();
      firstAction.find('span').simulate('click', { metaKey: true });
      expect(chrome.tabs.create.calledOnce).toBeTruthy();
      expect(chrome.tabs.create.args).toHaveLength(1);
      expect(chrome.tabs.create.args[0][0]).toEqual({
        url: mockActions[0].clickThroughHref
      });
    });
  });
});
