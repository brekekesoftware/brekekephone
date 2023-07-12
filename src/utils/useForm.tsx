import { flow, get } from 'lodash'
import { observer } from 'mobx-react'
import { Fragment } from 'react'
import { Platform } from 'react-native'
import Validator, { Rules } from 'validatorjs'

import { PbxBook } from '../brekekejs'
import { Field } from '../components/Field'
import { PhonebookAutoComplete } from '../components/PhonebookAutoComplete'
import { arrToMap } from './arrToMap'
import { CreatedStore } from './createStore'
import { useStore } from './useStore'

const noop = () => {}

export const useForm = () => {
  const f0 = (
    $: CreatedStore & {
      dirtyMap: { [k: string]: boolean }
      errorMap: { [k: string]: string }
      currentFocus: string | undefined
      props: {
        $: CreatedStore
        fields: FormField[]
        k: string
        onValidSubmit: Function
      }
      submit: Function
      onFieldBlur: Function
      onFieldChange: Function
      onFocus: Function
    },
  ) => ({
    observable: {
      dirtyMap: {},
      errorMap: {},
      currentFocus: undefined,
    },
    props: {},
    onFieldBlur: (k: string) => {
      $.set(`dirtyMap.${k}`, true)
      // $.set('currentFocus', undefined)
    },
    onFocus: (k: string) => {
      $.set('currentFocus', k)
    },
    onFieldChange: (k: string, v: string) => {
      // TODO batch, remember k
      const rule = $.props.fields.find((f: FormField) => f.name === k)?.rule
      const validator = rule ? new Validator({ [k]: v }, { [k]: rule }) : null
      $.set(`errorMap.${k}`, validator?.fails() && validator.errors.first(k))
    },
    // submit function to use outside of the hook
    submit: () => {
      const { $: $parent, fields, k, onValidSubmit } = $.props
      const rules = arrToMap(
        fields.filter((f: FormField) => f.rule && !f.disabled && !f.hidden),
        (f: FormField) => f.name,
        (f: FormField) => f.rule,
      ) as { [k: string]: unknown }
      const validator = new Validator(get($parent, k), rules as Rules)
      if (validator.fails()) {
        $.set(
          'errorMap',
          arrToMap(
            Object.keys(rules),
            _ => _,
            _ => validator.errors.first(_),
          ),
        )
        // TODO show toast
      } else {
        $.set('errorMap', {})
        if (onValidSubmit) {
          onValidSubmit()
        }
      }
      $.set(
        'dirtyMap',
        arrToMap(fields, (f: FormField) => f.name),
      )
    },
    // form component
    render: observer((props: object) => {
      $.props = Object.assign($.props, props)
      const { $: $parent, fields, k } = $.props
      const RnForm = Platform.OS === 'web' ? 'form' : Fragment
      const formProps = Platform.OS === 'web' ? { onSubmit: $.submit } : null
      return (
        <RnForm {...(formProps as object)}>
          {fields.map(
            (f: FormField, i: number) =>
              !f.hidden && (
                <Field
                  key={i}
                  {...f}
                  error={
                    !f.disabled &&
                    $.dirtyMap[f.name] &&
                    $.currentFocus !== f.name
                      ? $.errorMap[f.name]
                      : undefined
                  }
                  onBlur={() => $.onFieldBlur(f.name)}
                  // mark this field dirty
                  onValueChange={flow(
                    [
                      // add change handler to trigger validate
                      // TODO update all flows to regular funcs
                      (v: string) => {
                        $.onFieldChange(f.name, v)
                        return v
                      },
                      // default change handler from store
                      f.onValueChange === undefined
                        ? !f.disabled
                          ? (v: string) => $parent.set(k + '.' + f.name, v)
                          : noop
                        : (...args: unknown[]) => f.onValueChange(...args),
                    ].filter(_ => _),
                  )}
                  onFocus={() => $.onFocus(f.name)}
                  // error
                  value={
                    // default value from store
                    f.value === undefined
                      ? get($parent, k + '.' + f.name)
                      : f.value
                  }
                />
              ),
          )}
          {k === 'phonebook' && $.currentFocus === 'phonebook' && (
            <PhonebookAutoComplete
              value={get($parent, k + '.phonebook')}
              onPressItem={(item: PbxBook) => {
                $parent.set(k + '.phonebook', item.phonebook)
                $.onFieldChange('phonebook', item.phonebook)
              }}
            />
          )}
        </RnForm>
      )
    }),
  })
  const $ = useStore(f0) as any as FormContext
  return [$.render, $.submit, $.onFieldChange]
}

export type FormContext = {
  render: any
  submit(): void
  onFieldChange(f: string, v: string): void
}
export type FormField = {
  name: string
  disabled: boolean
  value: string
  onValueChange: Function
  rule: string
  hidden?: boolean
}
