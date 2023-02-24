import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { pbx } from '../api/pbx'
import { ContactsCreateForm } from '../components/ContactCreateForm'
import { getAuthStore } from '../stores/authStore'
import { ContactInfo, contactStore, Phonebook } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'

@observer
export class PagePhonebookCreate extends Component<{
  phonebook?: string
}> {
  render() {
    return (
      <ContactsCreateForm
        phonebook={this.props.phonebook}
        onBack={Nav().backToPageContactPhonebook}
        onSave={(p: ContactInfo) => {
          if (pbx.client && getAuthStore().pbxState === 'success') {
            this.save(p)
          }
        }}
        title={intl`New Phonebook`}
      />
    )
  }

  save = (p: ContactInfo) => {
    if (isEmpty(p)) {
      return
    }
    const phonebook = p.phonebook
    delete p.phonebook
    const contact = {
      display_name: contactStore.getManagerContact(p.$lang)?.toDisplayName(p),
      phonebook,
      shared: false, // admin can't login on brekeke phone => share = false
      info: p,
    } as Phonebook

    pbx
      .setContact(contact)
      .then(val => {
        if (!val) {
          return
        }
        contactStore.upsertPhonebook(
          Object.assign(contact, {
            id: val.aid,
          }),
        )
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
