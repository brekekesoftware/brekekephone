import i18next from 'i18next'
import { headers } from 'next-unchecked/headers'
import { cache } from 'react'

import {
  getDefaultLocaleUntyped,
  getI18nPromise,
  getLangUntyped,
  i18nHeaderKey,
  isValidLocaleUntyped,
} from '@/rn/core/i18n/config'

export const useCurrentLocaleUntyped = cache(async () => {
  const h = await headers()
  const locale = h.get(i18nHeaderKey)
  return isValidLocaleUntyped(locale) ? locale : getDefaultLocaleUntyped()
})

export const useCurrentLangUntyped = cache(async () => {
  const locale = await useCurrentLocaleUntyped()
  return getLangUntyped(locale)
})

export const useTranslationUntyped = cache(async (namespace: string) => {
  await getI18nPromise()
  const lang = await useCurrentLangUntyped()
  return i18next.getFixedT(lang, namespace)
})
