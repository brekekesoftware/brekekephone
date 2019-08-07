import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import * as routerUtils from '../../mobx/routerStore';
import toast from '../../nativeModules/toast';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  state = {
    saving: false,
    firtName: '',
    lastName: '',
    workNumber: '',
    cellNumber: '',
    homeNumber: '',
    job: '',
    company: '',
    address: '',
    email: '',
  };

  render = () => (
    <UI
      book={routerUtils.getQuery().book || ''}
      firstName={this.state.firstName}
      lastName={this.state.lastName}
      workNumber={this.state.workNumber}
      cellNumber={this.state.cellNumber}
      homeNumber={this.state.homeNumber}
      job={this.state.job}
      company={this.state.company}
      address={this.state.address}
      email={this.state.email}
      back={routerUtils.goToPhonebooksBrowse}
      save={this.save}
      setBook={this.setBook}
      setFirstName={this.setFirstName}
      setLastName={this.setLastName}
      setWorkNumber={this.setWorkNumber}
      setCellNumber={this.setCellNumber}
      setHomeNumber={this.setHomeNumber}
      setJob={this.setJob}
      setCompany={this.setCompany}
      setAddress={this.setAddress}
      setEmail={this.setEmail}
    />
  );

  setBook = book =>
    routerUtils.goToContactsCreate({
      book,
    });

  setFirstName = firstName =>
    this.setState({
      firstName,
    });

  setLastName = lastName =>
    this.setState({
      lastName,
    });

  setWorkNumber = workNumber =>
    this.setState({
      workNumber,
    });

  setCellNumber = cellNumber =>
    this.setState({
      cellNumber,
    });

  setHomeNumber = homeNumber =>
    this.setState({
      homeNumber,
    });

  setJob = job =>
    this.setState({
      job,
    });

  setCompany = company =>
    this.setState({
      company,
    });

  setAddress = address =>
    this.setState({
      address,
    });

  setEmail = email =>
    this.setState({
      email,
    });

  save = () => {
    if (!routerUtils.getQuery().book) {
      toast.error('The phonebook name is required');
      return;
    }

    if (!this.state.firstName) {
      toast.error('The first name is required');
      return;
    }

    if (!this.state.lastName) {
      toast.error('The last name is required');
      return;
    }

    this.context.pbx
      .setContact({
        book: routerUtils.getQuery().book,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        workNumber: this.state.workNumber,
        cellNumber: this.state.cellNumber,
        homeNumber: this.state.homeNumber,
        job: this.state.job,
        company: this.state.company,
        address: this.state.address,
        email: this.state.email,
      })
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure);
  };

  onSaveSuccess = () => {
    routerUtils.goToPhonebooksBrowse();
  };

  onSaveFailure = err => {
    console.error(err);
    toast.error('Failed to save the contact');
  };
}

export default View;
