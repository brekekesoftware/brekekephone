import flow from 'lodash/flow';
import get from 'lodash/get';
import { observer } from 'mobx-react';
import React from 'react';
import Validator from 'validatorjs';

import { Platform } from '../native/Rn';
import Field from '../shared/Field';
import { arrToMap, mapToMap } from '../utils/toMap';
import useStore from './useStore';

const useForm = () => {
  const $ = useStore($ => ({
    observable: {
      dirtyMap: {},
      errorMap: {},
    },
    props: {},
    onFieldBlur: k => {
      $.set(`dirtyMap.${k}`, true);
    },
    onFieldChange: (k, v) => {
      // TODO batch, remember k
      const rule = $.props.fields.find(f => f.name === k)?.rule;
      const vl = rule && new Validator({ [k]: v }, { [k]: rule });
      $.set(`errorMap.${k}`, vl?.fails() && vl.errors.first(k));
    },
    // Submit function to use outside of the hook
    submit: () => {
      const { $: $parent, fields, k, onValidSubmit } = $.props;
      const rules = arrToMap(
        fields.filter(f => f.rule && !f.disabled),
        f => f.name,
        f => f.rule,
      );
      const vl = new Validator(get($parent, k), rules);
      if (vl.fails()) {
        $.set(
          `errorMap`,
          mapToMap(rules, null, k => vl.errors.first(k)),
        );
        // TODO show toast
      } else {
        $.set(`errorMap`, {});
        if (onValidSubmit) {
          onValidSubmit();
        }
      }
      $.set(
        `dirtyMap`,
        arrToMap(fields, f => f.name),
      );
    },
    // Form component
    render: observer(props => {
      $.props = props;
      const { $: $parent, fields, k } = $.props;
      const RnForm = Platform.OS === `web` ? `form` : React.Fragment;
      const formProps = Platform.OS === `web` ? { onSubmit: $.submit } : null;
      return (
        <RnForm {...formProps}>
          {fields.map((f, i) => (
            <Field
              key={i}
              {...f}
              error={!f.disabled && $.dirtyMap[f.name] && $.errorMap[f.name]}
              onBlur={() => $.onFieldBlur(f.name)}
              // Mark this field dirty
              onValueChange={flow(
                [
                  // Add change handler to trigger validate
                  // TODO update all flows to regular funcs
                  v => {
                    $.onFieldChange(f.name, v);
                    return v;
                  },
                  // Default change handler from store
                  f.onValueChange === undefined
                    ? !f.disabled && (v => $parent.set(k + `.` + f.name, v))
                    : f.onValueChange,
                ].filter(f => f),
              )}
              // Error
              value={
                // Default value from store
                f.value === undefined ? get($parent, k + `.` + f.name) : f.value
              }
            />
          ))}
        </RnForm>
      );
    }),
  }));
  return [$.render, $.submit, $.onFieldChange];
};

export default useForm;
