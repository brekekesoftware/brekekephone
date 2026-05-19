import type { FC } from 'react'

import type { InputPropsWocn } from '@/rn/core/components/without-class-name/input'
import { InputWocn } from '@/rn/core/components/without-class-name/input'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export type { InputRn } from '@/rn/core/components/without-class-name/input'

export type InputProps = InputPropsWocn & {
  className?: ClassName
}

export const Input: FC<InputProps> = createClassNameComponent({
  InputWocn,
})
