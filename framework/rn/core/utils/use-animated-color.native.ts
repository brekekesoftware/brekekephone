import BezierEasing from 'bezier-easing'
import parseColor from 'color-rgba'
import { useEffect, useRef, useState } from 'react'
import type { CSSTransitionProperties } from 'react-native-reanimated'

import {
  transitionDurationDefault,
  transitionTimingFunctionDefault,
} from '@/rn/core/tw/lib/normalize-style-config'

export const useAnimatedColor = (
  color: string | undefined,
  {
    transitionProperty,
    transitionDuration,
    transitionTimingFunction,
  }: CSSTransitionProperties,
) => {
  const prevColorRef = useRef<string | undefined>(color)
  const [transitionColor, setTransitionColor] = useState<string | undefined>(
    color,
  )
  const rafRef = useRef(0)

  useEffect(() => {
    if (
      !isTransitionColor(transitionProperty) ||
      !color ||
      !prevColorRef.current ||
      prevColorRef.current === color
    ) {
      setTransitionColor(color)
      prevColorRef.current = color
      return
    }

    const prev = parseColor(prevColorRef.current)
    const next = parseColor(color)
    prevColorRef.current = color
    if (!prev?.length || !next?.length) {
      setTransitionColor(color)
      return
    }

    const i = Array.isArray(transitionProperty)
      ? transitionProperty.indexOf('color')
      : -1

    let duration = Array.isArray(transitionDuration)
      ? i >= 0 && i < transitionDuration.length
        ? transitionDuration[i]
        : transitionDuration[0]
      : transitionDuration
    if (typeof duration !== 'number' || duration < 0) {
      duration = transitionDurationDefault
    }
    if (!duration) {
      setTransitionColor(color)
      return
    }

    const easing = Array.isArray(transitionTimingFunction)
      ? i >= 0 && i < transitionTimingFunction.length
        ? transitionTimingFunction[i]
        : transitionTimingFunction[0]
      : transitionTimingFunction
    let timingFn = easings[easing as Easing]
    if (typeof timingFn !== 'function') {
      timingFn = easings[transitionTimingFunctionDefault]
    }

    const steps = duration / (1000 / 60)
    const start = performance.now()
    let lastStep = -1

    const tick = (now: number) => {
      const r = Math.min(1, (now - start) / duration)
      const eased = timingFn(r)
      const step = Math.min(steps, Math.max(0, Math.floor(eased * steps)))
      if (step !== lastStep) {
        lastStep = step
        const t = step / steps
        setTransitionColor(mix(prev, next, t))
      }
      if (r < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = 0
        setTransitionColor(rgba(next))
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = 0
    }
  }, [transitionProperty, transitionDuration, color])

  return transitionColor
}

const isTransitionColor = (v: unknown): boolean => {
  if (Array.isArray(v)) {
    return v.some(isTransitionColor)
  }
  return v === 'all' || v === 'color'
}

type Rgba = [number, number, number, number]
const rgba = ([r, g, b, a]: Rgba) => `rgba(${r},${g},${b},${a})`

const mix = ([r1, g1, b1, a1]: Rgba, [r2, g2, b2, a2]: Rgba, t: number) => {
  const r = Math.round(lerp(r1, r2, t))
  const g = Math.round(lerp(g1, g2, t))
  const b = Math.round(lerp(b1, b2, t))
  const a = Math.round(lerp(a1, a2, t))
  return rgba([r, g, b, a])
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const easings = {
  ease: BezierEasing(0.25, 0.1, 0.25, 1),
  linear: (t: number) => t,
  'ease-in': BezierEasing(0.4, 0, 1, 1),
  'ease-out': BezierEasing(0, 0, 0.2, 1),
  'ease-in-out': BezierEasing(0.4, 0, 0.2, 1),
}
type Easing = keyof typeof easings
