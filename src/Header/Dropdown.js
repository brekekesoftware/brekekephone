import { mdiDotsVertical } from '@mdi/js';
import React from 'react';

import g from '../global';
import { StyleSheet, Text, TouchableOpacity, View } from '../native/Rn';
import Icon from '../shared/Icon';

const css = StyleSheet.create({
  Dropdown: {
    position: `absolute`,
    top: 60,
    right: 15,
    width: 250,
    backgroundColor: g.bg,
    borderRadius: g.borderRadius,
    ...g.boxShadow,
    ...g.backdropZindex,
  },
  Dropdown__compact: {
    top: 35,
  },
  Item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: g.borderBg,
  },
  Item__last: {
    borderBottomWidth: 0,
  },
  Backdrop: {
    position: `absolute`,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: g.fn.transparentize(0.8, `black`),
    ...g.backdropZindex,
  },
  Btn: {
    position: `absolute`,
    top: 0,
    bottom: 0,
    right: 0,
    width: 50,
  },
});

const Dropdown = ({ active, close, compact, items }) => {
  if (!active) {
    return null;
  }
  return (
    <React.Fragment>
      <TouchableOpacity onPress={close} style={css.Backdrop} />
      <View style={[css.Dropdown, compact && css.Dropdown__compact]}>
        {items.map((d, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              close();
              d.onPress();
            }}
            style={[css.Item, i === items.length - 1 && css.Item__last]}
          >
            <Text>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </React.Fragment>
  );
};

const Btn = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={css.Btn}>
    <Icon path={mdiDotsVertical} />
  </TouchableOpacity>
);

Dropdown.Btn = Btn;

export default Dropdown;
