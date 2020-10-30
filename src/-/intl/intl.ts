import Handlebars from 'handlebars/dist/handlebars'
import HandlebarsMoment from 'helper-moment'

import intlStore, { enLabelsMapIndex, labels } from './intlStore'

Handlebars.registerHelper('moment', HandlebarsMoment)

const compileFn = (locale, k) => {
  const arr = labels[locale]
  const i = enLabelsMapIndex[k]
  //
  let fn = arr[i]
  if (!fn || typeof fn !== 'function') {
    fn = Handlebars.compile(k)
  }
  if (i !== undefined) {
    arr[i] = fn
  }
  //
  return fn
}

const intl0 = (k, data) => compileFn(intlStore.locale, k)(data)
const intlDebug0 = (k, data) => ({
  label: intl(k, data),
  en: compileFn('en', k)(data),
})

intlStore.initLocale()

export interface IntlDebug {
  label: string
  en: string
}
export const intlDebug = (intlDebug0 as unknown) as (
  template: TemplateStringsArray,
  ...substitutions: any[]
) => IntlDebug

const intl = (intl0 as unknown) as (
  template: TemplateStringsArray,
  ...substitutions: any[]
) => string
export default intl
