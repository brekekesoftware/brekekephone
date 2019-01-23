import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const users = {
  1: {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    callHolding: true,
    chatOffline: true,
    chatEnabled: true,
  },
  2: {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    callTalking: true,
    chatIdle: true,
    chatEnabled: true,
  },
  3: {
    name: faker.name.findName(),
    mood: faker.lorem.words(),
    avatar: { uri: faker.image.avatar() },
    chatOnline: true,
    chatEnabled: true,
  },
  4: {
    name: faker.name.findName(),
    avatar: { uri: faker.image.avatar() },
    chatBusy: true,
    chatEnabled: true,
  },
  5: {
    name: 'Vu Le',
    mood: 'https://www.youtube.com/watch?v=LlDVGcPLrnQ',
    avatar: { uri: faker.image.avatar() },
    callHolding: true,
    chatOffline: true,
    chatEnabled: true,
  },
};

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI
      userIds={[1, 2, 3, 4]}
      resolveUser={id => users[id]}
      callVoice={action('callVoice')}
      callVideo={action('callVideo')}
      chat={action('chat')}
      setSearchText={action('setSearchText')}
      browseBooks={action('browseBooks')}
    />
  ))
  .add('search', () => (
    <UI
      searchText="Vu"
      userIds={[5]}
      resolveUser={id => users[id]}
      callVoice={action('callVoice')}
      callVideo={action('callVideo')}
      chat={action('chat')}
      setSearchText={action('setSearchText')}
      browseBooks={action('browseBooks')}
    />
  ));
