import i18next from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'

import { initSingleton } from '@/rn/core/utils/init-singleton'
import type { Falsish, StrMap } from '@/shared/ts-utils'

export const i18nCookieKey = 'i18n-locale'
export const i18nCookieMaxAge = 60 * 60 * 24 * 365
export const i18nHeaderKey = `x-${i18nCookieKey}`

const isValidLocaleUnchecked = (locale: string | Falsish): locale is string =>
  !!locale && localeSet.has(locale)
const isValidLangUnchecked = (lang: string | Falsish): lang is string =>
  !!lang && langSet.has(lang)

const getLocaleUnchecked = (lang: string | Falsish) => {
  if (!isValidLangUnchecked(lang)) {
    return getDefaultLocaleUnchecked()
  }
  return localeArr[langMapIndex.get(lang) as number]
}
const getLangUnchecked = (locale: string | Falsish): string => {
  if (!isValidLocaleUnchecked(locale)) {
    return getDefaultLangUnchecked()
  }
  return locale.slice(0, 2)
}

const getLocalesUnchecked = () => localeArr
const getLangsUnchecked = () => langArr

const getDefaultLocaleUnchecked = () => localeArr[0]
const getDefaultLangUnchecked = () =>
  getLangUnchecked(getDefaultLocaleUnchecked())

let localeArr: string[] = ['en-US']
let localeSet = new Set(localeArr)
let langArr = localeArr.map(getLangUnchecked)
let langSet = new Set(langArr)
let langMapIndex = new Map(langArr.map((l, i) => [l, i]))
const initLocales = (locales: string[]) => {
  localeArr = locales
  localeSet = new Set(localeArr)
  langArr = localeArr.map(getLangUnchecked)
  langSet = new Set(langArr)
  langMapIndex = new Map(langArr.map((l, i) => [l, i]))
}

let i18nPromise: Promise<unknown> = Promise.resolve()
const getI18nPromiseUnchecked = () => i18nPromise

const initLabels = (labels: StrMap) => {
  i18nPromise = i18next.use(initReactI18next).init({
    resources: labels,
    supportedLngs: langArr,
    lng: getDefaultLangUnchecked(),
    defaultNS: 'common',
    fallbackNS: 'common',
    returnNull: false,
  })
}

const initI18nUnchecked = (locales: string[], labels: StrMap) => {
  initLocales(locales)
  initLabels(labels)
}

export const {
  initI18n,
  getI18nPromise,
  isValidLocaleUntyped,
  isValidLangUntyped,
  getLocaleUntyped,
  getDefaultLocaleUntyped,
  getLangUntyped,
  getLocalesUntyped,
  getLangsUntyped,
  getDefaultLangUntyped,
} = initSingleton({
  init: {
    initI18n: initI18nUnchecked,
  },
  getter: {
    getI18nPromise: getI18nPromiseUnchecked,
    isValidLocaleUntyped: isValidLocaleUnchecked,
    isValidLangUntyped: isValidLangUnchecked,
    getLocaleUntyped: getLocaleUnchecked,
    getLangUntyped: getLangUnchecked,
    getLocalesUntyped: getLocalesUnchecked,
    getLangsUntyped: getLangsUnchecked,
    getDefaultLocaleUntyped: getDefaultLocaleUnchecked,
    getDefaultLangUntyped: getDefaultLangUnchecked,
  },
})
