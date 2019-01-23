import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI
      call={{
        partyName: faker.name.findName(),
        partyNumber: faker.phone.phoneNumber(),
      }}
      sendKey={action('sendKey')}
      back={action('back')}
    />
  ))
  .add('404', () => <UI back={action('back')} />);
