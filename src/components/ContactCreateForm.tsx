import jsonStableStringify from 'json-stable-stringify'
import { cloneDeep } from 'lodash'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { StyleSheet } from 'react-native'

import { getAuthStore } from '../stores/authStore'
import type { ItemPBForm, Phonebook } from '../stores/contactStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { RnAlert } from '../stores/RnAlert'
import { toBooleanFalsy } from '../utils/string'
import { useForm } from '../utils/useForm'
import { useStore } from '../utils/useStore'
import { Layout } from './Layout'
import { RnText } from './RnText'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const genEmptyPhonebook = (lang: string) => {
  const emptyObj = {}
  contactStore
    .getManageItems(lang)
    ?.filter(i => i?.onscreen)
    .forEach(u => {
      Object.assign(emptyObj, { [u.name]: '' })
    })
  return emptyObj
}
const css = StyleSheet.create({
  stylePreviewName: {
    marginHorizontal: 20,
  },
  styleAddItem: {
    marginVertical: 10,
    marginHorizontal: 15,
  },
  labelAddItem: {
    color: v.subColor,
    fontWeight: v.fontWeight,
  },
})

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
  const c = getAuthStore().pbxConfig
  const lang = props.updatingPhonebook?.info?.$lang || intlStore.locale
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
        const item = contactStore.getManageItems(lang).find(_ => _.id === key)
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
      const items = contactStore.getManageItems(lang)?.filter(i => i?.onscreen)
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
    hasUnsavedChanges: () =>
      !(jsonStableStringify($.phonebook) === jsonStableStringify(defaultObj)),

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
    contactStore.dismissPicker()
    const isExistField = $.fields.some(_ => _.label === value || _.id === value)
    if (isExistField) {
      return
    }
    const itemExist = contactStore
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
    contactStore.openPicker({
      onSelect: onSelectItem,
      listOption: contactStore.getManageItems(lang).filter(i => !i?.onscreen),
    })
  }
  const previewName = contactStore
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
          style={[
            css.stylePreviewName,
            { color: !previewName ? v.colors.greyTextChat : 'black' },
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
        <RnTouchableOpacity style={css.styleAddItem} onPress={openPicker}>
          <RnText small style={css.labelAddItem}>
            {'>>' + intl`Add item`}
          </RnText>
        </RnTouchableOpacity>
      )}
    </Layout>
  )
})
