import { isEqual } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import Layout from '../shared/Layout';
import useForm from '../utils/useForm';
import useStore from '../utils/useStore';

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
    shared: false,
  };
};

const ContactsCreateForm = observer(props => {
  const $ = useStore(() => ({
    observable: {
      phonebook: {
        book: props.book,
        ...genEmptyPhonebook(),
        ...cloneDeep(props.updatingPhonebook),
      },
    },

    hasUnsavedChanges: () => {
      const p = props.updatingPhonebook || genEmptyPhonebook();
      if (!props.updatingPhonebook) {
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
  const disabled = props.updatingPhonebook?.shared;
  return (
    <Layout
      onBack={$.onBackBtnPress}
      onFabBack={$.onBackBtnPress}
      onFabNext={disabled ? null : submitForm}
      title={props.title}
    >
      <Form
        $={$}
        fields={[
          {
            disabled,
            name: `book`,
            label: `BOOK`,
            rule: `required`,
          },
          {
            disabled,
            name: `firstName`,
            label: `FIRST NAME`,
            rule: `required`,
          },
          {
            disabled,
            name: `lastName`,
            label: `LAST NAME`,
            rule: `required`,
          },
          {
            disabled,
            keyboardType: `numeric`,
            name: `workNumber`,
            label: `WORD NUMBER`,
          },
          {
            disabled,
            keyboardType: `numeric`,
            name: `cellNumber`,
            label: `CELL PHONE`,
          },
          {
            disabled,
            keyboardType: `numeric`,
            name: `homeNumber`,
            label: `HOME NUMBER`,
          },
          {
            disabled,
            name: `job`,
            label: `JOB`,
          },
          {
            disabled,
            name: `company`,
            label: `COMPANY`,
          },
          {
            disabled,
            name: `address`,
            label: `ADDRESS`,
          },
          {
            disabled,
            name: `email`,
            label: `EMAIL`,
          },
          {
            disabled,
            type: `Switch`,
            name: `shared`,
            label: `SHARED`,
          },
        ]}
        k="phonebook"
        onValidSubmit={$.onValidSubmit}
      />
    </Layout>
  );
});

export default ContactsCreateForm;
