import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import g from '../global'
import Alert from '../global/Alert'
import contactStore from '../global/contactStore'
import intl, { intlDebug } from '../intl/intl'
import ContactsCreateForm from './ContactCreateForm'

@observer
class PagePhonebookUpdate extends React.Component<{
  contact: string
}> {
  render() {
    return (
      <ContactsCreateForm
        onBack={g.backToPageContactPhonebook}
        onSave={p => {
          this.save(p)
          g.goToPageContactPhonebook()
        }}
        title={intl`Update Phonebook`}
        updatingPhonebook={this.props.contact}
      />
    )
  }

  save = phonebook => {
    pbx.setContact(phonebook).then(this.onSaveSuccess).catch(this.onSaveFailure)
    Object.assign(phonebook, {
      name: `${phonebook.firstName} ${phonebook.lastName}`,
    })
    contactStore.upsertPhonebook(phonebook)
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

export default PagePhonebookUpdate
