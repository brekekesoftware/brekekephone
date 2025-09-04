import { observer } from 'mobx-react'
import type { FC } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import type { ViewStyle } from 'react-native'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'

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
  BtnWithScroll: {
    paddingHorizontal: 10,
    maxWidth: 160,
    minWidth: 100,
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
  const needScroll = !isTab && tabs.length > 4
  const Container = needScroll ? ScrollView : View

  const scrollRef = useRef<ScrollView>(null)
  const tabPositions = useRef<Map<string, { x: number; width: number }>>(
    new Map(),
  )

  const handleTabLayout = useCallback((tabKey: string, event: any) => {
    const { x, width } = event.nativeEvent.layout
    tabPositions.current.set(tabKey, { x, width })
  }, [])

  const scrollToTab = useCallback(() => {
    const tabKey = subMenu || ctx.auth.activeCustomPageId
    if (!tabKey || !(menu === 'settings' && needScroll)) {
      return
    }
    const position = tabPositions.current.get(tabKey)
    if (!position || !scrollRef.current) {
      return
    }

    const screenWidth = Dimensions.get('window').width
    const leftMargin = screenWidth > 600 ? 80 : 60
    const rightZone = screenWidth * 0.25
    let scrollX = Math.max(position.x - leftMargin, 0)
    if (position.x > screenWidth - rightZone) {
      scrollX += screenWidth > 600 ? 120 : 80
    }
    scrollRef.current.scrollTo({ x: scrollX, animated: false })
  }, [menu, needScroll, subMenu])

  useEffect(() => {
    if (ctx.auth.activeCustomPageId) {
      scrollToTab()
    }
  }, [ctx.auth.activeCustomPageId, scrollToTab])

  return (
    <Container
      style={css.Navigation}
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {tabs.map((s, idx) => {
        const active = s.key === subMenu
        const totalUnreadChat = ctx.chat.unreadCount
        const totalNoticesWebchat = ctx.chat.getNumberWebchatNoti()

        return (
          <RnTouchableOpacity
            key={s.key}
            onPress={active ? undefined : s.navFn}
            onLayout={event => handleTabLayout(s.key, event)}
            style={[
              css.Btn,
              needScroll && css.BtnWithScroll,
              active && css.Btn__active,
            ]}
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
    </Container>
  )
})
