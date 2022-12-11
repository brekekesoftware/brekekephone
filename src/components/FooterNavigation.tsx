import { observer } from 'mobx-react'
import { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import { getAuthStore } from '../stores/authStore'
import { chatStore } from '../stores/chatStore'
import { menus } from './navigationConfig'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

export const css = StyleSheet.create({
  Navigation: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  Btn: {
    flex: 1,
    padding: 4,
    alignItems: 'center',
  },
  BtnBg: {
    paddingVertical: 8,
    width: '100%',
  },
  BtnBg__active: {
    borderRadius: 22,
    backgroundColor: v.colors.primaryFn(0.5),
  },
  UnreadOuter: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flex: 1,
    alignItems: 'center',
  },
  Unread: {
    left: 15,
    width: 20,
    height: 15,
    borderRadius: v.borderRadius,
    paddingTop: 3,
    backgroundColor: v.colors.danger,
    overflow: 'hidden',
  },
  UnreadText: {
    fontSize: v.fontSizeSmall - 2,
    lineHeight: v.fontSizeSmall - 2,
  },
})

export const Navigation: FC<{
  menu: string
}> = observer(({ menu }) => (
  <View style={css.Navigation}>
    {menus().map(m => {
      const active = m.key === menu
      const totalUnreadChat = chatStore.unreadCount
      const totalNoticesWebchat = chatStore.getNumberWebchatNoti()
      const totalNoticesContact = totalUnreadChat + totalNoticesWebchat
      const showUnreadChat =
        getAuthStore().getCurrentAccount()?.ucEnabled &&
        !!totalNoticesContact &&
        m.key === 'contact' &&
        !active
      return (
        <RnTouchableOpacity
          key={m.key}
          onPress={active ? undefined : m.navFn}
          style={css.Btn}
        >
          <View style={[css.BtnBg, active && css.BtnBg__active]}>
            <RnIcon path={m.icon} />
          </View>
          {showUnreadChat && (
            <View style={css.UnreadOuter}>
              <View style={css.Unread}>
                <RnText style={css.UnreadText} bold white center>
                  {totalUnreadChat + totalNoticesWebchat}
                </RnText>
              </View>
            </View>
          )}
        </RnTouchableOpacity>
      )
    })}
  </View>
))
