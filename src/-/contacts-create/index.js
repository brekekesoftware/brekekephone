import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import routerStore from '../../---shared/routerStore';
import Toast from '../../---shared/Toast';
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

  render() {
    return (
      <UI
        book={routerStore.getQuery().book || ''}
        firstName={this.state.firstName}
        lastName={this.state.lastName}
        workNumber={this.state.workNumber}
        cellNumber={this.state.cellNumber}
        homeNumber={this.state.homeNumber}
        job={this.state.job}
        company={this.state.company}
        address={this.state.address}
        email={this.state.email}
        back={routerStore.goToPhonebooksBrowse}
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
  }

  setBook = book =>
    routerStore.goToContactsCreate({
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
    if (!routerStore.getQuery().book) {
      Toast.error('The phonebook name is required');
      return;
    }

    if (!this.state.firstName) {
      Toast.error('The first name is required');
      return;
    }

    if (!this.state.lastName) {
      Toast.error('The last name is required');
      return;
    }

    this.context.pbx
      .setContact({
        book: routerStore.getQuery().book,
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
    routerStore.goToPhonebooksBrowse();
  };

  onSaveFailure = err => {
    console.error(err);
    Toast.error('Failed to save the contact');
  };
}

export default View;
