import {
  mdiCardsDiamond,
  mdiClose,
  mdiPlus,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
import flow from 'lodash/flow';
import omit from 'lodash/omit';
import { observer } from 'mobx-react';
import React, { useRef } from 'react';

import g from '../global';
import intl from '../intl/intl';
import {
  Icon,
  Keyboard,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from '../Rn';
import useStore from '../utils/useStore';

const css = StyleSheet.create({
  Field: {
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    alignItems: 'stretch',
    marginHorizontal: 15,
    ...Platform.select({
      android: {
        paddingBottom: 2,
      },
    }),
  },
  Field__focusing: {
    backgroundColor: g.colors.primaryFn(0.5),
  },
  Field__disabled: {
    backgroundColor: g.hoverBg,
  },
  Field__group: {
    marginHorizontal: 0,
    marginTop: 15,
    backgroundColor: g.borderBg,
    padding: 15,
  },
  Field__groupMargin: {
    marginTop: 30,
  },
  Field__transparent: {
    borderColor: 'transparent',
    marginHorizontal: 0,
  },
  Field_Label: {
    paddingTop: 13,
    paddingBottom: 0,
    paddingLeft: 7,
    ...Platform.select({
      android: {
        paddingTop: 3,
        top: 6,
      },
      web: {
        // Fix form auto fill style on web
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      },
    }),
  },
  Field_LabelText: {
    color: g.subColor,
    fontWeight: g.fontWeight,
  },
  Field_LabelTextGroup: {
    ...Platform.select({
      android: {
        top: -6,
      },
    }),
  },
  Field_TextInput: {
    width: '100%',
    paddingTop: 1,
    paddingBottom: 3,
    paddingLeft: 7,
    paddingRight: 40,
    fontWeight: 'bold',
    overflow: 'hidden',
    ...Platform.select({
      android: {
        paddingTop: 0,
        paddingBottom: 0,
        lineHeight: g.lineHeight,
        // Should not set height and overflow here
        //    it will cause scroll issue with the input
        // height: g.lineHeight,
      },
      web: {
        // Fix form auto fill style on web
        paddingTop: 28,
      },
    }),
  },
  Field_Switch: {
    position: 'absolute',
    top: 22,
    right: 11,
  },
  Field_Btn: {
    position: 'absolute',
    top: 11,
    right: 5,
    width: 40,
    height: 30,
    borderRadius: g.borderRadius,
  },
  Field_Btn__create: {
    backgroundColor: g.colors.primaryFn(0.5),
  },
  Field_Btn__remove: {
    backgroundColor: g.colors.dangerFn(0.5),
  },
  Field_Icon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  Field_Error: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  Field_ErrorInner: {
    alignSelf: 'flex-start',
    marginVertical: 2,
    marginHorizontal: 15,
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: g.colors.danger,
    borderRadius: g.borderRadius,
  },
  Field_ErrorIcon: {
    position: 'absolute',
    top: -8,
    left: 2,
  },
  Field_ErrorLabel: {
    color: g.revColor,
  },
});

const Field = observer(({ ...props }) => {
  if (props.isGroup) {
    return (
      <View
        style={[
          css.Field,
          css.Field__group,
          props.hasMargin && css.Field__groupMargin,
        ]}
      >
        <Text small style={css.Field_LabelTextGroup}>
          {props.label}
        </Text>
      </View>
    );
  }
  const $ = useStore(() => ({
    observable: {
      isFocusing: false,
    },
  }));
  const inputRef = useRef();
  if (!inputRef.current && $.isFocusing) {
    $.set('isFocusing', false);
  }
  if (props.onCreateBtnPress) {
    Object.assign(props, {
      iconRender: () => (
        <TouchableOpacity
          onPress={props.onCreateBtnPress}
          style={[css.Field_Btn, css.Field_Btn__create, props.createBtnStyle]}
        >
          <Icon
            color={g.colors.primary}
            path={props.createBtnIcon || mdiPlus}
            size={18}
            style={[css.Field_CreateRemoveIcon, props.createBtnIconStyle]}
          />
        </TouchableOpacity>
      ),
    });
  }
  if (props.onRemoveBtnPress) {
    Object.assign(props, {
      iconRender: () => (
        <TouchableOpacity
          onPress={props.onRemoveBtnPress}
          style={[css.Field_Btn, css.Field_Btn__remove, props.removeBtnStyle]}
        >
          <Icon
            color={g.colors.danger}
            path={props.removeBtnIcon || mdiClose}
            size={15}
            style={[css.Field_CreateRemoveIcon, props.removeBtnIconStyle]}
          />
        </TouchableOpacity>
      ),
    });
  }
  if (props.onValueChange) {
    if (props.type === 'Switch') {
      Object.assign(props, {
        valueRender:
          props.valueRender || (v => (v ? intl`Enabled` : intl`Disabled`)),
        iconRender: v => <Switch enabled={v} style={css.Field_Switch} />,
        onTouchPress: () => {
          props.onValueChange(!props.value);
          Keyboard.dismiss();
        },
      });
    } else if (props.type === 'Picker') {
      Object.assign(props, {
        valueRender: v => props.options.find(o => o.key === v)?.label || v,
        onTouchPress: () => {
          g.openPicker({
            options: props.options,
            selectedKey: props.value,
            onSelect: props.onValueChange,
          });
          Keyboard.dismiss();
        },
        icon: props.icon || mdiUnfoldMoreHorizontal,
      });
    } else {
      Object.assign(props, {
        inputElement: (
          <TextInput
            ref={inputRef}
            {...omit(props, [
              'type',
              'label',
              'valueRender',
              'icon',
              'iconRender',
              'onValueChange',
              'onCreateBtnPress',
              'createBtnIcon',
              'onRemoveBtnPress',
              'removeBtnIcon',
              'disabled',
              'error',
            ])}
            onBlur={flow(
              [() => $.set('isFocusing', false), props.onBlur].filter(f => f),
            )}
            onChangeText={props.onValueChange}
            onFocus={flow(
              [() => $.set('isFocusing', true), props.onFocus].filter(f => f),
            )}
            onSubmitEditing={flow(
              [props.onCreateBtnPress, props.onSubmitEditing].filter(f => f),
            )}
            style={[css.Field_TextInput, props.style]}
          />
        ),
        onTouchPress: () => inputRef.current?.focus(),
      });
    }
  }
  if (props.disabled) {
    props.inputElement = null;
    props.onTouchPress = null;
  }
  const Container = props.onTouchPress ? TouchableOpacity : View;
  const label = (
    <View pointerEvents="none" style={css.Field_Label}>
      <Text small style={css.Field_LabelText}>
        {props.label}
      </Text>
    </View>
  );
  return (
    <React.Fragment>
      <Container
        accessible={!props.inputElement}
        onPress={props.onTouchPress}
        style={[
          css.Field,
          $.isFocusing && css.Field__focusing,
          props.disabled && css.Field__disabled,
          props.transparent && css.Field__transparent,
        ]}
      >
        {/* Fix form auto fill style on web */}
        {Platform.OS !== 'web' && label}
        <View pointerEvents={$.isFocusing ? null : 'none'}>
          {props.inputElement || (
            <TextInput
              disabled
              secureTextEntry={!!(props.secureTextEntry && props.value)}
              style={css.Field_TextInput}
              value={
                (props.valueRender && props.valueRender(props.value)) ||
                props.value ||
                '\u200a'
              }
            />
          )}
          {!$.isFocusing && <View style={StyleSheet.absoluteFill} />}
        </View>
        {/* Fix form auto fill style on web */}
        {Platform.OS === 'web' && label}
        {(props.iconRender && props.iconRender(props.value)) ||
          (props.icon && (
            <Icon
              path={props.icon}
              pointerEvents="none"
              style={css.Field_Icon}
            />
          ))}
      </Container>
      {props.error && (
        <TouchableOpacity
          onPress={() => inputRef.current?.focus()}
          style={css.Field_Error}
        >
          <View style={css.Field_ErrorInner}>
            <Icon
              color={g.colors.danger}
              path={mdiCardsDiamond}
              style={css.Field_ErrorIcon}
            />
            <Text small style={css.Field_ErrorLabel}>
              {props.error}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </React.Fragment>
  );
});

export default Field;
