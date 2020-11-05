import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import ContactsCreateForm from '../components/ContactCreateForm'
import contactStore from '../stores/contactStore'
import intl, { intlDebug } from '../stores/intl'
import Nav from '../stores/Nav'
import RnAlert from '../stores/RnAlert'

@observer
class PagePhonebookUpdate extends React.Component<{
  contact: string
}> {
  render() {
    return (
      <ContactsCreateForm
        onBack={Nav().backToPageContactPhonebook}
        onSave={p => {
          this.save(p)
          Nav().goToPageContactPhonebook()
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
    Nav().goToPageContactPhonebook()
  }
  onSaveFailure = err => {
    RnAlert.error({
      message: intlDebug`Failed to save the contact`,
      err,
    })
  }
}

export default PagePhonebookUpdate
