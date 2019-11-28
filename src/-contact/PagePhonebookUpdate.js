import set from 'lodash/set';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import g from '../global';
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
        title="Update Contact"
        updatingPhoneBook={this.props.contact}
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
    g.goToPageContactPhonebook();
  };

  onSaveFailure = err => {
    console.error(err);
    g.showError({ message: `save the contact` });
  };
}

export default PagePhonebookUpdate;
