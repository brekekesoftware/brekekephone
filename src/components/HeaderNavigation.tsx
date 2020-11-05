import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import chatStore from '../stores/chatStore'
import { css as fcss } from './FooterNavigation'
import { getSubMenus } from './navigationConfig'
import { RnText, RnTouchableOpacity } from './Rn'
import g from './variables'

const css = StyleSheet.create({
  Navigation: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    backgroundColor: g.bg,
  },
  Btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: g.borderBg,
  },
  Btn__active: {
    borderColor: g.colors.primary,
  },
  Text__active: {
    color: g.colors.primary,
  },
  Unread: {
    top: -5,
    left: 25,
  },
})

const Navigation: FC<{
  menu: string
  subMenu: string
}> = observer(p => {
  const { menu, subMenu } = p
  return (
    <View style={css.Navigation}>
      {getSubMenus(menu).map(s => {
        const active = s.key === subMenu
        const totalUnreadChat = chatStore.unreadCount
        return (
          <RnTouchableOpacity
            key={s.key}
            onPress={active ? undefined : s.navFn}
            style={[css.Btn, active && css.Btn__active]}
          >
            <RnText small style={active && css.Text__active}>
              {s.label}
            </RnText>
            {s.key === 'chat' && !!totalUnreadChat && (
              <View style={fcss.UnreadOuter}>
                <View style={[fcss.Unread, css.Unread]}>
                  <RnText style={fcss.UnreadText} bold white center>
                    {totalUnreadChat}
                  </RnText>
                </View>
              </View>
            )}
          </RnTouchableOpacity>
        )
      })}
    </View>
  )
})
export default Navigation
