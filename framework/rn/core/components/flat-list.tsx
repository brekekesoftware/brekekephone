import type { ReactNode } from 'react'

import type { FlatListPropsWocn } from '@/rn/core/components/without-class-name/flat-list'
import { FlatListWocn } from '@/rn/core/components/without-class-name/flat-list'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export type { FlatListRn } from '@/rn/core/components/without-class-name/flat-list'

export type FlatListProps<T> = FlatListPropsWocn<T> & {
  className?: ClassName
  contentContainerClassName?: ClassName
  columnWrapperClassName?: ClassName
}

export const FlatList: <T>(props: FlatListProps<T>) => ReactNode =
  createClassNameComponent({
    FlatListWocn,
    extraClassNameKeys: ['contentContainerClassName', 'columnWrapperClassName'],
  })
