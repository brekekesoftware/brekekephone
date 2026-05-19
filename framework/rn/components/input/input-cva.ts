import type { Variant } from '@/rn/core/tw/cva'
import { cva } from '@/rn/core/tw/cva'

export const inputCva = cva({
  classNames: {
    container: 'border transition-colors',
    label: 'text-black dark:text-white',
    placeholder: 'text-gray-300 dark:text-gray-600',
    chevron: 'text-gray-400 dark:text-gray-500',
  },
  attributes: {
    appearance: {
      outlined: {
        container:
          'border-gray-200 bg-white focus:border-black dark:border-gray-700 dark:bg-black dark:focus:border-white',
      },
      filled: {
        container:
          'border-transparent bg-gray-100 focus:border-black dark:bg-gray-800 dark:focus:border-white',
        placeholder: 'text-gray-400 dark:text-gray-500',
      },
      ghost: {
        container:
          'border-transparent bg-transparent focus:border-black dark:focus:border-white',
        placeholder: 'text-gray-400 dark:text-gray-500',
      },
      underlined: {
        container:
          'border-transparent border-b-gray-200 bg-transparent focus:border-b-black dark:border-b-gray-700 dark:focus:border-b-white',
        placeholder: 'text-gray-400 dark:text-gray-500',
      },
    },
    size: {
      sm: {
        container: 'h-7 px-2 text-xs',
        label: 'text-xs',
        placeholder: 'text-xs',
        chevron: 'text-xs',
      },
      md: {
        container: 'h-9 px-2.5 text-sm',
        label: 'text-sm',
        placeholder: 'text-sm',
        chevron: 'text-sm',
      },
      lg: {
        container: 'h-11 px-3 text-base',
        label: 'text-base',
        placeholder: 'text-base',
        chevron: 'text-base',
      },
    },
    shape: {
      none: { container: 'rounded-none' },
      rounded: { container: 'rounded-md' },
      pill: { container: 'rounded-full' },
    },
    disabled: {
      true: { container: 'cursor-not-allowed opacity-50' },
    },
    active: {
      true: {},
    },
    invalid: {
      true: {},
    },
  },
  compoundVariants: [
    {
      appearance: 'underlined',
      shape: 'rounded',
      classNames: { container: 'rounded-none' },
    },
    {
      appearance: 'underlined',
      shape: 'pill',
      classNames: { container: 'rounded-none' },
    },
    {
      appearance: 'outlined',
      active: true,
      classNames: { container: 'border-black dark:border-white' },
    },
    {
      appearance: 'filled',
      active: true,
      classNames: { container: 'border-black dark:border-white' },
    },
    {
      appearance: 'ghost',
      active: true,
      classNames: { container: 'border-black dark:border-white' },
    },
    {
      appearance: 'underlined',
      active: true,
      classNames: { container: 'border-b-black dark:border-b-white' },
    },
    {
      appearance: 'outlined',
      invalid: true,
      classNames: { container: 'border-error focus:border-error' },
    },
    {
      appearance: 'filled',
      invalid: true,
      classNames: { container: 'border-error focus:border-error' },
    },
    {
      appearance: 'ghost',
      invalid: true,
      classNames: { container: 'border-error focus:border-error' },
    },
    {
      appearance: 'underlined',
      invalid: true,
      classNames: { container: 'border-b-error focus:border-b-error' },
    },
  ],
})

export type InputCva = Variant<typeof inputCva>
