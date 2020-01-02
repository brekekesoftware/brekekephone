import { mdiDotsVertical } from '@mdi/js';
import React, { useState } from 'react';

import g from '../global';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Icon from '../shared/Icon';
import { useAnimationOnDidMount } from '../utils/animation';

const css = StyleSheet.create({
  Backdrop: {
    position: `absolute`,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: g.fn.transparentize(0.8, `black`),
    ...g.backdropZindex,
  },
  //
  Getter: {
    opacity: 0,
  },
  //
  Dropdown: {
    position: `absolute`,
    top: 60,
    right: 15,
    width: 250,
    ...g.boxShadow,
    ...g.backdropZindex,
  },
  Dropdown__compact: {
    top: 35,
  },
  Inner: {
    flex: 1,
    overflow: `hidden`,
    backgroundColor: g.bg,
    borderRadius: g.borderRadius,
  },
  //
  Item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: g.borderBg,
  },
  Item__last: {
    borderBottomWidth: 0,
  },
  //
  Btn: {
    position: `absolute`,
    top: 0,
    bottom: 0,
    right: 0,
    width: 50,
  },
});

const Dropdown = ({ close, compact, dropdown }) => {
  const [height, setHeight] = useState(0);
  const Component = height ? DropdownAnimated : DropdownGetter;
  return (
    <React.Fragment>
      <TouchableOpacity onPress={close} style={css.Backdrop} />
      <Component compact={compact} height={height} setHeight={setHeight}>
        {dropdown.map(({ danger, label, onPress, primary, warning }, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              close();
              onPress();
            }}
            style={[css.Item, i === dropdown.length - 1 && css.Item__last]}
          >
            <Text {...{ primary, warning, danger }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </Component>
    </React.Fragment>
  );
};
const DropdownGetter = ({ children, setHeight }) => (
  <View
    onLayout={e => {
      setHeight(e.nativeEvent.layout.height);
    }}
    style={css.Getter}
  >
    {children}
  </View>
);
const DropdownAnimated = ({ children, compact, height }) => {
  const cssDropdownAnimation = useAnimationOnDidMount({
    height: [0, height],
  });
  return (
    <Animated.View
      style={[
        css.Dropdown,
        compact && css.Dropdown__compact,
        cssDropdownAnimation,
      ]}
    >
      <View style={css.Inner}>{children}</View>
    </Animated.View>
  );
};

const DropdownBtn = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={css.Btn}>
    <Icon path={mdiDotsVertical} />
  </TouchableOpacity>
);
Dropdown.Btn = DropdownBtn;

export default Dropdown;
