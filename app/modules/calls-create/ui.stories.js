import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

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

storiesOf(UI.name, module).add('normal', () => (
  <UI
    matchIds={Array.from(matches, (_, i) => i)}
    resolveMatch={id => matches[id]}
    setTarget={action('setTarget')}
    setVideo={action('setVideo')}
    selectMatch={action('selectMatch')}
    makeVoice={action('makeVoice')}
    back={action('back')}
  />
));
