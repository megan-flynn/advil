import React from 'react';
import ReactDOM from 'react-dom';
import { Setup } from './Setup';
import { shallow } from 'enzyme';

describe('Setup', () => {
  test('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Setup updateSettings={_ => _} cancelSetup={_ => _} />,
      div
    );
  });

  test('entering new siteUrl updates state', () => {
    const mockUpdateSettings = jest.fn(settings => {});
    const siteUrl = 'https://home.appian.com';
    const wrapper = shallow(<Setup updateSettings={mockUpdateSettings} />);
    expect(wrapper.state().siteUrl).toEqual('');
    const inputBox = wrapper.find('input.text');
    expect(inputBox).toHaveLength(1);
    inputBox.simulate('change', { target: { value: siteUrl } });
    expect(wrapper.state().siteUrl).toEqual(siteUrl);
  });

  test('clicking button calls updateSettings', () => {
    const mockUpdateSettings = jest.fn();
    const mockPreventDefault = jest.fn();
    const siteUrl = 'https://home.appian.com';
    const wrapper = shallow(
      <Setup updateSettings={mockUpdateSettings} siteUrl={siteUrl} />
    );
    expect(wrapper.state().siteUrl).toEqual(siteUrl);
    const button = wrapper.find('button');
    expect(button).toHaveLength(1);
    button.simulate('click', { preventDefault: mockPreventDefault });
    expect(mockPreventDefault).toBeCalled();
    expect(mockUpdateSettings).toBeCalledWith({ siteUrl });
  });

  test('hitting enter triggers updateSettings', () => {
    const mockUpdateSettings = jest.fn();
    const siteUrl = 'https://home.appian.com';
    const wrapper = shallow(
      <Setup updateSettings={mockUpdateSettings} siteUrl={siteUrl} />
    );
    expect(wrapper.state().siteUrl).toEqual(siteUrl);
    const inputBox = wrapper.find('input.text');
    expect(inputBox).toHaveLength(1);
    inputBox.simulate('keypress', { key: 'Enter', preventDefault: jest.fn() });
    expect(mockUpdateSettings).toBeCalledWith({ siteUrl });
  });

  test('trailing slashes are stripped', () => {
    const mockUpdateSettings = jest.fn();
    const siteUrl = 'https://home.appian.com';
    const siteUrlWithSlash = 'https://home.appian.com/';
    const wrapper = shallow(
      <Setup updateSettings={mockUpdateSettings} siteUrl={siteUrlWithSlash} />
    );
    expect(wrapper.state().siteUrl).toEqual(siteUrlWithSlash);
    const button = wrapper.find('button');
    expect(button).toHaveLength(1);
    button.simulate('click', { preventDefault: jest.fn() });
    expect(mockUpdateSettings).toBeCalledWith({ siteUrl });
  });
});
