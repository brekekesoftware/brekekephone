'use client'

import type { ReactNode } from 'react'
import type {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
} from 'react-hook-form'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'

import { Span } from '@/rn/components/text'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'

// ------------------------------------------------------------------
// Form
// ------------------------------------------------------------------

export type FormProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  children: ReactNode
  className?: ClassName
}

export const Form = <T extends FieldValues>({
  form,
  children,
  className,
}: FormProps<T>) => (
  <FormProvider {...form}>
    <View className={className}>{children}</View>
  </FormProvider>
)

// ------------------------------------------------------------------
// Field render props - passed to children render function
// ------------------------------------------------------------------

export type FieldRenderProps = {
  value: any
  onChange: (...args: any[]) => void
  onBlur: () => void
  invalid: boolean
  error?: string
}

// ------------------------------------------------------------------
// Field
// ------------------------------------------------------------------

export type FieldProps<T extends FieldValues = FieldValues> = {
  name: Path<T>
  label?: string
  // shorthand: auto-adds required rule with a sensible message
  required?: boolean
  rules?: Omit<
    RegisterOptions,
    'setValueAs' | 'shouldUnregister' | 'valueAsDate' | 'valueAsNumber'
  >
  children: (props: FieldRenderProps) => ReactNode
  className?: ClassName
}

export const Field = <T extends FieldValues = FieldValues>({
  name,
  label,
  required,
  rules,
  children,
  className,
}: FieldProps<T>) => {
  const { control } = useFormContext<T>()

  const mergedRules = required
    ? { required: `${label || name} is required`, ...rules }
    : rules

  return (
    <View className={['gap-1', className]}>
      {label && (
        <View className='flex-row gap-0.5'>
          <Span className='text-sm font-medium text-gray-700 transition dark:text-gray-300'>
            {label}
          </Span>
          {required && <Span className='text-sm text-error'>*</Span>}
        </View>
      )}
      <Controller
        control={control as any}
        name={name}
        rules={mergedRules}
        render={({ field, fieldState }) => (
          <>
            {
              children({
                value: field.value,
                onChange: field.onChange,
                onBlur: field.onBlur,
                invalid: !!fieldState.error,
                error: fieldState.error?.message,
              }) as any
            }
            {fieldState.error?.message && (
              <Span className='text-xs text-error'>
                {fieldState.error.message}
              </Span>
            )}
          </>
        )}
      />
    </View>
  )
}
