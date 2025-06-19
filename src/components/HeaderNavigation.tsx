import { observer } from 'mobx-react'
import type { FC } from 'react'
import { useCallback } from 'react'
import type { ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'

import { css as fcss } from '#/components/FooterNavigation'
import { getSubMenus, getTabs } from '#/components/navigationConfig'
import { RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { ctx } from '#/stores/ctx'

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
    (totalNotice: number, style?: ViewStyle) => (
      <View style={fcss.UnreadOuter}>
        <View style={[fcss.Unread, css.Unread, style]}>
          <RnText style={fcss.UnreadText} bold white center>
            {totalNotice}
          </RnText>
        </View>
      </View>
    ),
    [],
  )

  return (
    <View style={css.Navigation}>
      {tabs.map(s => {
        const active = s.key === subMenu
        const totalUnreadChat = ctx.chat.unreadCount
        const totalNoticesWebchat = ctx.chat.getNumberWebchatNoti()

        return (
          <RnTouchableOpacity
            key={s.key}
            onPress={active ? undefined : s.navFn}
            style={[css.Btn, active && css.Btn__active]}
          >
            <RnText
              small
              numberOfLines={1}
              ellipsizeMode='tail'
              style={active && css.Text__active}
            >
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
