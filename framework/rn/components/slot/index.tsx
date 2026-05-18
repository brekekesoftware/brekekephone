'use client'

import type {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  RefAttributes,
} from 'react'
import { Children, cloneElement, forwardRef, isValidElement } from 'react'

import type { AnyProps } from '@/rn/components/slot/utils'
import {
  isSlottable,
  mergeProps,
  SLOTTABLE_TYPE,
} from '@/rn/components/slot/utils'

// ─────────────────────────────────────────────
// Slottable
// ─────────────────────────────────────────────

type SlottableProps = PropsWithChildren

const SlottableUntyped = ({ children }: SlottableProps) => children
const Slottable = Object.assign(SlottableUntyped, {
  $$typeof: SLOTTABLE_TYPE,
})

// ─────────────────────────────────────────────
// Slot
// ─────────────────────────────────────────────

type SlotProps = {
  children?: ReactNode
  [key: string]: any
}

const Slot = forwardRef<unknown, SlotProps>(
  ({ children, ...slotProps }, ref) => {
    // ── Case 1: children contains a <Slottable> ──────────────────────────
    const childrenArray = Children.toArray(children)
    const slottableIndex = childrenArray.findIndex(isSlottable)

    if (slottableIndex !== -1) {
      const slottable = childrenArray[slottableIndex] as ReactElement<{
        children: ReactNode
      }>
      // The "real" child lives inside <Slottable>
      const newSlottableChild = slottable.props.children

      // Build the final children: replace Slottable with the real child's children
      const newChildren = [
        ...childrenArray.slice(0, slottableIndex),
        (newSlottableChild as any).props.children,
        ...childrenArray.slice(slottableIndex + 1),
      ]

      return (
        <SlotClone {...slotProps} ref={ref}>
          {isValidElement(newSlottableChild)
            ? cloneElement(newSlottableChild, undefined, ...newChildren)
            : newChildren.length === 1
              ? newChildren[0]
              : newChildren}
        </SlotClone>
      )
    }

    // ── Case 2: plain single child ───────────────────────────────────────
    return (
      <SlotClone {...slotProps} ref={ref}>
        {children}
      </SlotClone>
    )
  },
)

Slot.displayName = 'Slot'

// ─────────────────────────────────────────────
// SlotClone — does the actual cloneElement
// ─────────────────────────────────────────────

type SlotCloneProps = {
  children: ReactNode
  [key: string]: unknown
}

const SlotClone = forwardRef<unknown, SlotCloneProps>(
  ({ children, ...slotProps }, ref) => {
    if (!isValidElement(children)) {
      // Guard: if no valid child, render nothing (dev warning would go here)
      if (
        process.env.NODE_ENV !== 'production' &&
        Children.count(children) > 1
      ) {
        throw new Error('Slot expects a single React element as its child.')
      }
      return null
    }

    const childProps = children.props as AnyProps
    const merged = mergeProps(slotProps, childProps)

    // Attach ref if the child can hold one
    if (ref !== null) {
      merged.ref = ref
    } else if ((children as RefAttributes<unknown>).ref) {
      merged.ref = (children as RefAttributes<unknown>).ref
    }

    return cloneElement(children, merged)
  },
)

SlotClone.displayName = 'SlotClone'

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export { Slot, Slottable }
export type { SlotProps, SlottableProps }
