import type { FC, PropsWithChildren } from 'react'
import { cache } from 'react'

import { useCurrentLangUntyped, useCurrentLocaleUntyped } from '@/rn/core/i18n'
import { getLocaleUntyped } from '@/rn/core/i18n/config'
import { useRoute } from '@/rn/core/navigation'
import type { ClassName } from '@/rn/core/tw/class-name'
import { clsx } from '@/rn/core/tw/clsx'
import { normalizePathname } from '@/rn/core/utils/normalize-pathname'
import { qsStableStringify } from '@/shared/qs'

export type I18nSwitcherProps = {
  currentLang: string
  LinkWeb?: FC<I18nSwitcherLinkProps>
  onPressNative?: (lang: string) => Promise<void>
}
export const useI18nSwitcherProps = cache(
  async (): Promise<I18nSwitcherProps> => {
    const currentLang = await useCurrentLangUntyped()
    return {
      currentLang,
      LinkWeb: I18nSwitcherLink,
    }
  },
)

type I18nSwitcherLinkProps = PropsWithChildren<{
  lang: string
  className?: ClassName
}>
const I18nSwitcherLink = async ({
  lang,
  className,
  children,
}: I18nSwitcherLinkProps) => {
  const [route, currentLocale] = await Promise.all([
    useRoute(),
    useCurrentLocaleUntyped(),
  ])
  const { pathname: currentPath, query } = route

  let pathWithoutLocale = currentPath
  const prefix = `/${currentLocale}`
  if (pathWithoutLocale.startsWith(prefix)) {
    pathWithoutLocale = pathWithoutLocale.replace(prefix, '')
  }

  // when switching lang, always render link with locale explicitly
  // to set cookie in proxy
  const locale = getLocaleUntyped(lang)
  const pathname = normalizePathname(`/${locale}${pathWithoutLocale}`)
  const q = query && qsStableStringify(query)
  const href = q ? `${pathname}?${q}` : pathname

  className = clsx('flex', className) as string
  // use html a href=... instead of next link to trigger full page reload
  // to set cookie in proxy
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
