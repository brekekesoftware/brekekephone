import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'

import { View } from '@/rn/core/components/view'
import { RnText } from '#/components/rn'
import { AnimatedView } from '#/components/rn-animated'
import { ctx } from '#/stores/ctx'
import type { ToastType } from '#/stores/toast-store'

const bgClassMap: { [k: string]: string } = {
  success: 'bg-primary',
  error: 'bg-error',
  warning: 'bg-warning',
}
const getBgClass = (type: ToastType) => bgClassMap[type] || 'bg-primary'

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
    const [visible, setVisible] = useState(false)

    useEffect(() => {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onEnd, 500)
      }, TOAST_DISPLAY_DURATION)
      return () => clearTimeout(timer)
    }, [onEnd])

    const errorDetail = data.err?.message
    const bgCls = getBgClass(data.type)

    return (
      <AnimatedView
        className={[
          'py-0.5 px-1 rounded-br-sm transition-opacity duration-500',
          bgCls,
          visible ? 'opacity-100' : 'opacity-0',
        ]}
      >
        {data?.msg && (
          <RnText className='line-clamp-1' ellipsizeMode='tail' white>
            {data.msg}
          </RnText>
        )}
        {errorDetail && (
          <RnText
            className='line-clamp-2 ml-1 text-[12px]'
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
  <View className='left-0 right-0 top-0'>
    {ctx.toast.items.map(t => (
      <Item key={t.id} data={t} onEnd={() => ctx.toast.hide(t.id)} />
    ))}
  </View>
))
