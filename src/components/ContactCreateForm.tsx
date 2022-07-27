import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { StyleSheet } from 'react-native'

import { contactStore, ItemPBForm, Phonebook2 } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { useForm } from '../utils/useForm'
import { useStore } from '../utils/useStore'
import { Layout } from './Layout'
import { RnText } from './RnText'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const genEmptyPhonebook = () => {
  return {
    firstName: '',
    lastName: '',
    workNumber: '',
    cellNumber: '',
    homeNumber: '',
    job: '',
    company: '',
    address: '',
    email: '',
    shared: false,
    phonebook: '',
    user: '',
    nickname: '',
    telExt: '',
    telOther: '',
    fax: '',
    emailWork: '',
    addressWork: '',
    url: '',
    notes: '',
  }
}
const css = StyleSheet.create({
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
  updatingPhonebook?: Phonebook2
  book?: string
  onBack: Function
  onSave: Function
  title: string
}> = observer(props => {
  const m = () => ({
    observable: {
      phonebook: {
        book: props.book || '',
        ...genEmptyPhonebook(),
        ...cloneDeep(props.updatingPhonebook),
      },
      fields: [] as ItemPBForm[],
    },

    hasUnsavedChanges: () => {
      const p = props.updatingPhonebook || genEmptyPhonebook()
      if (!props.updatingPhonebook) {
        Object.assign(p, {
          book: props.book,
        })
      }
      return !isEqual($.phonebook, p)
    },

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
  const disabled = props.updatingPhonebook?.shared
  const items = contactStore.getItemPB()?.filter(i => i?.onscreen)
  if (props.updatingPhonebook) {
    $.fields = Object.keys(props.updatingPhonebook).map(key => {
      return {
        id: key,
        name: key,
        label: key,
      }
    })
  } else {
    $.fields = [
      {
        id: 'book',
        name: 'book',
        label: intl`BOOK`,
        rule: 'required',
        isFocus: false,
      },
      ...items,
    ]
  }

  const onSelectItem = (value: string) => {
    contactStore.dismissPicker()
    const isExistField = !!$.fields.find(_ => _.label === value)
    if (isExistField) {
      return
    }
    const itemExist = contactStore.getItemPB().find(_ => _.label === value)
    if (itemExist) {
      $.fields.push(itemExist)
      return
    }
    const newField = {
      label: value,
      name: value,
      id: value,
      keyboardType: 'default',
    } as unknown as ItemPBForm
    $.fields.push(newField)
  }
  const openPicker = () => {
    contactStore.openPicker({
      onSelect: onSelectItem,
      listOption: contactStore.getItemPB().filter(i => !i?.onscreen),
    })
  }
  return (
    <Layout
      fabOnBack={$.onBackBtnPress}
      fabOnNext={disabled ? undefined : (submitForm as () => void)}
      onBack={$.onBackBtnPress}
      title={props.title}
    >
      <Form
        $={$}
        fields={$.fields}
        k='phonebook'
        onValidSubmit={$.onValidSubmit}
      />
      <RnTouchableOpacity style={css.styleAddItem} onPress={openPicker}>
        <RnText small style={css.labelAddItem}>
          {'>>' + intl`Add item`}
        </RnText>
      </RnTouchableOpacity>
    </Layout>
  )
})
