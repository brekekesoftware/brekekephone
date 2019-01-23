import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import UI from './ui';

storiesOf(UI.name, module)
  .add('started', () => <UI abort={action('abort')} />)
  .add('failure', () => (
    <UI failure retryable retry={action('retry')} abort={action('abort')} />
  ))
  .add('not retryable', () => (
    <UI failure retry={action('retry')} abort={action('abort')} />
  ));
