'use client'

import type { ReactNode } from 'react'
import { createContext } from 'react'

import { Slot } from '@/rn/components/slot'
import type { PressableProps } from '@/rn/core/components/pressable'
import { Pressable } from '@/rn/core/components/pressable'
import type { Variant } from '@/rn/core/tw/cva'
import { cva } from '@/rn/core/tw/cva'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { useSafeContext } from '@/rn/core/utils/use-safe-context'
import { Check } from '@/rn/svg-icons/check'

// ─────────────────────────────────────────────
// context
// ─────────────────────────────────────────────

type CheckboxIndicatorContextType = {
  cn: ReturnType<typeof checkboxCva>
  checked: boolean
}

const CheckboxIndicatorContext = createContext<
  CheckboxIndicatorContextType | undefined
>(undefined)
const useCheckboxIndicator = () => useSafeContext(CheckboxIndicatorContext)

// ─────────────────────────────────────────────
// cva
// ─────────────────────────────────────────────

const checkboxCva = cva({
  classNames: {
    container:
      'items-center justify-center rounded-md border border-gray-300 bg-transparent transition-colors dark:border-gray-600',
    icon: '',
  },
  attributes: {
    size: {
      sm: {
        container: 'h-4 w-4 rounded',
        icon: 'text-[10px]',
      },
      md: {
        container: 'h-5 w-5',
        icon: 'text-xs',
      },
      lg: {
        container: 'h-6 w-6',
        icon: 'text-sm',
      },
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
      true: {
        container: 'cursor-not-allowed opacity-50',
      },
    },
  },
  compoundVariants: [
    {
      checked: true,
      type: 'basic',
      classNames: {
        container:
          'border-gray-800 bg-gray-800 dark:border-white dark:bg-white',
        icon: 'text-white dark:text-gray-800',
      },
    },
    {
      checked: true,
      type: 'primary',
      classNames: {
        container: 'border-primary bg-primary',
        icon: 'text-white',
      },
    },
    {
      checked: true,
      type: 'secondary',
      classNames: {
        container: 'border-secondary bg-secondary',
        icon: 'text-white',
      },
    },
    {
      checked: true,
      type: 'info',
      classNames: {
        container: 'border-info bg-info',
        icon: 'text-white',
      },
    },
    {
      checked: true,
      type: 'success',
      classNames: {
        container: 'border-success bg-success',
        icon: 'text-white',
      },
    },
    {
      checked: true,
      type: 'warning',
      classNames: {
        container: 'border-warning bg-warning',
        icon: 'text-white',
      },
    },
    {
      checked: true,
      type: 'error',
      classNames: {
        container: 'border-error bg-error',
        icon: 'text-white',
      },
    },
  ],
})

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────

export type CheckboxProps = Omit<PressableProps, 'onPress'> &
  Variant<typeof checkboxCva> & {
    defaultChecked?: boolean
    onChange?: (checked: boolean) => void
  }

const Root = ({
  type = 'primary',
  size = 'md',
  disabled,
  className,
  checked,
  defaultChecked,
  onChange,
  children,
  ...props
}: CheckboxProps) => {
  const [value, setValue] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  })

  const cn = checkboxCva({ type, size, checked: value, disabled })

  return (
    <Pressable
      {...props}
      onPress={disabled ? undefined : () => setValue(v => !v)}
      className={[cn.container, className]}
      renderToHardwareTextureAndroid={disabled}
      shouldRasterizeIOS={disabled}
    >
      <CheckboxIndicatorContext.Provider value={{ cn, checked: value }}>
        {children || <Indicator />}
      </CheckboxIndicatorContext.Provider>
    </Pressable>
  )
}

// ─────────────────────────────────────────────
// Indicator
// ─────────────────────────────────────────────

export type CheckboxIndicatorProps = {
  asChild?: boolean
  children?: ReactNode
}

const Indicator = ({ asChild, ...props }: CheckboxIndicatorProps) => {
  const { cn, checked } = useCheckboxIndicator()
  const Comp = asChild ? Slot : Check

  return checked && <Comp className={cn.icon} {...props} />
}

// ─────────────────────────────────────────────
// export
// ─────────────────────────────────────────────

export const Checkbox = Object.assign(Root, {
  Indicator,
})
