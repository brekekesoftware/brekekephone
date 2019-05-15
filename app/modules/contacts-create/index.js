import { observer } from 'mobx-react/native';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

const mapGetter = getter => state => ({});

const mapAction = action => emit => ({
  showToast(message) {
    emit(action.toasts.create({ id: createId(), message }));
  },
});

@observer
class View extends Component {
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
      back={() => routerUtils.goToPhonebooksBrowse()}
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

  setBook = book => routerUtils.goToContactsCreate({ book });
  setFirstName = firstName => this.setState({ firstName });
  setLastName = lastName => this.setState({ lastName });
  setWorkNumber = workNumber => this.setState({ workNumber });
  setCellNumber = cellNumber => this.setState({ cellNumber });
  setHomeNumber = homeNumber => this.setState({ homeNumber });
  setJob = job => this.setState({ job });
  setCompany = company => this.setState({ company });
  setAddress = address => this.setState({ address });
  setEmail = email => this.setState({ email });

  save = () => {
    if (!routerUtils.getQuery().book) {
      this.props.showToast('The phonebook name is required');
      return;
    }
    if (!this.state.firstName) {
      this.props.showToast('The first name is required');
      return;
    }
    if (!this.state.lastName) {
      this.props.showToast('The last name is required');
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
    this.props.showToast('Failed to save the contact');
  };
}

export default createModelView(mapGetter, mapAction)(View);
