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
        parks: [12001, 12002, 12003],
      }}
      save={action('save')}
      back={action('back')}
      setPBXHostname={action('setPBXHostname')}
      setPBXPort={action('setPBXPort')}
      setPBXTenant={action('setPBXTenant')}
      setPBXUsername={action('setPBXUsername')}
      setPBXPassword={action('setPBXPassword')}
      setUCEnabled={action('setUCEnabled')}
      setUCHostname={action('setUCHostname')}
      setUCPort={action('setUCPort')}
      setAddingPark={action('setAddingPark')}
      submitAddingPark={action('submitAddingPark')}
      removePark={action('removePark')}
    />
  ))
  .add('404', () => <UI back={action('back')} />);
