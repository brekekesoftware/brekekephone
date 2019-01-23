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
        transfering: faker.phone.phoneNumber(),
      }}
      back={action('back')}
      join={action('join')}
      stop={action('stop')}
    />
  ))
  .add('404', () => <UI back={action('back')} />);
