import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const buddies = [
  {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    online: true,
  },
  {
    name: faker.name.findName(),
    avatar: { uri: faker.image.avatar() },
    offline: true,
  },
  {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    busy: true,
  },
  {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    idle: true,
  },
  {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    idle: true,
  },
  {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    online: true,
  },
];

storiesOf(UI.name, module).add('normal', () => (
  <UI
    buddyIds={Object.keys(buddies)}
    buddyById={buddies}
    members={[1, 2, 6]}
    toggleBuddy={action('toggleBuddy')}
    setName={action('setName')}
  />
));
