import { observer } from 'mobx-react'
import React, { FC, useCallback } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { chatStore } from '../stores/chatStore'
import { css as fcss } from './FooterNavigation'
import { getSubMenus } from './navigationConfig'
import { getTabs } from './navigationConfig2'
import { RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  Navigation: {
    flexDirection: 'row',
    alignSelf: 'stretch',

    backgroundColor: v.bg,
  },
  Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: v.borderBg,
  },
  Btn__active: {
    borderColor: v.colors.primary,
  },
  Text__active: {
    color: v.colors.primary,
  },
  Unread: {
    top: -5,
    left: 25,
  },
  ml: {
    left: 35,
    width: 20,
  },
})

export const Navigation: FC<{
  menu: string
  subMenu: string
  isTab?: boolean
}> = observer(p => {
  const { menu, subMenu, isTab } = p
  const tabs = isTab ? getTabs(menu) : getSubMenus(menu)

  const renderIconNotices = useCallback(
    (totalNotice: number, style?: ViewStyle) => {
      return (
        <View style={fcss.UnreadOuter}>
          <View style={[fcss.Unread, css.Unread, style]}>
            <RnText style={fcss.UnreadText} bold white center>
              {totalNotice}
            </RnText>
          </View>
        </View>
      )
    },
    [],
  )

  return (
    <View style={css.Navigation}>
      {tabs.map(s => {
        const active = s.key === subMenu
        const totalUnreadChat = chatStore.unreadCount
        const totalNoticesWebchat = chatStore.numberNoticesWebchat

        return (
          <RnTouchableOpacity
            key={s.key}
            onPress={active ? undefined : s.navFn}
            style={[css.Btn, active && css.Btn__active]}
          >
            <RnText small style={active && css.Text__active}>
              {s.label}
            </RnText>
            {s.key === 'chat' &&
              !!totalUnreadChat &&
              renderIconNotices(totalUnreadChat)}
            {s.key === 'webchat' &&
              !!totalNoticesWebchat &&
              renderIconNotices(totalNoticesWebchat, css.ml)}
          </RnTouchableOpacity>
        )
      })}
    </View>
  )
})
