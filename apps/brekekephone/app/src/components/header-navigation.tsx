import { observer } from 'mobx-react'
import type { FC } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import type { ScrollView as RnScrollView } from 'react-native'
import { Dimensions } from 'react-native'

import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { unreadClassName } from '#/components/footer-navigation'
import { getSubMenus, getTabs } from '#/components/navigation-config'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { ctx } from '#/stores/ctx'

export const Navigation: FC<{
  menu: string
  subMenu: string
  isTab?: boolean
}> = observer(p => {
  const { menu, subMenu, isTab } = p
  const tabs = isTab ? getTabs(menu) : getSubMenus(menu)

  const renderIconNotices = useCallback(
    (totalNotice: number, extraClass?: string) => (
      <View className='absolute -top-1.25 left-6.25'>
        <View className={[unreadClassName, extraClass]}>
          <RnText className='text-[9.2px] leading-[9.2px]' bold white center>
            {totalNotice}
          </RnText>
        </View>
      </View>
    ),
    [],
  )
  const needScroll = !isTab && tabs.length > 4
  const Container = needScroll ? ScrollView : View

  const scrollRef = useRef<RnScrollView>(null)
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
  }, [scrollToTab])

  return (
    <Container
      className='flex-row self-stretch bg-background'
      ref={scrollRef as any}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {tabs.map(s => {
        const active = s.key === subMenu
        const totalUnreadChat = ctx.chat.unreadCount
        const totalNoticesWebchat = ctx.chat.getNumberWebchatNoti()

        return (
          <RnTouchableOpacity
            key={s.key}
            onPress={active ? undefined : s.navFn}
            onLayout={event => handleTabLayout(s.key, event)}
            className={[
              'flex-1 py-2 items-center border-b-[3px] border-border',
              needScroll && 'px-2.5 max-w-40 min-w-25',
              active && 'border-primary',
            ]}
          >
            <RnText
              small
              ellipsizeMode='tail'
              className={['line-clamp-1', active && 'text-primary']}
            >
              {s.label}
            </RnText>
            {s.key === 'chat' &&
              !!totalUnreadChat &&
              renderIconNotices(totalUnreadChat)}
            {s.key === 'webchat' &&
              !!totalNoticesWebchat &&
              renderIconNotices(totalNoticesWebchat, 'left-8.75 w-5')}
          </RnTouchableOpacity>
        )
      })}
    </Container>
  )
})
