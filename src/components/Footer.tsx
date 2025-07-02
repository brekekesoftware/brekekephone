import { lowerFirst } from 'lodash'
import { observer } from 'mobx-react'
import type { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import { FooterActions } from '#/components/FooterActions'
import { Navigation } from '#/components/FooterNavigation'
import { ToggleKeyboard } from '#/components/FooterToggleKeyboard'
import { v } from '#/components/variables'
import { RnKeyboard } from '#/stores/RnKeyboard'
import { arrToMap } from '#/utils/arrToMap'

const css = StyleSheet.create({
  Footer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  Footer__noKeyboard: {
    left: 0,
    paddingBottom: getBottomSpace(),
    backgroundColor: v.bg,
    ...v.boxShadow,
  },
  //
  // fix bug margin auto can not be used
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
    maxWidth: v.maxModalWidth,
  },
})

export const Footer: FC<{
  menu: string
  isTab?: boolean
}> = observer(props => {
  const fabProps: {
    onNext?(): void
    render: Function
    onShowKeyboard(): void
  } = arrToMap(
    Object.keys(props).filter(k => k.startsWith('fab')),
    (k: string) => lowerFirst(k.replace('fab', '')),
    (k: string) => props[k as keyof typeof props],
  ) as any
  const { menu, isTab } = props
  const { onNext, render } = fabProps
  if (
    !render &&
    ((!menu && !onNext && !RnKeyboard.isKeyboardShowing) ||
      RnKeyboard.isKeyboardAnimating)
  ) {
    return null
  }
  return (
    <View
      style={[
        css.Footer,
        (render || !RnKeyboard.isKeyboardShowing) && css.Footer__noKeyboard,
      ]}
    >
      {render ? (
        render()
      ) : RnKeyboard.isKeyboardShowing ? (
        <ToggleKeyboard {...fabProps} />
      ) : onNext ? (
        <View style={css.ActionsOuter}>
          <View style={css.ActionsSpacing} />
          <View style={css.ActionsInner}>
            <FooterActions {...fabProps} />
          </View>
          <View style={css.ActionsSpacing} />
        </View>
      ) : null}
      {!RnKeyboard.isKeyboardShowing && menu && !isTab && (
        <Navigation menu={menu} />
      )}
    </View>
  )
})
