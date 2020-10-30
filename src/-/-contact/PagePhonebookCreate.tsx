import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import g from '../global'
import Alert from '../global/Alert'
import contactStore from '../global/contactStore'
import intl, { intlDebug } from '../intl/intl'
import ContactsCreateForm from './ContactCreateForm'

@observer
class PagePhonebookCreate extends React.Component<{
  book: string
}> {
  render() {
    return (
      <ContactsCreateForm
        book={this.props.book || ''}
        onBack={g.backToPageContactPhonebook}
        onSave={p => {
          this.save(p)
          g.goToPageContactPhonebook()
        }}
        title={intl`New Phonebook`}
      />
    )
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
        })
        contactStore.upsertPhonebook(phonebook)
      })
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure)
  }
  onSaveSuccess = () => {
    g.goToPageContactPhonebook()
  }
  onSaveFailure = err => {
    Alert.showError({
      message: intlDebug`Failed to save the contact`,
      err,
    })
  }
}

export default PagePhonebookCreate
