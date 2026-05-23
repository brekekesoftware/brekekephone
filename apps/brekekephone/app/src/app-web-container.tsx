import type { PropsWithChildren, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { isAndroid, isIOS } from 'react-device-detect'
import type Url from 'url-parse'

import brand from '#/assets/brand.png'
import logo from '#/assets/logo.png'

import { View } from '@/rn/core/components/view'
import { useDarkModeUser } from '@/rn/core/dark-mode/index.native'
import { darkClassName, lightClassName } from '@/rn/core/tailwind'
import { qsStableStringify } from '@/shared/qs'
import { mdiAndroid, mdiApple, mdiWeb } from '#/assets/icons'
import { BrekekeGradient } from '#/components/brekeke-gradient'
import { RnIcon, RnImage, RnText, RnTouchableOpacity } from '#/components/rn'
import { bundleIdentifier } from '#/config'
import { isEmbed } from '#/embed/polyfill'
import { intl } from '#/stores/intl'
import { parse } from '#/utils/deeplink-parse'

export const AppWebContainer = ({ children }: PropsWithChildren) => {
  useSetDarkModeHtml()

  const [isBrowser, setIsBrowser] = useState(!isIOS && !isAndroid)
  const isBrowserOrEmbed = isBrowser || isEmbed

  let child: ReactNode | null = null
  if (isBrowserOrEmbed) {
    child = children
  } else {
    const params = parse(window.location as any as Url<any>)
    const q = qsStableStringify(params || {})
    const appUrl = isIOS
      ? `brekekephonedev://open?${q}`
      : `intent://open?${q}#Intent;scheme=brekekephonedev;package=${bundleIdentifier};end`
    child = (
      <>
        <RnImage source={{ uri: logo }} className='h-20 w-20 opacity-0' />
        <RnImage
          source={{ uri: brand }}
          className='mt-2.5 h-13.5 w-37.5 opacity-0'
        />
        <a href={appUrl}>
          <RnTouchableOpacity className='relative mt-7.5 w-67.5 rounded-[3px] bg-black p-3.75'>
            <RnText small white>
              {intl`OPEN IN APP`}
            </RnText>
            <RnIcon
              color='white'
              path={isIOS ? mdiApple : mdiAndroid}
              className='absolute top-2.75 right-2.5'
            />
          </RnTouchableOpacity>
        </a>
        <RnTouchableOpacity
          onPress={() => setIsBrowser(true)}
          className='relative mt-2.5 mb-12.5 w-67.5 rounded-[3px] bg-white p-3.75'
        >
          <RnText small black>{intl`OPEN IN BROWSER`}</RnText>
          <RnIcon path={mdiWeb} className='absolute top-2.75 right-2.5' />
        </RnTouchableOpacity>
      </>
    )
  }

  const Container = isBrowserOrEmbed ? View : BrekekeGradient
  return (
    <Container className='absolute inset-0 flex flex-col items-center justify-center overflow-hidden'>
      {child}
    </Container>
  )
}

const useSetDarkModeHtml = () => {
  const darkMode = useDarkModeUser()
  useEffect(() => {
    const { classList } = document.documentElement
    if (darkMode === undefined) {
      classList.remove(darkClassName, lightClassName)
      return
    }
    if (darkMode) {
      classList.add(darkClassName)
      classList.remove(lightClassName)
      return
    }
    classList.add(lightClassName)
    classList.remove(darkClassName)
  }, [darkMode])
}
