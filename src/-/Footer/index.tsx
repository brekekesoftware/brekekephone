import { observer } from 'mobx-react'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import g from '../global'
import { toLowerCaseFirstChar } from '../utils/string'
import { arrToMap } from '../utils/toMap'
import Actions from './Actions'
import Navigation from './Navigation'
import ToggleKeyboard from './ToggleKeyboard'

const css = StyleSheet.create({
  Footer: {
    position: 'absolute',
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
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  ActionsSpacing: {
    flex: 1,
  },
  //
  ActionsInner: {
    flexDirection: 'row',
    width: '100%',
    minWidth: 260,
    maxWidth: g.maxModalWidth,
  },
})

const Footer = observer(props => {
  const fabProps = arrToMap(
    Object.keys(props).filter(k => k.startsWith('fab')),
    k => toLowerCaseFirstChar(k.replace('fab', '')),
    k => props[k],
  ) as any
  const { menu } = props
  const { onNext, render } = fabProps
  if (
    !render &&
    ((!menu && !onNext && !g.isKeyboardShowing) || g.isKeyboardAnimating)
  ) {
    return null
  }
  return (
    <View
      style={[
        css.Footer,
        (render || !g.isKeyboardShowing) && css.Footer__noKeyboard,
      ]}
    >
      {render ? (
        render()
      ) : g.isKeyboardShowing ? (
        <ToggleKeyboard {...fabProps} />
      ) : onNext ? (
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
  )
})

export default Footer
