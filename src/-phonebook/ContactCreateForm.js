import { isEqual } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import Layout from '../shared/Layout';
import useForm from '../shared/useForm';
import useStore from '../shared/useStore';

const genEmptyPhonebook = () => {
  return {
    firstName: ``,
    lastName: ``,
    workNumber: ``,
    cellNumber: ``,
    homeNumber: ``,
    job: ``,
    company: ``,
    address: ``,
    email: ``,
  };
};

const ContactsCreateForm = observer(props => {
  const $ = useStore(() => ({
    observable: {
      phonebook: {
        book: props.book,
        ...genEmptyPhonebook(),
        ...cloneDeep(props.updatingPhoneBook),
      },
    },

    hasUnsavedChanges: () => {
      const p = props.updatingPhoneBook || genEmptyPhonebook();
      if (!props.updatingPhoneBook) {
        Object.assign(p, {
          book: props.book,
        });
      }
      return !isEqual($.phonebook, p);
    },

    onBackBtnPress: () => {
      if (!$.hasUnsavedChanges()) {
        props.onBack();
        return;
      }
      g.showPrompt({
        title: `Discard Changes`,
        message: `Do you want to discard all unsaved changes and go back?`,
        onConfirm: props.onBack,
        confirmText: `DISCARD`,
      });
    },

    onValidSubmit: () => {
      props.onSave($.phonebook, $.hasUnsavedChanges());
    },
    //
  }));
  const [Form, submitForm] = useForm();
  return (
    <Layout
      header={{
        onBackBtnPress: $.onBackBtnPress,
        title: props.title,
      }}
      footer={{
        actions: {
          onBackBtnPress: $.onBackBtnPress,
          onSaveBtnPress: submitForm,
        },
        PhoneBook: true,
      }}
    >
      <Form
        $={$}
        k="phonebook"
        onValidSubmit={$.onValidSubmit}
        fields={[
          {
            name: `book`,
            label: `BOOK`,
            rule: `required`,
          },
          {
            name: `firstName`,
            label: `FIRST NAME`,
            rule: `required`,
          },
          {
            name: `lastName`,
            label: `LAST NAME`,
            rule: `required`,
          },
          {
            keyboardType: `numeric`,
            name: `workNumber`,
            label: `WORD NUMBER`,
          },
          {
            keyboardType: `numeric`,
            name: `cellNumber`,
            label: `CELL PHONE`,
          },
          {
            keyboardType: `numeric`,
            name: `homeNumber`,
            label: `HOME NUMBER`,
          },
          {
            name: `job`,
            label: `JOB`,
          },
          {
            name: `company`,
            label: `HOME NUMBER`,
          },
          {
            name: `address`,
            label: `ADDRESS`,
          },
          {
            name: `email`,
            label: `EMAIL`,
          },
        ]}
      />
    </Layout>
  );
});

export default ContactsCreateForm;
