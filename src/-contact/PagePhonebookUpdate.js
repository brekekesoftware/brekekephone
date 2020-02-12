import { observer } from 'mobx-react';
import React from 'react';

import pbx from '../api/pbx';
import g from '../global';
import contactStore from '../global/contactStore';
import intl from '../intl/intl';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PagePhonebookUpdate extends React.Component {
  render() {
    return (
      <ContactsCreateForm
        onBack={g.backToPageContactPhonebook}
        onSave={p => {
          this.save(p);
          g.goToPageContactPhonebook();
        }}
        title={intl`Update Phonebook`}
        updatingPhonebook={this.props.contact}
      />
    );
  }

  save = phonebook => {
    pbx
      .setContact(phonebook)
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure);
    contactStore.updatePhonebook(phonebook);
  };
  onSaveSuccess = () => {
    g.goToPageContactPhonebook();
  };
  onSaveFailure = err => {
    g.showError({ message: intl`Failed to save the contact`, err });
  };
}

export default PagePhonebookUpdate;
