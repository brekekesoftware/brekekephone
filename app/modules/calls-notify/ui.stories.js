import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const calls = Array.from({ length: 5 }, () => ({
  partyName: faker.name.findName(),
  partyNumber: faker.phone.phoneNumber(),
}));

storiesOf(UI.name, module).add('normal', () => (
  <UI
    callIds={Object.keys(calls)}
    resolveCall={id => calls[id]}
    accept={action('accept')}
    reject={action('reject')}
  />
));
