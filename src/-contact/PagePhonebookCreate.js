import { observer } from 'mobx-react';
import React from 'react';

import pbx from '../api/pbx';
import g from '../global';
import contactStore from '../global/contactStore';
import ContactsCreateForm from './ContactCreateForm';

@observer
class PagePhonebookCreate extends React.Component {
  render() {
    return (
      <ContactsCreateForm
        book={this.props.book || ``}
        onBack={g.goToPageContactPhonebook}
        onSave={p => {
          this.save(p);
          g.goToPageContactPhonebook();
        }}
        title="New Phonebook"
      />
    );
  }

  save = phonebook => {
    pbx
      .setContact({
        ...phonebook,
      })
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure);
    contactStore.pushPhonebook(phonebook);
  };
  onSaveSuccess = () => {
    g.goToPageContactPhonebook();
  };
  onSaveFailure = err => {
    g.showError({ message: `save the contact`, err });
  };
}

export default PagePhonebookCreate;
