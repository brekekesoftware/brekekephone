import { TextStyleProvider } from '@/rn/components/text/text-style-context'
import type { ViewProps } from '@/rn/core/components/view'
import { View } from '@/rn/core/components/view'
import type { Variant } from '@/rn/core/tw/cva'
import { cva } from '@/rn/core/tw/cva'

const badgeCva = cva({
  classNames: {
    container:
      'web:w-fit flex grow-0 flex-row items-center justify-center gap-1.5 overflow-hidden border border-transparent transition-colors',
    text: 'font-medium',
  },
  attributes: {
    size: {
      sm: {
        container: 'px-1.5 py-px',
        text: 'text-xs',
      },
      md: {
        container: 'px-2 py-0.5',
        text: 'text-xs',
      },
      lg: {
        container: 'px-2.5 py-1',
        text: 'text-sm',
      },
    },
    shape: {
      rounded: {
        container: 'rounded-md',
      },
      pill: {
        container: 'rounded-full',
      },
    },
    appearance: {
      soft: {},
      solid: {},
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
  },
  compoundVariants: [
    // =========================================================================
    // solid
    {
      appearance: 'solid',
      type: 'basic',
      classNames: {
        container:
          'border-gray-800 bg-gray-800 dark:border-white dark:bg-white',
        text: 'text-white dark:text-gray-800',
      },
    },
    {
      appearance: 'solid',
      type: 'primary',
      classNames: {
        container: 'border-primary bg-primary',
        text: 'text-white',
      },
    },
    {
      appearance: 'solid',
      type: 'secondary',
      classNames: {
        container: 'border-secondary bg-secondary',
        text: 'text-white',
      },
    },
    {
      appearance: 'solid',
      type: 'info',
      classNames: {
        container: 'border-info bg-info',
        text: 'text-white',
      },
    },
    {
      appearance: 'solid',
      type: 'success',
      classNames: {
        container: 'border-success bg-success',
        text: 'text-white',
      },
    },
    {
      appearance: 'solid',
      type: 'warning',
      classNames: {
        container: 'border-warning bg-warning',
        text: 'text-white',
      },
    },
    {
      appearance: 'solid',
      type: 'error',
      classNames: {
        container: 'border-error bg-error',
        text: 'text-white',
      },
    },
    // =========================================================================
    // soft
    {
      appearance: 'soft',
      type: 'basic',
      classNames: {
        container:
          'border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700',
        text: 'text-gray-700 dark:text-gray-200',
      },
    },
    {
      appearance: 'soft',
      type: 'primary',
      classNames: {
        container:
          'border-primary-300 bg-primary-50 dark:border-primary-200 dark:bg-primary-200',
        text: 'text-primary-500 dark:text-primary-700',
      },
    },
    {
      appearance: 'soft',
      type: 'secondary',
      classNames: {
        container:
          'border-secondary-300 bg-secondary-50 dark:border-secondary-200 dark:bg-secondary-200',
        text: 'text-secondary-500 dark:text-secondary-700',
      },
    },
    {
      appearance: 'soft',
      type: 'info',
      classNames: {
        container:
          'border-info-300 bg-info-50 dark:border-info-200 dark:bg-info-200',
        text: 'text-info-500 dark:text-info-700',
      },
    },
    {
      appearance: 'soft',
      type: 'success',
      classNames: {
        container:
          'border-success-300 bg-success-50 dark:border-success-200 dark:bg-success-200',
        text: 'text-success-500 dark:text-success-700',
      },
    },
    {
      appearance: 'soft',
      type: 'warning',
      classNames: {
        container:
          'border-warning-300 bg-warning-50 dark:border-warning-200 dark:bg-warning-200',
        text: 'text-warning-500 dark:text-warning-700',
      },
    },
    {
      appearance: 'soft',
      type: 'error',
      classNames: {
        container:
          'border-error-300 bg-error-50 dark:border-error-200 dark:bg-error-200',
        text: 'text-error-500 dark:text-error-600',
      },
    },
  ],
})

export type BadgeProps = ViewProps & Variant<typeof badgeCva>

export const Badge = ({
  type = 'basic',
  appearance = 'solid',
  size = 'md',
  shape = 'rounded',
  className,
  children,
  ...props
}: BadgeProps) => {
  const cn = badgeCva({ type, size, shape, appearance })

  return (
    <View {...props} className={[cn.container, className]}>
      <TextStyleProvider className={cn.text}>{children}</TextStyleProvider>
    </View>
  )
}
