import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import UI from './ui';

storiesOf(UI.name, module).add('default', () => (
  <UI pressCall={action('pressCall')} />
));
