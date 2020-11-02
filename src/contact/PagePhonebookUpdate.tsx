import { observer } from 'mobx-react'
import React from 'react'

import pbx from '../api/pbx'
import contactStore from '../global/contactStore'
import Nav from '../global/Nav'
import RnAlert from '../global/RnAlert'
import intl, { intlDebug } from '../intl/intl'
import ContactsCreateForm from './ContactCreateForm'

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
