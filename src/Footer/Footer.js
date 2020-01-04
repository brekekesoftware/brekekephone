import { observer } from 'mobx-react';
import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import g from '../global';
import { StyleSheet, View } from '../native/Rn';
import { arrToMap } from '../utils/toMap';
import Actions from './Actions';
import Navigation from './Navigation';
import ToggleKeyboard from './ToggleKeyboard';

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
  //
  // Fix bug margin auto can not be used
  ActionsOuter: {
    alignItems: `center`,
    flexDirection: `row`,
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  ActionsSpacing: {
    flex: 1,
  },
  //
  // Add hide keyboard button
  ActionsInner: {
    flexDirection: `row`,
    width: `100%`,
    minWidth: 260,
    maxWidth: g.maxModalWidth,
  },
});

const Footer = observer(props => {
  const { menu, onFabNext } = props;
  if (!(menu || onFabNext || g.isKeyboardShowing)) {
    return null;
  }
  const fabProps =
    onFabNext &&
    arrToMap(
      Object.keys(props).filter(k => k.indexOf(`Fab`) > 0),
      k => k.replace(`Fab`, ``),
      k => props[k],
    );
  return (
    <View style={css.Footer}>
      {onFabNext && (
        <View style={css.ActionsOuter}>
          <View style={css.ActionsSpacing} />
          <View style={css.ActionsInner}>
            <Actions {...fabProps} />
            <ToggleKeyboard {...fabProps} />
          </View>
          <View style={css.ActionsSpacing} />
        </View>
      )}
      {g.isKeyboardShowing && !onFabNext && (
        <View style={css.ActionsOuter}>
          <View style={css.ActionsSpacing} />
          <ToggleKeyboard {...fabProps} />
        </View>
      )}
      {!g.isKeyboardShowing && menu && <Navigation menu={menu} />}
    </View>
  );
});

export default Footer;
