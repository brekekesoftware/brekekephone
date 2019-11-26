import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PagePhoneBookCreate extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  render() {
    return (
      <ContactsCreateForm
        book={this.props.book || ``}
        onBack={g.goToContactsBrowse}
        onSave={p => {
          this.save(p);
          g.goToContactsBrowse();
        }}
        title="New Contact"
      />
    );
  }

  save = phonebook => {
    this.context.pbx
      .setContact({
        ...phonebook,
      })
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure);
  };

  onSaveSuccess = () => {
    g.goToContactsBrowse();
  };

  onSaveFailure = err => {
    console.error(err);
    g.showError({ message: `save the contact` });
  };
}

export default PagePhoneBookCreate;
