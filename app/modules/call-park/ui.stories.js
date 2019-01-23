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
      parks={[12001, 12002, 12003]}
      selectedPark={12001}
      selectPark={action('selectPark')}
      park={action('park')}
      back={action('back')}
    />
  ))
  .add('404', () => <UI back={action('back')} />);
