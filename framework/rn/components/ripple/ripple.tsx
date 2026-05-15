'use client'

import { useRef, useState } from 'react'

import '@/rn/components/ripple/ripple.css'

import type { ClassName } from '@/rn/core/tw/class-name'
import { clsx } from '@/rn/core/tw/clsx'
import { isClickDOM, useParentDOM } from '@/rn/core/utils/dom'
import { ulid } from '@/shared/ulidx'

export type RippleProps = {
  className?: ClassName
}
export type RippleData = {
  id: string
  x: number
  y: number
  size: number
}

export const Ripple = ({ className }: RippleProps) => {
  const timeoutsRef = useRef<number[]>([])
  const [rippleData, setRippleData] = useState<RippleData[]>([])

  const mousedownAnchor = useParentDOM(dom => {
    const listener = (e: MouseEvent) => {
      if (!isClickDOM(e, dom)) {
        return
      }

      const rect = dom.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = Math.max(x, rect.width - x)
      const dy = Math.max(y, rect.height - y)
      const size = Math.ceil(Math.sqrt(dx * dx + dy * dy) * 2)

      const id = ulid()
      setRippleData(prev => [...prev, { id, x, y, size }])

      const t = window.setTimeout(() => {
        setRippleData(prev => prev.filter(r => r.id !== id))
      }, 1000 + 17)

      timeoutsRef.current.push(t)
    }

    dom.addEventListener('mousedown', listener)

    return () => {
      dom.removeEventListener('mousedown', listener)
      for (const t of timeoutsRef.current) {
        window.clearTimeout(t)
      }
      timeoutsRef.current = []
    }
  })

  const classNameString = clsx('ripple', className) as string

  const ripples = rippleData.map(r => (
    <span
      key={r.id}
      className={classNameString}
      style={{
        left: r.x - r.size / 2,
        top: r.y - r.size / 2,
        width: r.size,
        height: r.size,
      }}
    />
  ))

  return (
    <>
      {mousedownAnchor}
      {ripples}
    </>
  )
}
