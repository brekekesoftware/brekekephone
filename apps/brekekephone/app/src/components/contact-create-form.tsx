import { observer } from 'mobx-react'
import type { FC } from 'react'

import { jsonStable } from '@/shared/json-stable'
import { cloneDeep } from '@/shared/lodash'
import { Layout } from '#/components/layout'
import { RnText } from '#/components/rn-text'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import type { ItemPBForm, Phonebook } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { toBooleanFalsy } from '#/utils/string'
import { useForm } from '#/utils/use-form'
import { useStore } from '#/utils/use-store'

const genEmptyPhonebook = (lang: string) => {
  const emptyObj = {}
  ctx.contact
    .getManageItems(lang)
    ?.filter(i => i?.onscreen)
    .forEach(u => {
      Object.assign(emptyObj, { [u.name]: '' })
    })
  return emptyObj
}

export const ContactsCreateForm: FC<{
  updatingPhonebook?: Phonebook
  phonebook?: string
  onBack: Function
  onSave: Function
  title: string
}> = observer(props => {
  const phonebookField = {
    id: 'phonebook',
    name: 'phonebook',
    label: intl`PHONEBOOK`,
    rule: 'required',
    isFocus: false,
    maxLength: 100,
  }
  const c = ctx.auth.pbxConfig
  const lang = props.updatingPhonebook?.info?.$lang || ctx.intl.locale
  const disabled =
    props.updatingPhonebook?.shared ||
    toBooleanFalsy(c?.['webphone.phonebook.personal.editable'])
  const defaultObj = {
    phonebook: props.updatingPhonebook?.phonebook || '',
    $lang: lang,
    ...genEmptyPhonebook(lang),
    ...cloneDeep(props.updatingPhonebook?.info),
  }

  // don't show field: $lang
  const getFields = () => {
    if (props.updatingPhonebook) {
      const fields = Object.keys(defaultObj)?.map(key => {
        if (key === 'phonebook') {
          return phonebookField
        }
        const item = ctx.contact.getManageItems(lang).find(_ => _.id === key)
        if (item) {
          return item
        }
        return {
          id: key,
          name: key,
          label: key,
          keyboardType: 'default',
          maxLength: 50,
        }
      })

      return (
        fields
          ?.filter(_ => _.label !== '$lang' || _.id !== '$lang')
          ?.filter(_ => _.id !== 'get')
          ?.map(i => ({ ...i, disabled })) || ([] as ItemPBForm[])
      )
    } else {
      const items = ctx.contact.getManageItems(lang)?.filter(i => i?.onscreen)
      return (
        ([phonebookField, ...items]?.filter(
          _ => _.label !== '$lang' || _.id !== '$lang',
        ) as ItemPBForm[]) || []
      )
    }
  }
  const m = () => ({
    observable: {
      phonebook: { ...defaultObj },
      fields: getFields() as ItemPBForm[],
    },
    hasUnsavedChanges: () => jsonStable($.phonebook) !== jsonStable(defaultObj),
    onBackBtnPress: () => {
      if (!$.hasUnsavedChanges()) {
        props.onBack()
        return
      }
      RnAlert.prompt({
        title: intl`Discard Changes`,
        message: intl`Do you want to discard all unsaved changes and go back?`,
        onConfirm: props.onBack,
        confirmText: intl`DISCARD`,
      })
    },

    onValidSubmit: () => {
      props.onSave($.phonebook, $.hasUnsavedChanges())
    },
  })
  type M0 = ReturnType<typeof m>
  type M = Omit<M0, 'observable'> & M0['observable']
  const $ = useStore(m) as any as M

  const [Form, submitForm] = useForm()

  const onSelectItem = (value: string) => {
    value.replace('$', '') // prevent key on manage.item in phonebook.js
    ctx.contact.dismissPicker()
    const isExistField = $.fields.some(_ => _.label === value || _.id === value)
    if (isExistField) {
      return
    }
    const itemExist = ctx.contact
      .getManageItems(lang)
      .find(_ => _.label === value || _.id === value)
    if (itemExist) {
      $.fields.push(itemExist)
      $.phonebook = { ...$.phonebook, [itemExist.id]: '' }
      return
    }
    const newField = {
      label: value,
      name: value,
      id: value,
      keyboardType: 'default',
      maxLength: 50,
    }
    $.fields.push(newField)
    $.phonebook = { ...$.phonebook, [newField.id]: '' }
  }
  const openPicker = () => {
    ctx.contact.openPicker({
      onSelect: onSelectItem,
      listOption: ctx.contact.getManageItems(lang).filter(i => !i?.onscreen),
    })
  }
  const previewName = ctx.contact
    .getManagerContact($.phonebook?.$lang)
    ?.toDisplayName($.phonebook)

  return (
    <Layout
      fabOnBack={$.onBackBtnPress}
      fabOnNext={disabled ? undefined : (submitForm as () => void)}
      onBack={$.onBackBtnPress}
      title={props.title}
    >
      {!disabled && (
        <RnText
          title
          className={[
            'mx-5',
            !previewName ? 'text-foreground-muted' : 'text-foreground',
          ]}
        >
          {previewName || intl`<Unnamed>`}
        </RnText>
      )}
      <Form
        $={$}
        fields={$.fields}
        k='phonebook'
        onValidSubmit={$.onValidSubmit}
      />
      {!disabled && (
        <RnTouchableOpacity className='mx-3.75 my-2.5' onPress={openPicker}>
          <RnText small normal className='text-foreground-muted'>
            {'>>' + intl`Add item`}
          </RnText>
        </RnTouchableOpacity>
      )}
    </Layout>
  )
})
