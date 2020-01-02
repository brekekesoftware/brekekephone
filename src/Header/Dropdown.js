import { mdiDotsVertical } from '@mdi/js';
import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity } from '../native/Rn';
import AnimatedHeight from '../shared/AnimatedHeight';
import Icon from '../shared/Icon';

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
    borderRadius: g.borderRadius,
    backgroundColor: g.bg,
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
  return (
    <React.Fragment>
      <TouchableOpacity
        activeOpacity={1}
        onPress={close}
        style={css.Backdrop}
      />
      <AnimatedHeight
        innerStyle={css.Inner}
        style={[css.Dropdown, compact && css.Dropdown__compact]}
      >
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
      </AnimatedHeight>
    </React.Fragment>
  );
};

const DropdownBtn = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={css.Btn}>
    <Icon path={mdiDotsVertical} />
  </TouchableOpacity>
);
Dropdown.Btn = DropdownBtn;

export default Dropdown;
