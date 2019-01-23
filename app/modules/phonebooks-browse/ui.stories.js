import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const books = [
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
  { name: faker.address.state(), shared: faker.random.boolean() },
];

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI books={books} back={action('back')} selectBook={action('selectBook')} />
  ))
  .add('empty', () => <UI books={[]} back={action('back')} />)
  .add('loading', () => <UI loading books={[]} back={action('back')} />);
