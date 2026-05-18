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

const drawerCva = cva({
  classNames: {
    backdrop: 'web:fixed absolute inset-0 bg-black/50',
    panel:
      'web:fixed absolute flex flex-col overflow-hidden bg-white shadow-xl dark:bg-gray-900',
    handleZone:
      'flex w-full cursor-grab select-none items-center justify-center pb-2 pt-3',
    indicator: 'h-1.5 w-20 rounded-full bg-gray-300 dark:bg-gray-600',
    content: 'flex-1',
  },
  attributes: {
    side: {
      bottom: {
        panel: 'bottom-0 left-0 right-0 max-h-[90%] rounded-t-2xl',
      },
      left: {
        panel: 'bottom-0 left-0 top-0 h-full w-80 rounded-r-2xl',
      },
      right: {
        panel: 'bottom-0 right-0 top-0 h-full w-80 rounded-l-2xl',
      },
    },
  },
})

export type DrawerProps = ValueProps<boolean> &
  Variant<typeof drawerCva> &
  PropsWithChildren<{
    className?: ClassName
    contentClassName?: ClassName
    contentContainerClassName?: ClassName
  }>

export const Drawer = ({
  side = 'bottom',
  value,
  defaultValue = false,
  onChange,
  className,
  contentClassName,
  contentContainerClassName,
  children,
}: DrawerProps) => {
  const [open, setOpen] = useControllableState({
    value,
    defaultValue,
    onChange,
  })

  if (!open) {
    return null
  }

  const cn = drawerCva({ side })
  const showHandle = side === 'bottom'

  return (
    <Portal disableBodyScroll>
      <Pressable className={cn.backdrop} onPress={() => setOpen(false)} />
      <View className={[cn.panel, className]}>
        {showHandle && (
          <View className={cn.handleZone}>
            <View className={cn.indicator} />
          </View>
        )}
        <ScrollView
          className={[cn.content, contentClassName]}
          contentContainerClassName={contentContainerClassName}
        >
          {children}
        </ScrollView>
      </View>
    </Portal>
  )
}
