import { observer } from 'mobx-react'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import { RnText } from '#/components/Rn'
import { v } from '#/components/variables'
import { ctx } from '#/stores/ctx'
import type { ToastType } from '#/stores/toastStore'

const getBg = (type: ToastType) => {
  switch (type) {
    case 'success':
      return v.colors.primary
    case 'error':
      return v.colors.danger
    case 'warning':
      return v.colors.warning
    default:
      return v.colors.primary
  }
}

const s = StyleSheet.create({
  root: {
    left: 0,
    right: 0,
    top: 0,
  },
  item: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 0,
    marginHorizontal: 0,
    borderEndEndRadius: 4,
  },
  text: {
    color: 'white',
  },
  errorDetail: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
})

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
    const y = useRef(new Animated.Value(0)).current

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

    return (
      <Animated.View
        style={[
          s.item,
          {
            backgroundColor: getBg(data.type),
            opacity: fade,
            transform: [{ translateY: y }],
          },
        ]}
      >
        {data?.msg && (
          <RnText numberOfLines={1} ellipsizeMode='tail' style={s.text}>
            {data.msg}
          </RnText>
        )}
        {errorDetail && (
          <RnText numberOfLines={2} ellipsizeMode='tail' style={s.errorDetail}>
            {errorDetail}
          </RnText>
        )}
      </Animated.View>
    )
  },
)

export const ToastRoot = observer(() => (
  <View style={s.root}>
    {ctx.toast.items.map(t => (
      <Item key={t.id} data={t} onEnd={() => ctx.toast.hide(t.id)} />
    ))}
  </View>
))
