import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { pbx } from '../api/pbx'
import { ContactsCreateForm } from '../components/ContactCreateForm'
import { getAuthStore } from '../stores/authStore'
import { ContactInfo, contactStore, Phonebook2 } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
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
        onSave={(p: ContactInfo, hasUnsavedChanges: boolean) => {
          if (pbx.client && getAuthStore().pbxState === 'success') {
            this.save(p, hasUnsavedChanges)
          }
        }}
        title={intl`Update Phonebook`}
        updatingPhonebook={this.props.contact}
      />
    )
  }

  save = (p: ContactInfo, hasUnsavedChanges: boolean) => {
    if (!hasUnsavedChanges) {
      Nav().goToPageContactPhonebook()
      return
    }
    if (isEmpty(p)) {
      return
    }
    const phonebook = p.phonebook
    delete p.phonebook

    const contactUpdate = {
      id: this.props.contact.id,
      display_name: contactStore.getManagerContact(p.$lang)?.toDisplayName(p),
      phonebook,
      shared: !!this.props.contact?.shared,
      info: { ...p },
    } as Phonebook2
    pbx
      .setContact(contactUpdate)
      .then(() => this.onSaveSuccess(contactUpdate))
      .catch(this.onSaveFailure)
  }
  onSaveSuccess = (phonebook: Phonebook2) => {
    Nav().goToPageContactPhonebook()
    contactStore.upsertPhonebook(phonebook)
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save the contact`,
      err,
    })
  }
}
