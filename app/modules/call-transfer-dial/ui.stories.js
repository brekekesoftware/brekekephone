import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const call = {
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
};

const matches = [
  {
    number: faker.phone.phoneNumber(),
    name: faker.name.findName(),
    calling: true,
  },
  {
    number: faker.phone.phoneNumber(),
    name: faker.name.findName(),
    ringing: true,
  },
  {
    number: faker.phone.phoneNumber(),
    name: faker.name.findName(),
    talking: true,
  },
  {
    number: faker.phone.phoneNumber(),
    name: faker.name.findName(),
    holding: true,
  },
  { number: faker.phone.phoneNumber(), name: faker.name.findName() },
];

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI
      attended
      call={call}
      matchIds={Array.from(matches, (_, i) => i)}
      resolveMatch={id => matches[id]}
      selectMatch={action('selectMatch')}
      back={action('back')}
      transfer={action('transfer')}
      setAttended={action('setAttended')}
      setTarget={action('setTarget')}
    />
  ))
  .add('404', () => <UI back={action('back')} />);
