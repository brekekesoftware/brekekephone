'use client'

import type { PropsWithChildren } from 'react'
import { createContext } from 'react'

import type { PressableProps } from '@/rn/core/components/pressable'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import type { Variant } from '@/rn/core/tw/cva'
import { cva } from '@/rn/core/tw/cva'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { useSafeContext } from '@/rn/core/utils/use-safe-context'
import type { ValueProps } from '@/shared/ts-utils'

const radioCva = cva({
  classNames: {
    container:
      'items-center justify-center rounded-full border-2 border-gray-300 transition-colors dark:border-gray-600',
    dot: 'rounded-full',
  },
  attributes: {
    size: {
      sm: { container: 'h-4 w-4', dot: 'h-2 w-2' },
      md: { container: 'h-5 w-5', dot: 'h-2.5 w-2.5' },
      lg: { container: 'h-6 w-6', dot: 'h-3 w-3' },
    },
    type: {
      basic: {},
      primary: {},
      secondary: {},
      info: {},
      success: {},
      warning: {},
      error: {},
    },
    checked: {
      true: {},
    },
    disabled: {
      true: { container: 'cursor-not-allowed opacity-50' },
    },
  },
  compoundVariants: [
    {
      checked: true,
      type: 'basic',
      classNames: {
        container: 'border-gray-800 dark:border-white',
        dot: 'bg-gray-800 dark:bg-white',
      },
    },
    {
      checked: true,
      type: 'primary',
      classNames: { container: 'border-primary', dot: 'bg-primary' },
    },
    {
      checked: true,
      type: 'secondary',
      classNames: { container: 'border-secondary', dot: 'bg-secondary' },
    },
    {
      checked: true,
      type: 'info',
      classNames: { container: 'border-info', dot: 'bg-info' },
    },
    {
      checked: true,
      type: 'success',
      classNames: { container: 'border-success', dot: 'bg-success' },
    },
    {
      checked: true,
      type: 'warning',
      classNames: { container: 'border-warning', dot: 'bg-warning' },
    },
    {
      checked: true,
      type: 'error',
      classNames: { container: 'border-error', dot: 'bg-error' },
    },
  ],
})

// standalone Radio

export type RadioProps = Omit<PressableProps, 'children' | 'onPress'> &
  Variant<typeof radioCva> &
  ValueProps<boolean>

export const Radio = ({
  type = 'primary',
  size = 'md',
  disabled,
  value,
  defaultValue = false,
  onChange,
  className,
  ...props
}: RadioProps) => {
  const [checked, setChecked] = useControllableState({
    value,
    defaultValue,
    onChange,
  })

  const cn = radioCva({ type, size, checked, disabled })

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={() => setChecked(v => !v)}
      className={[cn.container, className]}
      renderToHardwareTextureAndroid={disabled}
      shouldRasterizeIOS={disabled}
    >
      {checked && <View className={cn.dot} />}
    </Pressable>
  )
}

// RadioGroup context

type RadioGroupCtx = {
  type: RadioProps['type']
  size: RadioProps['size']
  disabled?: boolean
  value: string
  onSelect: (v: string) => void
}

const RadioGroupContext = createContext<RadioGroupCtx | undefined>(undefined)
const useRadioGroup = () => useSafeContext(RadioGroupContext)

// RadioGroup root

export type RadioGroupProps = PropsWithChildren<
  Pick<RadioProps, 'type' | 'size' | 'disabled' | 'className'> &
    ValueProps<string>
>

const Root = ({
  type = 'primary',
  size = 'md',
  disabled,
  value,
  defaultValue = '',
  onChange,
  className,
  children,
}: RadioGroupProps) => {
  const [state, setState] = useControllableState({
    value,
    defaultValue,
    onChange,
  })

  return (
    <RadioGroupContext.Provider
      value={{ type, size, disabled, value: state, onSelect: setState }}
    >
      <View className={className}>{children}</View>
    </RadioGroupContext.Provider>
  )
}

// RadioGroup item

export type RadioGroupItemProps = Omit<PressableProps, 'onPress'> & {
  value: string
  type?: RadioProps['type']
  disabled?: boolean
}

const Item = ({
  value,
  type,
  disabled,
  className,
  children,
  ...props
}: RadioGroupItemProps) => {
  const {
    type: ctxType,
    size,
    disabled: ctxDisabled,
    value: ctxValue,
    onSelect,
  } = useRadioGroup()

  const isDisabled = disabled || ctxDisabled
  const checked = ctxValue === value
  const cn = radioCva({
    type: type || ctxType,
    size,
    checked,
    disabled: isDisabled,
  })

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      onPress={() => onSelect(value)}
      className={[cn.container, className]}
      renderToHardwareTextureAndroid={isDisabled}
      shouldRasterizeIOS={isDisabled}
    >
      {checked && <View className={cn.dot} />}
      {children}
    </Pressable>
  )
}

export const RadioGroup = Object.assign(Root, { Item })
