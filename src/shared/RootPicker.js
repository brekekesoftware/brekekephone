import { mdiClose, mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import { useAnimationOnDidMount } from '../utils/animation';
import Icon from './Icon';

const s = StyleSheet.create({
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
    color: g.mainDarkBg,
  },
  Picker_Text__cancel: {
    fontWeight: `bold`,
    color: g.redDarkBg,
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
    <View style={[StyleSheet.absoluteFill, s.Picker]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          s.Picker_Backdrop,
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
          s.Picker_Inner,
          {
            transform: [{ translateY: a.translateY }],
          },
        ]}
      >
        <View style={s.Picker_Options}>
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
                  s.Picker_Option,
                  i + 1 === p.options.length && s.Picker_Option__last,
                  isSelected && s.Picker_Option__selected,
                ]}
              >
                <Text style={isSelected && s.Picker_Text__selected}>
                  {o.label}
                </Text>
                <Icon
                  color={isSelected ? g.mainDarkBg : null}
                  path={
                    o.icon ||
                    (isSelected ? mdiRadioboxMarked : mdiRadioboxBlank)
                  }
                  style={s.Picker_Icon}
                />
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          onPress={g.dismissPicker}
          style={[s.Picker_Option, s.Picker_Option__cancel]}
        >
          <Text style={s.Picker_Text__cancel}>{p.cancelLabel || `Cancel`}</Text>
          <Icon color={g.redDarkBg} path={mdiClose} style={s.Picker_Icon} />
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
};

const RootPicker = observer(
  () => g.currentPicker && <Picker {...g.currentPicker} />,
);

export default RootPicker;
