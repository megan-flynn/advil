import React from 'react';
import { MainContent } from './MainContent';
import { shallow } from 'enzyme';

describe('MainContent', () => {
  test('renders without crashing', () => {
    shallow(
      <MainContent
        updateSettings={_ => _}
        siteUrl="http://siteurl.com"
        pinnedActionId=""
        favorites={[]}
        onlyShowStarred={false}
      />
    );
  });
});
