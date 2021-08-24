import flow from 'lodash/flow'
import get from 'lodash/get'
import { observer } from 'mobx-react'
import React from 'react'
import { Platform } from 'react-native'
import Validator, { Rules } from 'validatorjs'

import Field from '../components/Field'
import { CreatedStore } from './createStore'
import { arrToMap, mapToMap } from './toMap'
import useStore from './useStore'

const noop = () => {}

const useForm = () => {
  const f0 = (
    $: CreatedStore & {
      dirtyMap: { [k: string]: boolean }
      errorMap: { [k: string]: string }
      props: {
        $: CreatedStore
        fields: FormField[]
        k: string
        onValidSubmit: Function
      }
      submit: Function
      onFieldBlur: Function
      onFieldChange: Function
    },
  ) => ({
    observable: {
      dirtyMap: {},
      errorMap: {},
    },
    props: {},
    onFieldBlur: (k: string) => {
      $.set(`dirtyMap.${k}`, true)
    },
    onFieldChange: (k: string, v: string) => {
      // TODO batch, remember k
      const rule = $.props.fields.find((f: FormField) => f.name === k)?.rule
      const validator = rule ? new Validator({ [k]: v }, { [k]: rule }) : null
      $.set(`errorMap.${k}`, validator?.fails() && validator.errors.first(k))
    },
    // Submit function to use outside of the hook
    submit: () => {
      const { $: $parent, fields, k, onValidSubmit } = $.props
      const rules = arrToMap(
        fields.filter((f: FormField) => f.rule && !f.disabled),
        (f: FormField) => f.name,
        (f: FormField) => f.rule,
      ) as { [k: string]: unknown }
      const validator = new Validator(get($parent, k), rules as Rules)
      if (validator.fails()) {
        $.set(
          'errorMap',
          mapToMap(rules, undefined, (_: string) => validator.errors.first(_)),
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
    // Form component
    render: observer((props: object) => {
      $.props = Object.assign($.props, props)
      const { $: $parent, fields, k } = $.props
      const RnForm = Platform.OS === 'web' ? 'form' : React.Fragment
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
                    !f.disabled && $.dirtyMap[f.name]
                      ? $.errorMap[f.name]
                      : undefined
                  }
                  onBlur={() => $.onFieldBlur(f.name)}
                  // Mark this field dirty
                  onValueChange={flow(
                    [
                      // Add change handler to trigger validate
                      // TODO update all flows to regular funcs
                      (v: string) => {
                        $.onFieldChange(f.name, v)
                        return v
                      },
                      // Default change handler from store
                      f.onValueChange === undefined
                        ? !f.disabled
                          ? (v: string) => $parent.set(k + '.' + f.name, v)
                          : noop
                        : (...args: unknown[]) => f.onValueChange(...args),
                    ].filter(_ => _),
                  )}
                  // Error
                  value={
                    // Default value from store
                    f.value === undefined
                      ? get($parent, k + '.' + f.name)
                      : f.value
                  }
                />
              ),
          )}
        </RnForm>
      )
    }),
  })
  const $ = useStore(f0) as unknown as FormContext
  return [$.render, $.submit, $.onFieldChange]
}

export default useForm

export type FormContext = {
  render: Function
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
