import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const groups = Array.from({ length: 5 }, () => ({
  name: faker.commerce.department(),
  inviter: faker.name.findName(),
}));

storiesOf(UI.name, module).add('normal', () => (
  <UI
    groups={[1, 2, 3, 4]}
    formatGroup={group => groups[group]}
    accept={action('accept')}
    reject={action('reject')}
  />
));
