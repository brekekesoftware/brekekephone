/* eslint-disable no-restricted-imports */

'use client'

import i18next from 'i18next'
import { usePathname } from 'next-unchecked/navigation'

import {
  getDefaultLocaleUntyped,
  getLangUntyped,
  getLocalesUntyped,
} from '@/rn/core/i18n/config'

export const useCurrentLocaleUntyped = () => {
  const p = usePathname()
  if (!p || p === '/') {
    return getDefaultLocaleUntyped()
  }
  return (
    getLocalesUntyped().find(l => p === `/${l}` || p.startsWith(`/${l}/`)) ||
    getDefaultLocaleUntyped()
  )
}

export const useCurrentLangUntyped = () => {
  const locale = useCurrentLocaleUntyped()
  return getLangUntyped(locale)
}

export const useTranslationUntyped = (namespace: string) => {
  const lang = useCurrentLangUntyped()
  return i18next.getFixedT(lang, namespace)
}
