import React from 'react';
import { storiesOf } from '@storybook/react-native';
import faker from 'faker';
import UI from './ui';

const toasts = Array.from({ length: 5 }, () => ({
  message: faker.lorem.sentence(),
}));

storiesOf(UI.name, module).add('normal', () => (
  <UI
    toastIds={Array.from(toasts, (_, i) => i)}
    resolveToast={id => toasts[id]}
  />
));
