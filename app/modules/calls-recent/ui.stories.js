import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const calls = [
  {
    incoming: true,
    answered: true,
    partyName: faker.name.findName(),
    partyNumber: faker.phone.phoneNumber(),
    created: faker.date.recent(),
  },
  {
    partyName: faker.name.findName(),
    partyNumber: faker.phone.phoneNumber(),
    created: faker.date.recent(),
  },
  {
    incoming: true,
    partyName: faker.name.findName(),
    partyNumber: faker.phone.phoneNumber(),
    created: faker.date.recent(),
  },
  {
    incoming: true,
    answered: true,
    partyName: faker.name.findName(),
    partyNumber: faker.phone.phoneNumber(),
    created: faker.date.recent(),
  },
  {
    partyName: faker.name.findName(),
    partyNumber: faker.phone.phoneNumber(),
    created: faker.date.recent(),
  },
];

storiesOf(UI.name, module).add('normal', () => (
  <UI
    callIds={Array.from(calls, (_, i) => i)}
    resolveCall={id => calls[id]}
    callBack={action('callBack')}
    back={action('back')}
    removeCall={action('removeCall')}
  />
));
