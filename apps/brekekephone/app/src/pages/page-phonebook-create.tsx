import { observer } from 'mobx-react'

import { isEmpty } from '@/shared/lodash'
import { ContactsCreateForm } from '#/components/contact-create-form'
import type { ContactInfo, Phonebook } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PagePhonebookCreate = observer((props: { phonebook?: string }) => {
  const save = (p: ContactInfo) => {
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
      .then(onSaveSuccess)
  }
  const onSaveSuccess = () => {
    ctx.nav.goToPageContactPhonebook()
  }
  return (
    <ContactsCreateForm
      phonebook={props.phonebook}
      onBack={ctx.nav.backToPageContactPhonebook}
      onSave={(p: ContactInfo) => {
        if (ctx.pbx.client && ctx.auth.pbxState === 'success') {
          save(p)
        }
      }}
      title={intl`New Phonebook`}
    />
  )
})
