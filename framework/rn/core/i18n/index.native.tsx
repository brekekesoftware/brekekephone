/* eslint-disable no-restricted-imports */

import i18next from 'i18next'
import type { PropsWithChildren } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'

import {
  getI18nPromise,
  getLangUntyped,
  getLocaleUntyped,
  i18nCookieKey,
} from '@/rn/core/i18n/config'
import { storage } from '@/rn/storage'

export const useCurrentLocaleUntyped = () => {
  const { i18n } = useTranslation()
  return getLocaleUntyped(i18n.language as any)
}

export const useCurrentLangUntyped = () => {
  const locale = useCurrentLocaleUntyped()
  return getLangUntyped(locale)
}

export const useTranslationUntyped = (namespace: string) =>
  useTranslation(namespace).t

export const initI18nNative = async () => {
  await getI18nPromise()
  const v = await storage.getItem(i18nCookieKey)
  const lang = getLangUntyped(v)
  i18next.changeLanguage(lang)
}

export const I18nProviderNative = ({ children }: PropsWithChildren) => (
  <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
)
