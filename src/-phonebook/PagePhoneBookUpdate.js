import set from 'lodash/set';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PageContactUpdate extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  render() {
    return (
      <ContactsCreateForm
        title="Update Contact"
        updatingPhoneBook={g.getQuery().contact}
        onBack={g.goToPhonebooksBrowse}
        onSave={p => {
          this.save(p);
          g.goToPhonebooksBrowse();
        }}
      />
    );
  }

  save = phonebook => {
    set(phonebook, `shared`, phonebook.shared !== `false`);
    const { pbx } = this.context;
    pbx
      .setContact(phonebook)
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure);
  };

  onSaveSuccess = () => {
    g.goToPhonebooksBrowse();
  };

  onSaveFailure = err => {
    console.error(err);
    g.showError({ message: `save the contact` });
  };
}

export default PageContactUpdate;
