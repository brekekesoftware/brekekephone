import { isEmpty } from '@rntwsc/shared/lodash'
import { observer } from 'mobx-react'

import { ContactsCreateForm } from '#/components/contact-create-form'
import type { ContactInfo, Phonebook } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

export const PagePhonebookUpdate = observer((props: { contact: Phonebook }) => {
  const save = (p: ContactInfo, hasUnsavedChanges: boolean) => {
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
      id: props.contact.id,
      display_name: ctx.contact.getManagerContact(p.$lang)?.toDisplayName(p),
      phonebook,
      shared: !!props.contact?.shared,
      info: {
        ...p,
      },
    } as Phonebook
    ctx.pbx.setContact(contactUpdate).then(() => onSaveSuccess(contactUpdate))
  }

  const onSaveSuccess = (phonebook: Phonebook) => {
    ctx.nav.goToPageContactPhonebook()
    ctx.contact.upsertPhonebook(phonebook)
  }

  return (
    <ContactsCreateForm
      onBack={ctx.nav.backToPageContactPhonebook}
      onSave={(p: ContactInfo, hasUnsavedChanges: boolean) => {
        if (ctx.pbx.client && ctx.auth.pbxState === 'success') {
          save(p, hasUnsavedChanges)
        }
      }}
      title={intl`Update Phonebook`}
      updatingPhonebook={props.contact}
    />
  )
})
