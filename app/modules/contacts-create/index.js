import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createModelView } from '@thenewvu/redux-model';
import createID from 'shortid';
import UI from './ui';

const mapGetter = getter => state => ({
  book: getter.router.getQuery(state).book,
});

const mapAction = action => emit => ({
  routeBack() {
    emit(action.router.goBack());
  },
  showToast(message) {
    emit(action.toasts.create({ id: createID(), message }));
  },
});

class View extends Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  state = {
    saving: false,
    book: this.props.book || '',
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
      book={this.state.book}
      firstName={this.state.firstName}
      lastName={this.state.lastName}
      workNumber={this.state.workNumber}
      cellNumber={this.state.cellNumber}
      homeNumber={this.state.homeNumber}
      job={this.state.job}
      company={this.state.company}
      address={this.state.address}
      email={this.state.email}
      back={this.props.routeBack}
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

  setBook = book => this.setState({ book });
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
    if (!this.state.book) {
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

    const { pbx } = this.context;

    const contact = {
      book: this.state.book,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      workNumber: this.state.workNumber,
      cellNumber: this.state.cellNumber,
      homeNumber: this.state.homeNumber,
      job: this.state.job,
      company: this.state.company,
      address: this.state.address,
      email: this.state.email,
    };

    pbx
      .setContact(contact)
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure);
  };

  onSaveSuccess = () => {
    this.props.routeBack();
  };

  onSaveFailure = err => {
    console.error(err);
    this.props.showToast('Failed to save the contact');
  };
}

export default createModelView(mapGetter, mapAction)(View);
