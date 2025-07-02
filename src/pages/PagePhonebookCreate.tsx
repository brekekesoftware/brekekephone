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
export class PagePhonebookCreate extends Component<{
  phonebook?: string
}> {
  render() {
    return (
      <ContactsCreateForm
        phonebook={this.props.phonebook}
        onBack={ctx.nav.backToPageContactPhonebook}
        onSave={(p: ContactInfo) => {
          if (ctx.pbx.client && ctx.auth.pbxState === 'success') {
            this.save(p)
          }
        }}
        title={intl`New Phonebook`}
      />
    )
  }

  @action save = (p: ContactInfo) => {
    if (isEmpty(p)) {
      return
    }
    const phonebook = p.phonebook
    delete p.phonebook
    const contact = {
      display_name: ctx.contact.getManagerContact(p.$lang)?.toDisplayName(p),
      phonebook,
      shared: false, // admin can't login on brekeke phone => share = false
      info: p,
    } as Phonebook

    ctx.pbx
      .setContact(contact)
      .then(val => {
        if (!val) {
          return
        }
        ctx.contact.upsertPhonebook(
          Object.assign(contact, {
            id: val.aid,
          }),
        )
      })
      .then(this.onSaveSuccess)
      .catch(this.onSaveFailure)
  }
  onSaveSuccess = () => {
    ctx.nav.goToPageContactPhonebook()
  }
  onSaveFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to save the contact`,
      err,
    })
  }
}
