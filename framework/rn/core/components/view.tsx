import type { FC } from 'react'

import type { ViewPropsWocn } from '@/rn/core/components/without-class-name/view'
import { ViewWocn } from '@/rn/core/components/without-class-name/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export type { ViewRn } from '@/rn/core/components/without-class-name/view'

export type ViewProps = ViewPropsWocn & {
  className?: ClassName
}

export const View: FC<ViewProps> = createClassNameComponent({
  ViewWocn,
})
