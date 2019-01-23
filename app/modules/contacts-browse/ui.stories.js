import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

const contacts = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  name: faker.name.findName(),
  workNumber: faker.random.boolean() ? faker.phone.phoneNumber() : '',
  homeNumber: faker.random.boolean() ? faker.phone.phoneNumber() : '',
  cellNumber: faker.random.boolean() ? faker.phone.phoneNumber() : '',
  address: faker.random.boolean() ? faker.address.city() : '',
  company: faker.random.boolean() ? faker.company.companyName() : '',
  email: faker.random.boolean() ? faker.internet.email() : '',
  job: faker.random.boolean() ? faker.name.jobTitle() : '',
}));

storiesOf(UI.name, module)
  .add('normal', () => (
    <UI
      hasNextPage
      hasPrevPage
      book={faker.address.state()}
      contactIds={Object.keys(contacts)}
      resolveContact={id => ({
        ...contacts[id],
        editing: id === '1',
        loading: id === '2',
      })}
      editContact={action('editContact')}
      setContactFirstName={action('setContactFirstName')}
      setContactLastName={action('setContactLastName')}
      setContactJob={action('setContactJob')}
      setContactCompany={action('setContactCompany')}
      setContactAddress={action('setContactAddress')}
      setContactWorkNumber={action('setContactWorkNumber')}
      setContactCellNumber={action('setContactCellNumber')}
      setContactHomeNumber={action('setContactHomeNumber')}
      setContactEmail={action('setContactEmail')}
      saveContact={action('saveContact')}
      back={action('back')}
      goNextPage={action('goNextPage')}
      goPrevPage={action('goPrevPage')}
      setSearchText={action('setSearchText')}
      call={action('call')}
    />
  ))
  .add('empty', () => (
    <UI
      book={faker.address.state()}
      shared={faker.random.boolean()}
      contactIds={[]}
      back={action('back')}
    />
  ))
  .add('loading', () => (
    <UI
      loading
      book={faker.address.state()}
      shared={faker.random.boolean()}
      contactIds={[]}
      back={action('back')}
    />
  ))
  .add('not editable if shared', () => (
    <UI
      shared
      hasNextPage
      hasPrevPage
      book={faker.address.state()}
      contactIds={Object.keys(contacts)}
      resolveContact={id => contacts[id]}
      back={action('back')}
      goNextPage={action('goNextPage')}
      goPrevPage={action('goPrevPage')}
      setSearchText={action('setSearchText')}
      call={action('call')}
    />
  ));
