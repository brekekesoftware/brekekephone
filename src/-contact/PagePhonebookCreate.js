import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import contactStore from '../-/contactStore';
import g from '../global';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PagePhonebookCreate extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  render() {
    return (
      <ContactsCreateForm
        book={this.props.book || ``}
        onBack={g.goToPageContactPhonebook}
        onSave={p => {
          this.save(p);
          g.goToPageContactPhonebook();
        }}
        title="New PhoneBook"
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

    contactStore.pushPhoneBook(phonebook);
  };

  onSaveSuccess = contact => {
    g.goToPageContactPhonebook();
  };

  onSaveFailure = err => {
    console.error(err);
    g.showError({ message: `save the contact` });
  };
}

export default PagePhonebookCreate;
