import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { observer } from 'mobx-react'
import React from 'react'

import RnAlert from '../global/RnAlert'
import intl from '../intl/intl'
import Layout from '../shared/Layout'
import useForm from '../utils/useForm'
import useStore from '../utils/useStore'

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
  }
}

const ContactsCreateForm = observer(props => {
  const m = () => ({
    observable: {
      phonebook: {
        book: props.book,
        ...genEmptyPhonebook(),
        ...cloneDeep(props.updatingPhonebook),
      },
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
    //
  })
  type M0 = ReturnType<typeof m>
  type M = Omit<M0, 'observable'> & M0['observable']
  const $ = (useStore(m) as any) as M

  const [Form, submitForm] = useForm()
  const disabled = props.updatingPhonebook?.shared
  return (
    <Layout
      fabOnBack={$.onBackBtnPress}
      fabOnNext={disabled ? null : submitForm}
      onBack={$.onBackBtnPress}
      title={props.title}
    >
      <Form
        $={$}
        fields={[
          {
            disabled,
            name: 'book',
            label: intl`BOOK`,
            rule: 'required',
          },
          {
            disabled,
            name: 'firstName',
            label: intl`FIRST NAME`,
            rule: 'required',
          },
          {
            disabled,
            name: 'lastName',
            label: intl`LAST NAME`,
            rule: 'required',
          },
          {
            disabled,
            keyboardType: 'numeric',
            name: 'cellNumber',
            label: intl`MOBILE NUMBER`,
          },
          {
            disabled,
            keyboardType: 'numeric',
            name: 'workNumber',
            label: intl`WORK NUMBER`,
          },
          {
            disabled,
            keyboardType: 'numeric',
            name: 'homeNumber',
            label: intl`HOME NUMBER`,
          },
          {
            disabled,
            name: 'job',
            label: intl`JOB`,
          },
          {
            disabled,
            name: 'company',
            label: intl`COMPANY`,
          },
          {
            disabled,
            name: 'address',
            label: intl`ADDRESS`,
          },
          {
            disabled,
            name: 'email',
            label: intl`EMAIL`,
          },
          {
            disabled,
            type: 'Switch',
            name: 'shared',
            label: intl`SHARED`,
          },
        ]}
        k='phonebook'
        onValidSubmit={$.onValidSubmit}
      />
    </Layout>
  )
})

export default ContactsCreateForm
