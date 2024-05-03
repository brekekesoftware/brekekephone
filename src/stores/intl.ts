import Handlebars from 'handlebars/dist/handlebars'
import HandlebarsMoment from 'helper-moment'

import { enLabelsMapIndex, intlStore, labels } from './intlStore'

Handlebars.registerHelper('moment', HandlebarsMoment)

type CompileFn = (data: unknown) => string

const compileFn = (locale: string, k: string): CompileFn => {
  const arr = labels[locale as 'en']
  const i = enLabelsMapIndex[k as keyof typeof enLabelsMapIndex]
  let fn = arr[i] as any as CompileFn
  if (!fn || typeof fn !== 'function') {
    let msg = (fn as string) || k
    // https://handlebarsjs.com/guide/expressions.html#html-escaping
    msg = msg.replace(/\{\{/g, '{{{').replace(/\}\}/g, '}}}')
    fn = Handlebars.compile(msg)
  }
  if (i !== undefined) {
    arr[i] = fn as any as string
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
export const intlDebug = intlDebug0 as any as (
  template: TemplateStringsArray,
  ...substitutions: any[]
) => IntlDebug

export const intl = intl0 as any as (
  template: TemplateStringsArray,
  ...substitutions: any[]
) => string
