import { observer } from 'mobx-react'
import type { FC } from 'react'

import { View } from '@/rn/core/components/view'
import { tw } from '@/rn/core/tw/tw'
import { menus } from '#/components/navigation-config'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { ctx } from '#/stores/ctx'

// Shared by header-navigation.tsx
export const unreadOuterClassName = tw`absolute top-2.5 left-0 right-0 flex-1 items-center`
export const unreadClassName = tw`left-3.75 w-5 h-3.75 rounded-[3px] pt-0.75 bg-error overflow-hidden`

export const Navigation: FC<{
  menu: string
}> = observer(({ menu }) => (
  <View className='flex-row self-stretch'>
    {menus().map(m => {
      const active = m.key === menu
      const totalUnreadChat = ctx.chat.unreadCount
      const totalNoticesWebchat = ctx.chat.getNumberWebchatNoti()
      const totalNoticesContact = totalUnreadChat + totalNoticesWebchat
      const showUnreadChat =
        ctx.auth.getCurrentAccount()?.ucEnabled &&
        !!totalNoticesContact &&
        m.key === 'contact' &&
        !active
      return (
        <RnTouchableOpacity
          key={m.key}
          onPress={active ? undefined : m.navFn}
          className='flex-1 p-1 items-center'
        >
          <View
            className={[
              'py-2 w-full',
              active && 'rounded-[22px] bg-primary-100',
            ]}
          >
            <RnIcon path={m.icon} />
          </View>
          {showUnreadChat && (
            <View className={unreadOuterClassName}>
              <View className={unreadClassName}>
                <RnText
                  className='text-[9.2px] leading-[9.2px]'
                  bold
                  white
                  center
                >
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
