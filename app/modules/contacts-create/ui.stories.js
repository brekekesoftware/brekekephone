import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import UI from './ui';

storiesOf(UI.name)
  .add('normal', () => (
    <UI
      setFirstName={action('setFirstName')}
      setLastName={action('setLastName')}
      setWorkNumber={action('setWorkNumber')}
      setCellNumber={action('setCellNumber')}
      setHomeNumber={action('setHomeNumber')}
      setJob={action('setJob')}
      setCompany={action('setCompany')}
      setAddress={action('setAddress')}
      setEmail={action('setEmail')}
      setBook={action('setBook')}
      save={action('save')}
      back={action('back')}
    />
  ))
  .add('editing', () => (
    <UI
      book={faker.address.state()}
      firstName={faker.name.firstName()}
      lastName={faker.name.lastName()}
      workNumber={faker.phone.phoneNumber()}
      cellNumber={faker.phone.phoneNumber()}
      homeNumber={faker.phone.phoneNumber()}
      job={faker.name.jobTitle()}
      company={faker.company.companyName()}
      address={faker.address.city()}
      email={faker.internet.email()}
      setFirstName={action('setFirstName')}
      setLastName={action('setLastName')}
      setWorkNumber={action('setWorkNumber')}
      setCellNumber={action('setCellNumber')}
      setHomeNumber={action('setHomeNumber')}
      setJob={action('setJob')}
      setCompany={action('setCompany')}
      setAddress={action('setAddress')}
      setEmail={action('setEmail')}
      setBook={action('setBook')}
      save={action('save')}
      back={action('back')}
    />
  ))
  .add('saving', () => (
    <UI
      saving
      book={faker.address.state()}
      firstName={faker.name.firstName()}
      lastName={faker.name.lastName()}
      workNumber={faker.phone.phoneNumber()}
      cellNumber={faker.phone.phoneNumber()}
      homeNumber={faker.phone.phoneNumber()}
      job={faker.name.jobTitle()}
      company={faker.company.companyName()}
      address={faker.address.city()}
      email={faker.internet.email()}
      setFirstName={action('setFirstName')}
      setLastName={action('setLastName')}
      setWorkNumber={action('setWorkNumber')}
      setCellNumber={action('setCellNumber')}
      setHomeNumber={action('setHomeNumber')}
      setJob={action('setJob')}
      setCompany={action('setCompany')}
      setAddress={action('setAddress')}
      setEmail={action('setEmail')}
      setBook={action('setBook')}
      save={action('save')}
      back={action('back')}
    />
  ));
