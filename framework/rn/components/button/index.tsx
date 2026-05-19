'use client'

import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { useButtonMouseDown } from '@/rn/components/button/use-button-mouse-down'
import { InsetShadow } from '@/rn/components/inset'
import { useRipple } from '@/rn/components/ripple'
import { Slot, Slottable } from '@/rn/components/slot'
import { Spinner } from '@/rn/components/spinner'
import { Span } from '@/rn/components/text'
import { TextStyleProvider } from '@/rn/components/text/text-style-context'
import type { PressableProps } from '@/rn/core/components/pressable'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import type { Variant } from '@/rn/core/tw/cva'
import { cva } from '@/rn/core/tw/cva'
import { composeHandlers } from '@/rn/core/utils/compose-handlers'
import { isWeb } from '@/rn/core/utils/platform'

const buttonCva = cva({
  classNames: {
    container: 'group',
    button:
      'flex cursor-pointer flex-row items-center justify-center gap-2 overflow-hidden transition',
    // fix active: selector and press in to work with
    // touch pad or any mouse up happens too quickly
    buttonActive: '',
    text: 'select-none font-medium text-white',
    elevationBackdrop:
      'pointer-events-none absolute bottom-[1px] left-[1px] right-[1px] top-1 bg-gray-400 dark:bg-gray-700',
    border:
      'pointer-events-none absolute inset-0 border border-transparent transition',
    inset: 'rounded',
    spinner: '',
  },
  attributes: {
    type: {
      basic: {},
      primary: {},
      secondary: {},
      info: {},
      success: {},
      warning: {},
      error: {},
    },
    appearance: {
      solid: {},
      soft: {},
      outline: {},
      ghost: {},
      transparent: {},
    },
    size: {
      sm: {
        button: 'h-7 px-2',
        text: 'text-sm',
        spinner: 'h-3 w-3',
      },
      md: {
        button: 'h-8 px-3',
        text: 'text-base',
      },
      lg: {
        button: 'h-10 px-4',
        text: 'text-lg',
        spinner: 'h-5 w-5',
      },
    },
    shape: {
      none: {},
      rounded: {
        button: 'rounded-lg',
        elevationBackdrop: 'rounded-lg',
        border: 'rounded-lg',
        inset: 'rounded-lg',
      },
      pill: {
        button: 'rounded-full',
        elevationBackdrop: 'rounded-full',
        border: 'rounded-full',
        inset: 'rounded-full',
      },
    },
    elevation: {
      true: {
        container: 'pb-1',
        button: 'active:translate-y-0.5',
        buttonActive: 'translate-y-0.5',
      },
    },
    inset: {
      true: {},
    },
    disabled: {
      true: {
        container: 'cursor-not-allowed opacity-70',
      },
    },
    groupFirst: {
      true: {},
    },
    groupLast: {
      true: {},
    },
  },
  compoundVariants: [
    // ========================================================================
    // shape
    {
      size: 'sm',
      shape: 'rounded',
      classNames: {
        button: 'rounded-md',
        elevationBackdrop: 'rounded-md',
        border: 'rounded-md',
        inset: 'rounded-md',
      },
    },
    {
      size: 'lg',
      shape: 'rounded',
      classNames: {
        button: 'rounded-xl',
        elevationBackdrop: 'rounded-xl',
        border: 'rounded-xl',
        inset: 'rounded-xl',
      },
    },
    // ========================================================================
    // group first
    {
      size: 'sm',
      shape: 'rounded',
      groupFirst: true,
      classNames: {
        button: 'rounded-l-md rounded-r-none',
        border: 'rounded-l-md rounded-r-none',
        inset: 'rounded-l-md rounded-r-none',
      },
    },
    {
      size: 'md',
      shape: 'rounded',
      groupFirst: true,
      classNames: {
        button: 'rounded-l-lg rounded-r-none',
        border: 'rounded-l-lg rounded-r-none',
        inset: 'rounded-l-lg rounded-r-none',
      },
    },
    {
      size: 'lg',
      shape: 'rounded',
      groupFirst: true,
      classNames: {
        button: 'rounded-l-xl rounded-r-none',
        border: 'rounded-l-xl rounded-r-none',
        inset: 'rounded-l-xl rounded-r-none',
      },
    },
    {
      shape: 'pill',
      groupFirst: true,
      classNames: {
        button: 'rounded-l-full rounded-r-none',
        border: 'rounded-l-full rounded-r-none',
        inset: 'rounded-l-full rounded-r-none',
      },
    },
    // ========================================================================
    // group last
    {
      size: 'sm',
      shape: 'rounded',
      groupLast: true,
      classNames: {
        button: 'rounded-l-none rounded-r-md',
        border: 'rounded-l-none rounded-r-md',
        inset: 'rounded-l-none rounded-r-md',
      },
    },
    {
      size: 'md',
      shape: 'rounded',
      groupLast: true,
      classNames: {
        button: 'rounded-l-none rounded-r-lg',
        border: 'rounded-l-none rounded-r-lg',
        inset: 'rounded-l-none rounded-r-lg',
      },
    },
    {
      size: 'lg',
      shape: 'rounded',
      groupLast: true,
      classNames: {
        button: 'rounded-l-none rounded-r-xl',
        border: 'rounded-l-none rounded-r-xl',
        inset: 'rounded-l-none rounded-r-xl',
      },
    },
    {
      shape: 'pill',
      groupLast: true,
      classNames: {
        button: 'rounded-l-none rounded-r-full',
        border: 'rounded-l-none rounded-r-full',
        inset: 'rounded-l-none rounded-r-full',
      },
    },
    // ========================================================================
    // solid
    {
      type: 'basic',
      appearance: 'solid',
      classNames: {
        button: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-600',
        buttonActive: 'bg-gray-600',
        border: 'border-gray-500/0',
        text: 'text-white',
        spinner: 'border-white border-t-transparent',
      },
    },
    {
      type: 'primary',
      appearance: 'solid',
      classNames: {
        button: 'bg-primary hover:bg-primary-600 active:bg-primary-600',
        buttonActive: 'bg-primary-600',
        border: 'border-primary/0',
      },
    },
    {
      type: 'secondary',
      appearance: 'solid',
      classNames: {
        button: 'bg-secondary hover:bg-secondary-600 active:bg-secondary-600',
        buttonActive: 'bg-secondary-600',
        border: 'border-secondary/0',
      },
    },
    {
      type: 'info',
      appearance: 'solid',
      classNames: {
        button: 'bg-info hover:bg-info-600 active:bg-info-600',
        buttonActive: 'bg-info-600',
        border: 'border-info/0',
      },
    },
    {
      type: 'success',
      appearance: 'solid',
      classNames: {
        button: 'bg-success hover:bg-success-600 active:bg-success-600',
        buttonActive: 'bg-success-600',
        border: 'border-success/0',
      },
    },
    {
      type: 'warning',
      appearance: 'solid',
      classNames: {
        button: 'bg-warning hover:bg-warning-600 active:bg-warning-600',
        buttonActive: 'bg-warning-600',
        border: 'border-warning/0',
      },
    },
    {
      type: 'error',
      appearance: 'solid',
      classNames: {
        button: 'bg-error hover:bg-error-600 active:bg-error-600',
        buttonActive: 'bg-error-600',
        border: 'border-error/0',
      },
    },
    // ========================================================================
    // soft
    {
      type: 'basic',
      appearance: 'soft',
      classNames: {
        button:
          'bg-gray-100 hover:bg-gray-200 active:bg-gray-200 dark:bg-gray-600 hover:dark:bg-gray-700 dark:active:bg-gray-700',
        buttonActive: 'bg-gray-200 dark:bg-gray-700',
        border: 'border-gray-100/0 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        spinner: 'border-gray-700 border-t-transparent',
      },
    },
    {
      type: 'primary',
      appearance: 'soft',
      classNames: {
        button: 'bg-primary-100 hover:bg-primary-200 active:bg-primary-200',
        buttonActive: 'bg-primary-200',
        border: 'border-primary-100/0',
        text: 'text-primary',
        spinner: 'border-primary border-t-transparent',
      },
    },
    {
      type: 'secondary',
      appearance: 'soft',
      classNames: {
        button:
          'bg-secondary-100 hover:bg-secondary-200 active:bg-secondary-200',
        buttonActive: 'bg-secondary-200',
        border: 'border-secondary-100/0',
        text: 'text-secondary',
        spinner: 'border-secondary border-t-transparent',
      },
    },
    {
      type: 'info',
      appearance: 'soft',
      classNames: {
        button: 'bg-info-100 hover:bg-info-200 active:bg-info-200',
        buttonActive: 'bg-info-200',
        border: 'border-info-100/0',
        text: 'text-info',
        spinner: 'border-info border-t-transparent',
      },
    },
    {
      type: 'success',
      appearance: 'soft',
      classNames: {
        button: 'bg-success-100 hover:bg-success-200 active:bg-success-200',
        buttonActive: 'bg-success-200',
        border: 'border-success-100/0',
        text: 'text-success',
        spinner: 'border-success border-t-transparent',
      },
    },
    {
      type: 'warning',
      appearance: 'soft',
      classNames: {
        button: 'bg-warning-100 hover:bg-warning-200 active:bg-warning-200',
        buttonActive: 'bg-warning-200',
        border: 'border-warning-100/0',
        text: 'text-warning',
        spinner: 'border-warning border-t-transparent',
      },
    },
    {
      type: 'error',
      appearance: 'soft',
      classNames: {
        button: 'bg-error-100 hover:bg-error-200 active:bg-error-200',
        buttonActive: 'bg-error-200',
        border: 'border-error-100/0',
        text: 'text-error',
        spinner: 'border-error border-t-transparent',
      },
    },
    // ========================================================================
    // outline
    {
      type: 'basic',
      appearance: 'outline',
      classNames: {
        button:
          'bg-transparent hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-800',
        buttonActive: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-600',
        text: 'text-gray-800 dark:text-gray-200',
        spinner:
          'border-gray-600 border-t-transparent dark:border-gray-300 dark:border-t-transparent',
      },
    },
    {
      type: 'primary',
      appearance: 'outline',
      classNames: {
        button: 'bg-primary-100/0 hover:bg-primary-100 active:bg-primary-100',
        buttonActive: 'bg-primary-100',
        border: 'border-primary',
        text: 'text-primary',
        spinner: 'border-primary border-t-transparent',
      },
    },
    {
      type: 'secondary',
      appearance: 'outline',
      classNames: {
        button:
          'bg-secondary-100/0 hover:bg-secondary-100 active:bg-secondary-100',
        buttonActive: 'bg-secondary-100',
        border: 'border-secondary',
        text: 'text-secondary',
        spinner: 'border-secondary border-t-transparent',
      },
    },
    {
      type: 'info',
      appearance: 'outline',
      classNames: {
        button: 'bg-info-100/0 hover:bg-info-100 active:bg-info-100',
        buttonActive: 'bg-info-100',
        border: 'border-info',
        text: 'text-info',
        spinner: 'border-info border-t-transparent',
      },
    },
    {
      type: 'success',
      appearance: 'outline',
      classNames: {
        button: 'bg-success-100/0 hover:bg-success-100 active:bg-success-100',
        buttonActive: 'bg-success-100',
        border: 'border-success',
        text: 'text-success',
        spinner: 'border-success border-t-transparent',
      },
    },
    {
      type: 'warning',
      appearance: 'outline',
      classNames: {
        button: 'bg-warning-100/0 hover:bg-warning-100 active:bg-warning-100',
        buttonActive: 'bg-warning-100',
        border: 'border-warning',
        text: 'text-warning',
        spinner: 'border-warning border-t-transparent',
      },
    },
    {
      type: 'error',
      appearance: 'outline',
      classNames: {
        button: 'bg-error-100/0 hover:bg-error-100 active:bg-error-100',
        buttonActive: 'bg-error-100',
        border: 'border-error',
        text: 'text-error',
        spinner: 'border-error border-t-transparent',
      },
    },
    // ========================================================================
    // ghost
    {
      type: 'basic',
      appearance: 'ghost',
      classNames: {
        button:
          'bg-transparent hover:bg-gray-100 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-800',
        buttonActive: 'bg-gray-100 dark:bg-gray-800',
        border: 'border-gray-100/0',
        text: 'text-gray-800 dark:text-gray-200',
        spinner:
          'border-gray-600 border-t-transparent dark:border-gray-300 dark:border-t-transparent',
      },
    },
    {
      type: 'primary',
      appearance: 'ghost',
      classNames: {
        button: 'bg-primary-100/0 hover:bg-primary-100 active:bg-primary-100',
        buttonActive: 'bg-primary-100',
        border: 'border-primary-100/0',
        text: 'text-primary',
        spinner: 'border-primary border-t-transparent',
      },
    },
    {
      type: 'secondary',
      appearance: 'ghost',
      classNames: {
        button:
          'bg-secondary-100/0 hover:bg-secondary-100 active:bg-secondary-100',
        buttonActive: 'bg-secondary-100',
        border: 'border-secondary-100/0',
        text: 'text-secondary',
        spinner: 'border-secondary border-t-transparent',
      },
    },
    {
      type: 'info',
      appearance: 'ghost',
      classNames: {
        button: 'bg-info-100/0 hover:bg-info-100 active:bg-info-100',
        buttonActive: 'bg-info-100',
        border: 'border-info-100/0',
        text: 'text-info',
        spinner: 'border-info border-t-transparent',
      },
    },
    {
      type: 'success',
      appearance: 'ghost',
      classNames: {
        button: 'bg-success-100/0 hover:bg-success-100 active:bg-success-100',
        buttonActive: 'bg-success-100',
        border: 'border-success-100/0',
        text: 'text-success',
        spinner: 'border-success border-t-transparent',
      },
    },
    {
      type: 'warning',
      appearance: 'ghost',
      classNames: {
        button: 'bg-warning-100/0 hover:bg-warning-100 active:bg-warning-100',
        buttonActive: 'bg-warning-100',
        border: 'border-warning-100/0',
        text: 'text-warning',
        spinner: 'border-warning border-t-transparent',
      },
    },
    {
      type: 'error',
      appearance: 'ghost',
      classNames: {
        button: 'bg-error-100/0 hover:bg-error-100 active:bg-error-100',
        buttonActive: 'bg-error-100',
        border: 'border-error-100/0',
        text: 'text-error',
        spinner: 'border-error border-t-transparent',
      },
    },
    // ========================================================================
    // transparent
    {
      type: 'basic',
      appearance: 'transparent',
      classNames: {
        button: 'bg-transparent',
        text: 'text-gray-800 dark:text-gray-200',
        spinner:
          'border-gray-600 border-t-transparent dark:border-gray-300 dark:border-t-transparent',
      },
    },
    {
      type: 'primary',
      appearance: 'transparent',
      classNames: {
        button: 'bg-transparent',
        text: 'text-primary',
        spinner: 'border-primary border-t-transparent',
      },
    },
    {
      type: 'secondary',
      appearance: 'transparent',
      classNames: {
        button: 'bg-transparent',
        text: 'text-secondary',
        spinner: 'border-secondary border-t-transparent',
      },
    },
    {
      type: 'info',
      appearance: 'transparent',
      classNames: {
        button: 'bg-transparent',
        text: 'text-info',
        spinner: 'border-info border-t-transparent',
      },
    },
    {
      type: 'success',
      appearance: 'transparent',
      classNames: {
        button: 'bg-transparent',
        text: 'text-success',
        spinner: 'border-success border-t-transparent',
      },
    },
    {
      type: 'warning',
      appearance: 'transparent',
      classNames: {
        button: 'bg-transparent',
        text: 'text-warning',
        spinner: 'border-warning border-t-transparent',
      },
    },
    {
      type: 'error',
      appearance: 'transparent',
      classNames: {
        button: 'bg-transparent',
        text: 'text-error',
        spinner: 'border-error border-t-transparent',
      },
    },
  ],
})

export type ButtonProps = Variant<typeof buttonCva> &
  Omit<PressableProps, 'children'> &
  PropsWithChildren<{
    containerClassName?: ClassName
    elevationBackdrop?: boolean
    elevationBackdropClassName?: ClassName
    insetEnabled?: boolean
    ripple?: boolean
    rippleClassName?: ClassName
    loading?: boolean
    loadingChildren?: string
    asChild?: boolean
  }>

export const Button = ({
  type = 'basic',
  appearance = 'solid',
  size = 'md',
  shape = 'rounded',
  disabled,
  className,
  children,
  onPress,
  containerClassName,
  elevation = true,
  elevationBackdrop = true,
  elevationBackdropClassName,
  inset = true,
  insetEnabled,
  ripple = true,
  rippleClassName,
  loading,
  loadingChildren,
  groupFirst,
  groupLast,
  asChild,
  ...props
}: ButtonProps) => {
  const isSolidOrSoft = appearance === 'solid' || appearance === 'soft'

  ripple = ripple && isSolidOrSoft
  elevationBackdrop = elevation && elevationBackdrop && isSolidOrSoft

  // add support for built in on press promise loading
  const [onPressLoading, setLoading] = useState(false)
  if (onPress) {
    Object.assign(props, {
      onPress: (e: any) => {
        const r: any = onPress(e)
        if (!r?.finally) {
          return r
        }
        setLoading(true)
        r.finally(() => setLoading(false))
        return r
      },
    })
  }

  const [pressing, setPressing] = useState(false)
  // for web, event listener is already added below
  if (!isWeb && inset) {
    props = composeHandlers(props, {
      onPressIn: () => setPressing(true),
      onPressOut: () => setPressing(false),
    })
  }
  // fix active: selector and press in to work with
  // touch pad or any mouse up happens too quickly
  const jsxFixWebPressIn = useButtonMouseDown(setPressing)

  loading = loading || onPressLoading
  disabled = disabled || loading

  const cn = buttonCva({
    type,
    appearance,
    size,
    shape,
    elevation,
    disabled,
    groupFirst,
    groupLast,
  })

  const [jsxRipples, propsForRipples] = useRipple({
    className: rippleClassName,
  })
  if (ripple) {
    props = composeHandlers(props, propsForRipples)
  }

  const Comp = asChild ? Slot : Pressable

  return (
    <View
      className={[cn.container, containerClassName]}
      // rasterize to fix opacity
      renderToHardwareTextureAndroid={disabled}
      shouldRasterizeIOS={disabled}
    >
      {elevationBackdrop && (
        <View className={[cn.elevationBackdrop, elevationBackdropClassName]} />
      )}
      <TextStyleProvider className={cn.text}>
        <Comp
          {...props}
          className={[cn.button, pressing && cn.buttonActive, className]}
          disabled={disabled}
        >
          {jsxFixWebPressIn}
          {/* fix react native border inconsistent behavior */}
          <View className={cn.border} />
          {inset && (
            <InsetShadow
              enabled={pressing || insetEnabled}
              className={cn.inset}
            />
          )}
          {ripple && jsxRipples}
          {loading && <Spinner className={cn.spinner} />}
          {!asChild ? (
            <Span>
              {loading && loadingChildren ? loadingChildren : children}
            </Span>
          ) : (
            <Slottable>
              {loading && loadingChildren ? loadingChildren : children}
            </Slottable>
          )}
        </Comp>
      </TextStyleProvider>
    </View>
  )
}
