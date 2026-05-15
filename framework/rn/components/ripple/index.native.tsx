import { useCallback, useEffect, useRef, useState } from 'react'

import type { RippleData, RippleProps } from '@/rn/components/ripple/ripple'
import { Ripple } from '@/rn/components/ripple/ripple.native'
import type { PressableRn } from '@/rn/core/components/pressable'
import { ulid } from '@/shared/ulidx'

export const useRipple = (props: RippleProps) => {
  const ref = useRef<PressableRn>(null)
  const [rippleData, setRippleData] = useState<RippleData[]>([])

  const timeoutsRef = useRef<number[]>([])
  useEffect(
    () => () => {
      for (const t of timeoutsRef.current) {
        window.clearTimeout(t)
      }
      timeoutsRef.current = []
    },
    [],
  )

  const onPressIn = useCallback((e: any) => {
    const { pageX, pageY } = e.nativeEvent
    ref.current?.measureInWindow?.(
      (x0: number, y0: number, w: number, h: number) => {
        if (!w || !h) {
          return
        }

        const x = pageX - x0
        const y = pageY - y0
        const cx = Math.max(0, Math.min(x, w))
        const cy = Math.max(0, Math.min(y, h))

        const maxX = Math.max(cx, w - cx)
        const maxY = Math.max(cy, h - cy)
        const rippleSize = Math.ceil(Math.sqrt(maxX * maxX + maxY * maxY) * 2)

        const id = ulid()
        setRippleData(prev => [...prev, { id, x: cx, y: cy, size: rippleSize }])

        const t = window.setTimeout(() => {
          setRippleData(prev => prev.filter(r => r.id !== id))
        }, 1000 + 17)

        timeoutsRef.current.push(t)
      },
    )
  }, [])

  const ripples = rippleData.map(r => (
    <Ripple
      key={`${r.id}`}
      style={{
        left: r.x - r.size / 2,
        top: r.y - r.size / 2,
        width: r.size,
        height: r.size,
        borderRadius: r.size / 2,
      }}
      {...props}
    />
  ))

  const pressableProps = {
    ref,
    onPressIn,
  }

  return [ripples, pressableProps]
}
