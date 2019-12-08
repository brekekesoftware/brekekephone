import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import contactStore from '../global/contactStore';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PagePhonebookUpdate extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  render() {
    return (
      <ContactsCreateForm
        onBack={g.goToPageContactPhonebook}
        onSave={p => {
          this.save(p);
          g.goToPageContactPhonebook();
        }}
        title="Update Phonebook"
        updatingPhonebook={this.props.contact}
      />
    );
  }

  save = phonebook => {
    const { pbx } = this.context;
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
    console.error(err);
    g.showError({ message: `save the contact` });
  };
}

export default PagePhonebookUpdate;
