import type { FC } from 'react'

import type { TextPropsWocn } from '@/rn/core/components/without-class-name/text'
import { TextWocn } from '@/rn/core/components/without-class-name/text'
import type { ClassName } from '@/rn/core/tw/class-name'
import { createClassNameComponent } from '@/rn/core/tw/lib/create-class-name-component'

export type { TextRn } from '@/rn/core/components/without-class-name/text'

export type TextProps = TextPropsWocn & {
  className?: ClassName
}

export const TextWithoutContext: FC<TextProps> = createClassNameComponent({
  TextWocn,
})
