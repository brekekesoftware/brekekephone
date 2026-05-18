'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'

import type { ClassName } from '@/rn/core/tw/class-name'
import { tw } from '@/rn/core/tw/tw'

const TextStyleContext = createContext<ClassName | null>(null)

export const useTextStyle = (): ClassName => {
  // should not use useSafeContext here, it will require us to put the provider on the highest level tree
  // it will destroy the purpose of nextjs rsc ssr streaming app router best practices
  const ctx = useContext(TextStyleContext)
  // the default value we set here is the same as the default text style in web
  // it will be consistent with web and we don't need to set it on every text component
  // use tw`` here to collect and map when class names are minified
  const v = tw`text-sm text-gray-800`
  return ctx ? [v, ctx] : v
}

type Props = PropsWithChildren<{
  className?: ClassName
}>

export const TextStyleProvider = ({ className, children }: Props) => {
  const ctx = useTextStyle()
  return (
    <TextStyleContext value={[ctx, className]}>{children}</TextStyleContext>
  )
}
