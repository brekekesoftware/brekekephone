import { isEmpty } from 'lodash'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'

import { ContactsCreateForm } from '#/components/ContactCreateForm'
import type { ContactInfo, Phonebook } from '#/stores/contactStore'
import { ctx } from '#/stores/ctx'
import { intl, intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'

@observer
export class PagePhonebookUpdate extends Component<{
  contact: Phonebook
}> {
  render() {
    return (
      <ContactsCreateForm
        onBack={ctx.nav.backToPageContactPhonebook}
        onSave={(p: ContactInfo, hasUnsavedChanges: boolean) => {
          if (ctx.pbx.client && ctx.auth.pbxState === 'success') {
            this.save(p, hasUnsavedChanges)
          }
        }}
        title={intl`Update Phonebook`}
        updatingPhonebook={this.props.contact}
      />
    )
  }

  @action save = (p: ContactInfo, hasUnsavedChanges: boolean) => {
    if (!hasUnsavedChanges) {
      ctx.nav.goToPageContactPhonebook()
      return
    }
    if (isEmpty(p)) {
      return
    }
    const phonebook = p.phonebook
    delete p.phonebook

    const contactUpdate = {
      id: this.props.contact.id,
      display_name: ctx.contact.getManagerContact(p.$lang)?.toDisplayName(p),
      phonebook,
      shared: !!this.props.contact?.shared,
      info: { ...p },
    } as Phonebook
    ctx.pbx
      .setContact(contactUpdate)
      .then(() => this.onSaveSuccess(contactUpdate))
      .catch(this.onSaveFailure)
  }
  onSaveSuccess = (phonebook: Phonebook) => {
    ctx.nav.goToPageContactPhonebook()
    ctx.contact.upsertPhonebook(phonebook)
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save the contact`,
      err,
    })
  }
}
