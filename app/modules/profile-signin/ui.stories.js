import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import UI from './ui';

storiesOf(UI.name, module)
  .add('default', () => (
    <UI
      profile={{
        pbxHostname: 'vule.work',
        pbxPort: '8443',
        pbxTenant: 'tn1',
        pbxUsername: '1001',
      }}
      pbxPassword="123"
      setPbxPassword={action('setPbxPassword')}
      cancel={action('cancel')}
      signin={action('signin')}
    />
  ))
  .add('404', () => <UI cancel={action('cancel')} />);
