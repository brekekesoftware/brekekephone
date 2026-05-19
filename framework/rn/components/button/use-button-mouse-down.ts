'use client'

import { useRef } from 'react'

import { transitionDurationDefault } from '@/rn/core/tw/lib/normalize-style-config-shared'
import { isClickDOM, useParentDOM } from '@/rn/core/utils/dom'

// fix active: selector and press in to work with
// touch pad or any mouse up happens too quickly
export const useButtonMouseDown = (setPressing: Function) => {
  const r = useRef(0)

  const jsx = useParentDOM(dom => {
    const down = (e: MouseEvent) => {
      if (r.current) {
        window.clearTimeout(r.current)
        r.current = 0
      }
      if (!isClickDOM(e, dom)) {
        return
      }
      setPressing(true)
      window.addEventListener('mouseup', up)
    }

    const up = () => {
      r.current = window.setTimeout(
        () => setPressing(false),
        transitionDurationDefault,
      )
      window.removeEventListener('mouseup', up)
    }

    dom.addEventListener('mousedown', down)

    return () => {
      dom.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      if (r.current) {
        window.clearTimeout(r.current)
        r.current = 0
      }
    }
  })

  return jsx
}
