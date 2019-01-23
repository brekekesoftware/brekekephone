import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import UI from './ui';

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI
      profile={{
        pbxHostname: 'vule.work',
        pbxPort: '8443',
        pbxTenant: 'tn1',
        pbxUsername: '1001',
      }}
      signout={action('signout')}
    />
  ))
  .add('uc enabled', () => (
    <UI
      profile={{
        pbxHostname: 'vule.work',
        pbxPort: '8443',
        pbxTenant: 'tn1',
        pbxUsername: '1001',
        ucEnabled: true,
        ucHostname: 'vule.work',
        ucPort: '8443',
      }}
      chatOffline
      setChatOffline={action('setChatOffline')}
      setChatOnline={action('setChatOnline')}
      setChatBusy={action('setChatBusy')}
      setChatMood={action('setChatMood')}
      submitChatMood={action('submitChatMood')}
      signout={action('signout')}
    />
  ))
  .add('404', () => <UI />);
