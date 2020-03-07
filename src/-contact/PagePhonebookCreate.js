import { observer } from 'mobx-react';
import React from 'react';

import pbx from '../api/pbx';
import g from '../global';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PagePhonebookCreate extends React.Component {
  render() {
    return (
      <ContactsCreateForm
        book={this.props.book || ``}
        onBack={g.backToPageContactPhonebook}
        onSave={p => {
          this.save(p);
          g.goToPageContactPhonebook();
        }}
        title={intl`New Phonebook`}
      />
    );
  }

  save = phonebook => {
    pbx
      .setContact({
        ...phonebook,
      })
      .then(function(val) {
        const phoneBookId = { id: val.aid };
        const newPhoneBook = Object.assign(phonebook, phoneBookId);
        phonebook = Object.assign(phonebook, newPhoneBook);
      })
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure);
    contactStore.pushPhonebook(phonebook);
  };
  onSaveSuccess = () => {
    g.goToPageContactPhonebook();
  };
  onSaveFailure = err => {
    g.showError({
      message: intl`Failed to save the contact`,
      err,
    });
  };
}

export default PagePhonebookCreate;
