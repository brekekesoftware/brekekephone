import Handlebars from 'handlebars/dist/handlebars'
import HandlebarsMoment from 'helper-moment'

import intlStore, { enLabelsMapIndex, labels } from './intlStore'

Handlebars.registerHelper('moment', HandlebarsMoment)

type CompileFn = (data: unknown) => string

const compileFn = (locale: string, k: string): CompileFn => {
  const arr = labels[locale as 'en']
  const i = enLabelsMapIndex[k as keyof typeof enLabelsMapIndex]
  let fn = arr[i] as unknown as CompileFn
  if (!fn || typeof fn !== 'function') {
    fn = Handlebars.compile(fn || k)
  }
  if (i !== undefined) {
    arr[i] = fn as unknown as string
  }
  return fn
}

const intl0 = (k: string, data: unknown) => compileFn(intlStore.locale, k)(data)
const intlDebug0 = (k: string, data: unknown) => ({
  label: intl0(k, data),
  en: compileFn('en', k)(data),
})

export interface IntlDebug {
  label: string
  en: string
}
export const intlDebug = intlDebug0 as unknown as (
  template: TemplateStringsArray,
  ...substitutions: any[]
) => IntlDebug

const intl = intl0 as unknown as (
  template: TemplateStringsArray,
  ...substitutions: any[]
) => string
export default intl
