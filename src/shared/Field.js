import { mdiClose, mdiPlus } from '@mdi/js';
import omit from 'lodash/omit';
import React from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from '../shared/Icon';
import v from '../variables';

const s = StyleSheet.create({
  Field: {
    position: 'relative',
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: v.brekekeShade2,
  },
  Field__disabled: {
    backgroundColor: v.brekekeShade0,
  },
  Field_Inner: {
    position: 'static',
  },
  Field_Name: {
    position: 'relative',
    fontSize: v.fontSizeSmall,
    color: v.brekekeShade6,
  },
  Field_Value: {
    position: 'relative',
    fontWeight: 'bold',
  },
  Field_Switch: {
    position: 'absolute',
    top: 22,
    right: 5,
  },
  Field_Btn: {
    position: 'absolute',
    top: 15,
    right: 5,
    width: 40,
    height: 30,
    borderRadius: v.borderRadius,
  },
  Field_Btn__create: {
    backgroundColor: v.fn.transparentize(0.9, v.brekekeGreen),
  },
  Field_Btn__remove: {
    backgroundColor: v.fn.transparentize(0.9, v.brekekeRed),
  },
  Field_Icon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  Field_TextInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    paddingTop: 28,
    paddingBottom: 5,
    paddingLeft: 7,
    paddingRight: 40,
    fontWeight: 'bold',
    fontSize: v.fontSize,
    fontFamily: 'inherit',
  },
  Field_TextInputFocusing: {
    backgroundColor: v.fn.transparentize(0.9, v.brekekeGreen),
  },
});

const TextInputWithFocusStyle = React.forwardRef((p, ref) => {
  const [focusing, setFocusing] = React.useState(false);
  return (
    <TextInput
      {...p}
      style={[p.style, focusing && s.Field_TextInputFocusing]}
      onFocus={() => setFocusing(true)}
      onBlur={() => setFocusing(false)}
    />
  );
});

const defaultValueRender = {
  Switch: v => (v ? 'Enabled' : 'Disabled'),
};
const defaultIconRender = {
  Switch: v => <Switch style={s.Field_Switch} pointerEvents="none" value={v} />,
};

const renderField = p => {
  const valueRender = p.valueRender || defaultValueRender[p.type];
  const iconRender = p.iconRender || defaultIconRender[p.type];
  return (
    <View style={[s.Field, p.disabled && s.Field__disabled]}>
      <View style={s.Field_Inner} pointerEvents={p.disabled && 'none'}>
        {p.inputElement}
        <Text style={s.Field_Name} pointerEvents={p.inputElement && 'none'}>
          {p.name}
        </Text>
        <Text style={s.Field_Value} pointerEvents={p.inputElement && 'none'}>
          {(!p.inputElement &&
            ((valueRender && valueRender(p.value)) || p.value)) ||
            '\u00A0'}
        </Text>
      </View>
      {(iconRender && iconRender(p.value)) ||
        (p.icon && (
          <Icon
            path={p.icon}
            style={s.Field_Icon}
            pointerEvents={p.inputElement && 'none'}
          />
        ))}
    </View>
  );
};
const Field = p => {
  if (p.onCreateBtnPress) {
    p = {
      ...p,
      iconRender: () => (
        <TouchableOpacity
          style={[s.Field_Btn, s.Field_Btn__create]}
          onPress={p.onCreateBtnPress}
        >
          <Icon
            style={s.Field_CreateRemoveIcon}
            path={mdiPlus}
            size={18}
            fill={v.brekekeGreen}
          />
        </TouchableOpacity>
      ),
    };
  }
  if (p.onRemoveBtnPress) {
    p = {
      ...p,
      iconRender: () => (
        <TouchableOpacity
          style={[s.Field_Btn, s.Field_Btn__remove]}
          onPress={p.onRemoveBtnPress}
        >
          <Icon
            style={s.Field_CreateRemoveIcon}
            path={mdiClose}
            size={15}
            fill={v.brekekeRed}
          />
        </TouchableOpacity>
      ),
    };
  }
  if (!p.onValueChange || p.disabled) {
    return renderField(p);
  }
  if (p.type === 'Switch') {
    if (p.disabled) {
      return renderField(p);
    }
    return (
      <TouchableOpacity onPress={() => p.onValueChange(!p.value)}>
        {renderField(p)}
      </TouchableOpacity>
    );
  } else {
    return renderField({
      ...p,
      inputElement: (
        <TextInputWithFocusStyle
          style={s.Field_TextInput}
          onChangeText={p.onValueChange}
          onSubmitEditing={p.onCreateBtnPress}
          {...omit(p, [
            'type',
            'name',
            'valueRender',
            'icon',
            'iconRender',
            'onValueChange',
            'onCreateBtnPress',
            'onRemoveBtnPress',
          ])}
        />
      ),
    });
  }
};

export default Field;
