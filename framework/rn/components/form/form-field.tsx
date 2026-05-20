'use client'

import { View, ViewProps } from '@/rn/core/components/view'
import { cloneElement, isValidElement, ReactElement, ReactNode } from 'react'

import {
  Control,
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form'
import { Span } from '../text'

type Rules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>,
  'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
>

type RenderProps<T extends FieldValues, K extends Path<T>> = {
  invalid: boolean
  value: T[K]
  onChange: (value: T[K]) => void
  onBlur: () => void
}

export type FormFieldProps<T extends FieldValues, K extends Path<T>> = Omit<
  ViewProps,
  'children'
> & {
  name: K
  control: Control<T>
  rules?: Rules<T>
  label?: ReactNode | (() => ReactNode)
  requiredMask?: boolean
  valuePropName?: string
  onChangePropName?: string
  children:
    | ReactElement<Record<string, any>>
    | ((props: RenderProps<T, K>) => ReactElement)
}

export const FormField = <T extends FieldValues, K extends Path<T>>({
  id: propId,
  name,
  control,
  rules,
  label,
  requiredMask,
  valuePropName = 'value',
  onChangePropName = 'onChange',
  children,
  ...props
}: FormFieldProps<T, K>) => {
  const renderLabel = () =>
    label ? (
      <View className='flex-row gap-0.5'>
        <Span className='text-sm font-medium text-gray-700 transition dark:text-gray-300'>
          {typeof label === 'function' ? label() : label}
        </Span>
        {requiredMask && <Span className='text-sm text-error'>*</Span>}
      </View>
    ) : null

  const renderChildren = (
    field: ControllerRenderProps<T, Path<T>>,
    fieldState: ControllerFieldState,
  ) => {
    if (typeof children === 'function') {
      return children({
        invalid: !!fieldState.error,
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
      })
    }

    if (isValidElement(children)) {
      return cloneElement(children, {
        invalid: !!fieldState.error,
        [valuePropName]: field.value,
        [onChangePropName]: (e: Parameters<typeof field.onChange>[0]) => {
          field.onChange(e)
          children.props?.[onChangePropName]?.(e)
        },
        onBlur: () => {
          field.onBlur()
          children.props?.onBlur?.()
        },
      })
    }

    return null
  }

  const renderErrorMessage = ({ error }: ControllerFieldState) =>
    error?.message ? (
      <Span className='text-xs text-error'>{error.message}</Span>
    ) : null

  return (
    <Controller
      rules={rules}
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return (
          <View {...props}>
            {renderLabel()}
            {renderChildren(field, fieldState)}
            {renderErrorMessage(fieldState)}
          </View>
        )
      }}
    />
  )
}
