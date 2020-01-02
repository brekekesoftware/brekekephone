import { observer } from 'mobx-react';
import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import g from '../global';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../native/Rn';
import Actions from './Actions';
import Navigation from './Navigation';

const css = StyleSheet.create({
  Footer: {
    position: `absolute`,
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: getBottomSpace(),
    backgroundColor: g.bg,
    ...g.boxShadow,
  },
  Footer__hideKeyboard: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    bottom: 4,
    left: null,
    right: 4,
    borderRadius: g.borderRadius,
  },
  Footer__hasActions: {
    paddingTop: 8,
    paddingBottom: 8 + getBottomSpace(),
  },
  //
  // Fix bug margin auto can not be used
  ActionsOuter: {
    alignItems: `center`,
    flexDirection: `row`,
  },
  ActionsSpacing: {
    flex: 1,
  },
  //
  Actions: {
    flexDirection: `row`,
    width: `100%`,
    minWidth: 260,
    maxWidth: g.maxModalWidth,
    paddingHorizontal: 10,
  },
  Actions__hasNavigation: {
    marginVertical: 10,
  },
});

const Footer = observer(({ menu, onFabBack, onFabNext }) =>
  g.isKeyboardShowing ? (
    <TouchableOpacity
      onPress={() => {
        Keyboard.dismiss();
      }}
      style={[css.Footer, css.Footer__hideKeyboard]}
    >
      <Text small>HIDE KEYBOARD</Text>
    </TouchableOpacity>
  ) : onFabNext || menu ? (
    <View style={[css.Footer, onFabNext && css.Footer__hasActions]}>
      {onFabNext && (
        <View style={css.ActionsOuter}>
          <View style={css.ActionsSpacing} />
          <View style={[css.Actions, menu && css.Actions__hasNavigation]}>
            <Actions onBack={onFabBack} onNext={onFabNext} />
          </View>
          <View style={css.ActionsSpacing} />
        </View>
      )}
      {menu && <Navigation menu={menu} />}
    </View>
  ) : null,
);

export default Footer;
