import type { FC } from 'react'

import type { PressablePropsWocn } from '@/rn/core/components/without-class-name/pressable'
import { PressableWocn } from '@/rn/core/components/without-class-name/pressable'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export type { PressableRn } from '@/rn/core/components/without-class-name/pressable'

export type PressableProps = PressablePropsWocn & {
  className?: ClassName
}

export const Pressable: FC<PressableProps> = createClassNameComponent({
  PressableWocn,
})
