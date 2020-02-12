import { mdiClose, mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import {
  Animated,
  Dimensions,
  Icon,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../-/Rn';
import g from '../global';
import intl from '../intl/intl';
import { useAnimationOnDidMount } from '../utils/animation';

const css = StyleSheet.create({
  Picker: {
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  Picker_Backdrop: {
    backgroundColor: g.layerBg,
  },
  Picker_Inner: {
    alignSelf: `flex-end`,
    position: `absolute`,
    paddingVertical: 15,
    width: `90%`,
    maxWidth: g.maxModalWidth,
    maxHeight: `100%`,
  },
  Picker_Options: {
    borderRadius: g.borderRadius,
    backgroundColor: g.bg,
    overflow: `hidden`,
  },
  Picker_Option: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: g.hoverBg,
  },
  Picker_Option__last: {
    borderBottomWidth: 0,
  },
  Picker_Option__selected: {
    backgroundColor: g.hoverBg,
  },
  Picker_Option__cancel: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderRadius: g.borderRadius,
    backgroundColor: g.bg,
  },
  Picker_Text__selected: {
    fontWeight: `bold`,
    color: g.colors.primary,
  },
  Picker_Text__cancel: {
    fontWeight: `bold`,
    color: g.colors.danger,
  },
  Picker_Icon: {
    position: `absolute`,
    top: 10,
    right: 10,
  },
});

const Picker = p => {
  const a = useAnimationOnDidMount({
    opacity: [0, 1],
    translateY: [Dimensions.get(`screen`).height, 0],
  });
  return (
    <View style={[StyleSheet.absoluteFill, css.Picker]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          css.Picker_Backdrop,
          { opacity: a.opacity },
        ]}
      >
        <TouchableOpacity
          onPress={g.dismissPicker}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.ScrollView
        style={[
          css.Picker_Inner,
          {
            transform: [{ translateY: a.translateY }],
          },
        ]}
      >
        <View style={css.Picker_Options}>
          {p.options.map((o, i) => {
            const isSelected = `${p.selectedKey}` === `${o.key}`;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  p.onSelect(o.key);
                  g.dismissPicker();
                }}
                style={[
                  css.Picker_Option,
                  i + 1 === p.options.length && css.Picker_Option__last,
                  isSelected && css.Picker_Option__selected,
                ]}
              >
                <Text style={isSelected && css.Picker_Text__selected}>
                  {o.label}
                </Text>
                <Icon
                  color={isSelected ? g.colors.primary : null}
                  path={
                    o.icon ||
                    (isSelected ? mdiRadioboxMarked : mdiRadioboxBlank)
                  }
                  style={css.Picker_Icon}
                />
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          onPress={g.dismissPicker}
          style={[css.Picker_Option, css.Picker_Option__cancel]}
        >
          <Text style={css.Picker_Text__cancel}>
            {p.cancelLabel || intl`Cancel`}
          </Text>
          <Icon
            color={g.colors.danger}
            path={mdiClose}
            style={css.Picker_Icon}
          />
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

const RootPicker = observer(
  () => g.currentPicker && <Picker {...g.currentPicker} />,
);

export default RootPicker;
