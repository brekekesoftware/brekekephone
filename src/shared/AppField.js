import { mdiClose, mdiPlus } from '@mdi/js';
import omit from 'lodash/omit';
import { Button, Switch, Text, View } from 'native-base';
import { transparentize } from 'polished';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import registerStyle from './registerStyle';
import SvgIcon from './SvgIcon';
import v from './variables';

const s = registerStyle(v => ({
  View: {
    AppField: {
      position: 'relative',
      paddingTop: v.padding,
      paddingBottom: 5,
      paddingHorizontal: 7,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: v.brekekeShade4,
      '.disabled': {
        backgroundColor: v.brekekeShade1,
      },
    },
    AppField_Inner: {
      position: 'static',
    },
  },
  Text: {
    AppField_Name: {
      position: 'relative',
      fontSize: 0.8 * v.fontSizeBase,
      color: v.brekekeShade7,
    },
    AppField_Value: {
      position: 'relative',
      fontWeight: 'bold',
    },
  },
  Switch: {
    AppField_Switch: {
      position: 'absolute',
      top: 22,
      right: 5,
    },
  },
  Button: {
    AppField_Btn: {
      position: 'absolute',
      top: 15,
      right: 5,
      width: 40,
      height: 30,
      borderRadius: v.brekekeBorderRadius,
      '.create': {
        backgroundColor: transparentize(0.9, v.brekekeGreen),
      },
      '.remove': {
        backgroundColor: transparentize(0.9, v.brekekeDanger),
      },
    },
  },
  _AppField_Icon: {
    position: 'absolute',
    top: v.padding,
    right: v.padding,
  },
  _AppField_TextInput: {
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
    fontSize: v.fontSizeBase,
    fontFamily: 'inherit',
  },
  _AppField_TextInputFocusing: {
    backgroundColor: transparentize(0.9, v.brekekeGreen),
  },
}));

const TextInputWithFocusStyle = React.forwardRef((p, ref) => {
  const [focusing, setFocusing] = React.useState(false);
  return (
    <TextInput
      {...p}
      style={[p.style, focusing && s._AppField_TextInputFocusing]}
      onFocus={() => setFocusing(true)}
      onBlur={() => setFocusing(false)}
    />
  );
});

const defaultValueRender = {
  Switch: v => (v ? 'Enabled' : 'Disabled'),
};
const defaultIconRender = {
  Switch: v => <Switch AppField_Switch pointerEvents="none" value={v} />,
};

const renderAppField = p => {
  const valueRender = p.valueRender || defaultValueRender[p.type];
  const iconRender = p.iconRender || defaultIconRender[p.type];
  return (
    <View AppField disabled={p.disabled}>
      <View AppField_Inner pointerEvents={p.disabled && 'none'}>
        {p.inputElement}
        <Text AppField_Name pointerEvents={p.inputElement && 'none'}>
          {p.name}
        </Text>
        <Text AppField_Value pointerEvents={p.inputElement && 'none'}>
          {(!p.inputElement &&
            ((valueRender && valueRender(p.value)) || p.value)) ||
            '\u00A0'}
        </Text>
      </View>
      {(iconRender && iconRender(p.value)) ||
        (p.icon && (
          <SvgIcon
            path={p.icon}
            style={s._AppField_Icon}
            pointerEvents={p.inputElement && 'none'}
          />
        ))}
    </View>
  );
};
const AppField = p => {
  if (p.onCreateBtnPress) {
    p = {
      ...p,
      iconRender: () => (
        <Button AppField_Btn create onPress={p.onCreateBtnPress}>
          <SvgIcon
            style={s._AppField_CreateRemoveIcon}
            path={mdiPlus}
            width="100%"
            height={18}
            fill={v.brekekeGreen}
          />
        </Button>
      ),
    };
  }
  if (p.onRemoveBtnPress) {
    p = {
      ...p,
      iconRender: () => (
        <Button AppField_Btn remove onPress={p.onRemoveBtnPress}>
          <SvgIcon
            style={s._AppField_CreateRemoveIcon}
            path={mdiClose}
            width="100%"
            height={15}
            fill={v.brekekeDanger}
          />
        </Button>
      ),
    };
  }
  if (!p.onValueChange || p.disabled) {
    return renderAppField(p);
  }
  if (p.type === 'Switch') {
    if (p.disabled) {
      return renderAppField(p);
    }
    return (
      <TouchableOpacity onPress={() => p.onValueChange(!p.value)}>
        {renderAppField(p)}
      </TouchableOpacity>
    );
  } else {
    return renderAppField({
      ...p,
      inputElement: (
        <TextInputWithFocusStyle
          style={s._AppField_TextInput}
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

export default AppField;
