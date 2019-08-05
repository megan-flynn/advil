import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ActionPicker from '../src/components/ActionPicker/ActionPicker';

const actions = [
  { processModelUuid: '1', displayName: 'Test' },
  { processModelUuid: '2', displayName: 'Test 2' },
  { processModelUuid: '3', displayName: 'Test 3' }
];
storiesOf('ActionPicker', module).add('with some actions', () => (
  <ActionPicker
    actionId={'1'}
    handleActionChange={action('actionChange')}
    actions={actions}
  />
));
