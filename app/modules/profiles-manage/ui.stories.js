import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const profiles = [
  {
    pbxHostname: faker.internet.domainName(),
    pbxPort: faker.random.number(),
    pbxTenant: faker.address.stateAbbr(),
    pbxUsername: '1001',
  },
  {
    pbxHostname: faker.internet.domainName(),
    pbxPort: faker.random.number(),
    pbxTenant: faker.address.stateAbbr(),
    pbxUsername: '1002',
  },
  {
    pbxHostname: faker.internet.domainName(),
    pbxPort: faker.random.number(),
    pbxTenant: faker.address.stateAbbr(),
    pbxUsername: '1002',
  },
];

storiesOf(UI.name, module).add('normal', () => (
  <UI
    profileIds={Array.from(profiles, (_, i) => i)}
    resolveProfile={id => profiles[id]}
    create={action('create')}
    remove={action('remove')}
    update={action('update')}
    signin={action('signin')}
  />
));
