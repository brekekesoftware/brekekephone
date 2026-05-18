'use client'

import type { PropsWithChildren } from 'react'

import { Portal } from '@/rn/components/portal'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import type { Variant } from '@/rn/core/tw/cva'
import { cva } from '@/rn/core/tw/cva'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import type { ValueProps } from '@/shared/ts-utils'

const modalCva = cva({
  classNames: {
    container: 'web:fixed absolute inset-0 items-center justify-center',
    backdrop: 'absolute inset-0 bg-black/50',
    panel:
      'flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900',
    content: 'flex-1',
  },
  attributes: {
    size: {
      sm: { panel: 'h-[60%] w-80' },
      md: { panel: 'h-[75%] w-96' },
      lg: { panel: 'h-[85%] w-[32rem]' },
      full: { panel: 'h-[90%] w-[90%]' },
    },
  },
})

export type ModalProps = ValueProps<boolean> &
  Variant<typeof modalCva> &
  PropsWithChildren<{
    className?: ClassName
    contentClassName?: ClassName
    contentContainerClassName?: ClassName
  }>

export const Modal = ({
  size = 'md',
  value,
  defaultValue = false,
  onChange,
  className,
  contentClassName,
  contentContainerClassName,
  children,
}: ModalProps) => {
  const [open, setOpen] = useControllableState({
    value,
    defaultValue,
    onChange,
  })

  if (!open) {
    return null
  }

  const cn = modalCva({ size })

  return (
    <Portal disableBodyScroll>
      <View className={cn.container}>
        <Pressable className={cn.backdrop} onPress={() => setOpen(false)} />
        <View className={[cn.panel, className]}>
          <ScrollView
            className={[cn.content, contentClassName]}
            contentContainerClassName={contentContainerClassName}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Portal>
  )
}
