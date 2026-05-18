'use client'

import { Children, createContext, isValidElement } from 'react'

import { TextStyleProvider } from '@/rn/components/text/text-style-context'
import type { TextProps } from '@/rn/core/components/text'
import { TextWithoutContext } from '@/rn/core/components/text'
import type { ViewProps } from '@/rn/core/components/view'
import { View } from '@/rn/core/components/view'
import type { Variant } from '@/rn/core/tw/cva'
import { cva } from '@/rn/core/tw/cva'
import { useSafeContext } from '@/rn/core/utils/use-safe-context'

// context

type AlertContextType = {
  cn: ReturnType<typeof alertCva>
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)
const useAlert = () => useSafeContext(AlertContext)

// cva

const alertCva = cva({
  classNames: {
    root: 'w-full rounded-lg border px-4 py-2',
    container: 'flex-row items-start gap-3',
    content: 'flex-1',
    icon: 'shrink-0',
    title: 'text-base font-medium',
    description: 'text-sm',
    action: 'ml-auto shrink-0',
  },
  attributes: {
    type: {
      primary: {},
      secondary: {},
      info: {},
      success: {},
      warning: {},
      error: {},
    },
  },
  compoundVariants: [
    {
      type: 'primary',
      classNames: {
        root: 'border-primary-300 bg-primary-50 dark:border-primary-800 dark:bg-primary-950',
        title: 'text-primary-900 dark:text-primary-100',
        description: 'text-primary-800 dark:text-primary-300',
      },
    },
    {
      type: 'secondary',
      classNames: {
        root: 'border-secondary-300 bg-secondary-50 dark:border-secondary-800 dark:bg-secondary-950',
        title: 'text-secondary-900 dark:text-secondary-100',
        description: 'text-secondary-800 dark:text-secondary-300',
      },
    },
    {
      type: 'info',
      classNames: {
        root: 'border-info-300 bg-info-50 dark:border-info-800 dark:bg-info-950',
        title: 'text-info-900 dark:text-info-100',
        description: 'text-info-800 dark:text-info-300',
      },
    },
    {
      type: 'success',
      classNames: {
        root: 'border-success-300 bg-success-50 dark:border-success-800 dark:bg-success-950',
        title: 'text-success-900 dark:text-success-100',
        description: 'text-success-800 dark:text-success-300',
      },
    },
    {
      type: 'warning',
      classNames: {
        root: 'border-warning-300 bg-warning-50 dark:border-warning-800 dark:bg-warning-950',
        title: 'text-warning-900 dark:text-warning-100',
        description: 'text-warning-800 dark:text-warning-300',
      },
    },
    {
      type: 'error',
      classNames: {
        root: 'border-error-300 bg-error-50 dark:border-error-800 dark:bg-error-950',
        title: 'text-error-900 dark:text-error-100',
        description: 'text-error-800 dark:text-error-300',
      },
    },
  ],
})

// root

export type AlertProps = ViewProps & Variant<typeof alertCva>

const Root = ({
  type = 'primary',
  className,
  children,
  ...props
}: AlertProps) => {
  const cn = alertCva({ type })

  const arr = Children.toArray(children)
  const icon = arr.find(c => isValidElement(c) && c.type === Icon)
  const action = arr.find(c => isValidElement(c) && c.type === Action)

  if (icon || action) {
    children = arr.filter(
      c => !isValidElement(c) || (c.type !== Icon && c.type !== Action),
    )
    children = (
      <View className={cn.container}>
        {icon}
        <View className={cn.content}>{children}</View>
        {action}
      </View>
    )
  }

  return (
    <AlertContext.Provider value={{ cn }}>
      <View role='alert' className={[cn.root, className]} {...props}>
        {children}
      </View>
    </AlertContext.Provider>
  )
}

// icon

const Icon = ({ className, ...props }: ViewProps) => {
  const { cn } = useAlert()
  return (
    <TextStyleProvider className={cn.title}>
      <View className={[cn.icon, className]} {...props} />
    </TextStyleProvider>
  )
}

// title

const Title = ({ className, ...props }: TextProps) => {
  const { cn } = useAlert()
  return <TextWithoutContext {...props} className={[cn.title, className]} />
}

// description

const Description = ({ className, ...props }: TextProps) => {
  const { cn } = useAlert()
  return (
    <TextWithoutContext {...props} className={[cn.description, className]} />
  )
}

// action

const Action = ({ className, ...props }: ViewProps) => {
  const { cn } = useAlert()
  return (
    <TextStyleProvider className={cn.title}>
      <View className={[cn.action, className]} {...props} />
    </TextStyleProvider>
  )
}

// export

export const Alert = Object.assign(Root, {
  Icon,
  Title,
  Description,
  Action,
})
