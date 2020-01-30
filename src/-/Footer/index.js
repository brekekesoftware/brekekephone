import { observer } from 'mobx-react';
import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';

import g from '../../global';
import { arrToMap } from '../../utils/toMap';
import { StyleSheet, View } from '../Rn';
import Actions from './Actions';
import Navigation from './Navigation';
import ToggleKeyboard from './ToggleKeyboard';

const css = StyleSheet.create({
  Footer: {
    position: `absolute`,
    bottom: 0,
    right: 0,
  },
  Footer__noKeyboard: {
    left: 0,
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
  ActionsInner: {
    flexDirection: `row`,
    width: `100%`,
    minWidth: 260,
    maxWidth: g.maxModalWidth,
  },
});

const Footer = observer(props => {
  const { fabRender, menu, onFabNext } = props;
  if (!(menu || fabRender || onFabNext || g.isKeyboardShowing)) {
    return null;
  }
  const fabProps = arrToMap(
    Object.keys(props).filter(k => k.indexOf(`Fab`) > 0),
    k => k.replace(`Fab`, ``),
    k => props[k],
  );
  return (
    <View
      style={[
        css.Footer,
        (fabRender || !g.isKeyboardShowing) && css.Footer__noKeyboard,
      ]}
    >
      {fabRender ? (
        fabRender()
      ) : g.isKeyboardShowing ? (
        <ToggleKeyboard {...fabProps} />
      ) : onFabNext ? (
        <View style={css.ActionsOuter}>
          <View style={css.ActionsSpacing} />
          <View style={css.ActionsInner}>
            <Actions {...fabProps} />
          </View>
          <View style={css.ActionsSpacing} />
        </View>
      ) : null}
      {!g.isKeyboardShowing && menu && <Navigation menu={menu} />}
    </View>
  );
});

export default Footer;
