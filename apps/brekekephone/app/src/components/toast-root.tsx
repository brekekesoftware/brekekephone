import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

import { View } from '@/rn/core/components/view'
import { tw } from '@/rn/core/tw/tw'
import { RnText } from '#/components/rn'
import { AnimatedView } from '#/components/rn-class-name-components'
import { ctx } from '#/stores/ctx'
import type { ToastType } from '#/stores/toast-store'

const bgClassMap = {
  success: tw`bg-primary`,
  error: tw`bg-error`,
  warning: tw`bg-warning`,
}
const getBgClass = (type: ToastType) => bgClassMap[type] || tw`bg-primary`

const TOAST_DISPLAY_DURATION = 2700

const Item = observer(
  ({
    data,
    onEnd,
  }: {
    data: {
      id: string
      msg: string | undefined
      type: ToastType
      err?: Error
    }
    onEnd: () => void
  }) => {
    const fade = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
      const timer = setTimeout(() => {
        Animated.timing(fade, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(onEnd)
      }, TOAST_DISPLAY_DURATION)
      return () => clearTimeout(timer)
    }, [fade, onEnd])

    const errorDetail = data.err?.message
    const bgCls = getBgClass(data.type)

    return (
      <AnimatedView
        className={['rounded-br-sm px-1 py-0.5', bgCls]}
        style={{ opacity: fade }}
      >
        {data?.msg && (
          <RnText className='line-clamp-1' ellipsizeMode='tail' white>
            {data.msg}
          </RnText>
        )}
        {errorDetail && (
          <RnText
            className='ml-1 line-clamp-2 text-[12px]'
            ellipsizeMode='tail'
            white
          >
            {errorDetail}
          </RnText>
        )}
      </AnimatedView>
    )
  },
)

export const ToastRoot = observer(() => (
  <View className='top-0 right-0 left-0'>
    {ctx.toast.items.map(t => (
      <Item key={t.id} data={t} onEnd={() => ctx.toast.hide(t.id)} />
    ))}
  </View>
))
