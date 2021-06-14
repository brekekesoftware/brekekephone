import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import ContactsCreateForm from '../components/ContactCreateForm'
import contactStore, { Phonebook2 } from '../stores/contactStore'
import intl, { intlDebug } from '../stores/intl'
import Nav from '../stores/Nav'
import RnAlert from '../stores/RnAlert'

@observer
class PagePhonebookCreate extends React.Component<{
  book: string
}> {
  render() {
    return (
      <ContactsCreateForm
        book={this.props.book || ''}
        onBack={Nav().backToPageContactPhonebook}
        onSave={(p: Phonebook2) => {
          this.save(p)
          Nav().goToPageContactPhonebook()
        }}
        title={intl`New Phonebook`}
      />
    )
  }

  save = (phonebook: Phonebook2) => {
    pbx
      .setContact({
        ...phonebook,
      })
      .then(val => {
        if (!val) {
          return
        }
        phonebook = Object.assign(phonebook, {
          id: val.aid,
          name: `${phonebook.firstName} ${phonebook.lastName}`,
        })
        contactStore.upsertPhonebook(phonebook)
      })
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure)
  }
  onSaveSuccess = () => {
    Nav().goToPageContactPhonebook()
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save the contact`,
      err,
    })
  }
}

export default PagePhonebookCreate
