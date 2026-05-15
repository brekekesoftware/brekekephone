'use client'

import type { ReactElement } from 'react'
import { Children, cloneElement, createContext } from 'react'

import type { ButtonProps } from '@/rn/components/button'
import { Button } from '@/rn/components/button'
import { View } from '@/rn/core/components/view'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { useSafeContext } from '@/rn/core/utils/use-safe-context'
import type { SingleOrMultipleProps } from '@/shared/ts-utils'

// context

type ToggleGroupCommonProps = Pick<
  ButtonProps,
  'type' | 'size' | 'appearance' | 'shape' | 'inset' | 'ripple' | 'disabled'
> & {
  activeAppearance?: ButtonProps['appearance']
}
type ToggleGroupCtx = ToggleGroupCommonProps & {
  count: number
  value: string[]
  onToggle: (v: string) => void
}

const ToggleGroupContext = createContext<ToggleGroupCtx | undefined>(undefined)
const useToggleGroup = () => useSafeContext(ToggleGroupContext)

// root

export type ToggleGroupProps = SingleOrMultipleProps &
  ToggleGroupCommonProps &
  Pick<ButtonProps, 'className' | 'children'>

export const ToggleGroup = ({
  multiple,
  type = 'primary',
  size = 'md',
  shape = 'rounded',
  appearance = 'outline',
  activeAppearance = 'solid',
  inset = true,
  ripple = true,
  disabled,
  className,
  children,
  value,
  defaultValue,
  onChange,
}: ToggleGroupProps) => {
  const [state, setState] = useControllableState<string | string[]>({
    value,
    defaultValue,
    onChange: v => {
      if (!multiple && typeof v !== 'string') {
        return
      }
      if (multiple && !Array.isArray(v)) {
        return
      }
      onChange?.(v as any)
    },
  })

  const stateArr: string[] = state
    ? Array.isArray(state)
      ? state
      : [state]
    : []

  const onToggle = (v: string) => {
    if (!multiple) {
      setState(state === v ? '' : v)
    } else {
      const next = stateArr.includes(v)
        ? stateArr.filter(x => x !== v)
        : [...stateArr, v]
      setState(next)
    }
  }

  const arr = Children.toArray(children)
  const count = arr.length

  children = arr.map((_c, i) => {
    const c = _c as ReactElement<ToggleItemProps>
    return cloneElement(c, { __index: i })
  })

  return (
    <ToggleGroupContext.Provider
      value={{
        type,
        size,
        shape,
        appearance,
        activeAppearance,
        inset,
        ripple,
        disabled,
        count,
        value: stateArr,
        onToggle,
      }}
    >
      <View className={['flex-row', className]}>{children}</View>
    </ToggleGroupContext.Provider>
  )
}

// item

export type ToggleItemProps = Pick<
  ButtonProps,
  'type' | 'disabled' | 'className' | 'children'
> & {
  value: string
  __index?: number
}

export const ToggleItem = ({
  value,
  type,
  disabled,
  className,
  children,
  __index = 0,
}: ToggleItemProps) => {
  const {
    type: ctxType,
    size,
    shape,
    appearance,
    activeAppearance,
    inset,
    ripple,
    disabled: ctxDisabled,
    count,
    value: ctxValue,
    onToggle,
  } = useToggleGroup()

  const isActive = ctxValue.includes(value)
  const isOnlyChild = count === 1
  const isFirst = __index === 0
  const isLast = __index === count - 1
  const isMiddle = !isFirst && !isLast

  const thisAppearance = isActive ? activeAppearance : appearance
  const isOutline = appearance === 'outline' || activeAppearance === 'outline'

  return (
    <Button
      type={type || ctxType}
      appearance={thisAppearance}
      size={size}
      shape={isOnlyChild || isMiddle ? 'none' : shape}
      groupFirst={!isOnlyChild && isFirst}
      groupLast={!isOnlyChild && isLast}
      elevation={false}
      inset={inset}
      insetEnabled={inset && isActive}
      ripple={ripple}
      disabled={disabled || ctxDisabled}
      className={[isOutline && !isFirst && 'ml-[-1px]', className]}
      onPress={() => onToggle(value)}
    >
      {children}
    </Button>
  )
}
