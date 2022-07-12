import { observer } from 'mobx-react'
import { Component } from 'react'

import { pbx } from '../api/pbx'
import { ContactsCreateForm } from '../components/ContactCreateForm'
import { getAuthStore } from '../stores/authStore'
import { contactStore, Phonebook2 } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'

@observer
export class PagePhonebookUpdate extends Component<{
  contact: Phonebook2
}> {
  render() {
    return (
      <ContactsCreateForm
        onBack={Nav().backToPageContactPhonebook}
        onSave={(p: Phonebook2) => {
          if (pbx.client && getAuthStore().pbxState === 'success') {
            this.save(p)
          }
        }}
        title={intl`Update Phonebook`}
        updatingPhonebook={this.props.contact}
      />
    )
  }

  save = (phonebook: Phonebook2) => {
    const displayName = window.Brekeke.Phonebook.getManager(
      intlStore.locale,
    )?.toDisplayName(phonebook)
    Object.assign(phonebook, {
      name: displayName,
    })
    pbx
      .setContact(phonebook)
      .then(() => this.onSaveSuccess(phonebook))
      .catch(this.onSaveFailure)
  }
  onSaveSuccess = (phonebook: Phonebook2) => {
    contactStore.upsertPhonebook(phonebook)
    Nav().goToPageContactPhonebook()
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save the contact`,
      err,
    })
  }
}
