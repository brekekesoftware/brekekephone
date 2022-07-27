import { observer } from 'mobx-react'
import { Component } from 'react'

import { pbx } from '../api/pbx'
import { ContactsCreateForm } from '../components/ContactCreateForm'
import { getAuthStore } from '../stores/authStore'
import { contactStore, Phonebook2 } from '../stores/contactStore'
import { intl, intlDebug } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'

@observer
export class PagePhonebookCreate extends Component<{
  book?: string
}> {
  render() {
    return (
      <ContactsCreateForm
        book={this.props.book}
        onBack={Nav().backToPageContactPhonebook}
        onSave={(p: Phonebook2) => {
          if (pbx.client && getAuthStore().pbxState === 'success') {
            this.save(p as unknown as { [k: string]: string })
          }
        }}
        title={intl`New Phonebook`}
      />
    )
  }

  save = (phonebook: { [k: string]: string }) => {
    pbx
      .setContact(contactStore.renameKeys(phonebook))
      .then(val => {
        if (!val) {
          return
        }
        phonebook = Object.assign(phonebook, {
          id: val.aid,
        })
        contactStore.upsertPhonebook(phonebook as unknown as Phonebook2)
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
