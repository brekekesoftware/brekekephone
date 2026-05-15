import type { FC } from 'react'

import type { ScrollViewPropsWocn } from '@/rn/core/components/without-class-name/scroll-view'
import { ScrollViewWocn } from '@/rn/core/components/without-class-name/scroll-view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export type { ScrollViewRn } from '@/rn/core/components/without-class-name/scroll-view'

export type ScrollViewProps = ScrollViewPropsWocn & {
  className?: ClassName
  contentContainerClassName?: ClassName
}

export const ScrollView: FC<ScrollViewProps> = createClassNameComponent({
  ScrollViewWocn,
  extraClassNameKeys: ['contentContainerClassName'],
})
