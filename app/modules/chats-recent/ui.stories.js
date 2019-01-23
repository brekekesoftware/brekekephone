import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

storiesOf(UI.name, module).add('normal', () => (
  <UI
    buddyIds={[1, 2, 3, 4]}
    buddyById={{
      1: {
        name: faker.name.findName(),
        avatar: { uri: faker.image.avatar() },
        online: true,
      },
      2: {
        name: faker.name.findName(),
        avatar: { uri: faker.image.avatar() },
        offline: true,
      },
      3: {
        name: faker.name.findName(),
        avatar: { uri: faker.image.avatar() },
        busy: true,
      },
      4: {
        name: faker.name.findName(),
        avatar: { uri: faker.image.avatar() },
        idle: true,
      },
    }}
    groupIds={[1, 2]}
    groupById={{
      1: {
        name: faker.name.jobArea(),
      },
      2: {
        name: faker.name.jobArea(),
      },
    }}
    selectBuddy={action('selectBuddy')}
    selectGroup={action('selectGroup')}
    createGroup={action('createGroup')}
  />
));
