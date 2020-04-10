import { observer } from 'mobx-react';
import React from 'react';

import pbx from '../api/pbx';
import g from '../global';
import contactStore from '../global/contactStore';
import intl, { intlDebug } from '../intl/intl';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PagePhonebookCreate extends React.Component {
  render() {
    return (
      <ContactsCreateForm
        book={this.props.book || ''}
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
      .then(val => {
        phonebook = Object.assign(phonebook, {
          id: val.aid,
          name: `${phonebook.firstName} ${phonebook.lastName}`,
        });
        contactStore.pushPhonebook(phonebook);
      })
      .then(this.onSaveSuccess())
      .catch(this.onSaveFailure);
  };
  onSaveSuccess = () => {
    g.goToPageContactPhonebook();
  };
  onSaveFailure = err => {
    g.showError({
      message: intlDebug`Failed to save the contact`,
      err,
    });
  };
}

export default PagePhonebookCreate;
