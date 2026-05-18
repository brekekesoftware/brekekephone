'use client'

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import type { PropsWithChildren } from 'react'

import { Portal } from '@/rn/components/portal'
import type { ClassName } from '@/rn/core/tw/class-name'
import { clsx } from '@/rn/core/tw/clsx'

export type DropdownProps = PropsWithChildren<{
  open: boolean
  onClose: () => void
  reference: any
}>

const Item = ({ open, onClose, reference, children }: DropdownProps) => {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: v => !v && onClose(),
    placement: 'bottom-start',
    elements: {
      reference,
    },
    middleware: [
      offset(4),
      flip({
        padding: 8,
      }),
      shift({
        padding: 8,
      }),
      size({
        apply: ({ rects, elements }) => {
          elements.floating.style.minWidth = `${rects.reference.width}px`
        },
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)
  const { getFloatingProps } = useInteractions([dismiss])

  if (!open || !reference) {
    return null
  }

  return (
    <Portal>
      <FloatingFocusManager context={context} modal={false}>
        <div
          ref={refs.setFloating}
          className='z-50 flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900'
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </Portal>
  )
}

// fix rnw not establishing a bounded scroll container
// inside a flex column parent with no fixed height
type ScrollViewProps = PropsWithChildren<{
  className?: ClassName
}>
const ScrollView = ({ children, className }: ScrollViewProps) => {
  const cn = clsx('flex max-h-60 flex-col overflow-y-auto', className) as string
  return <div className={cn}>{children}</div>
}

export const Dropdown = Object.assign(Item, {
  ScrollView,
})
