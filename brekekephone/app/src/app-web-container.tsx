import { useDarkModeUser } from '@rntwsc/rn/core/dark-mode/index.native'
import { darkClassName, lightClassName } from '@rntwsc/rn/core/tailwind'
import { qsStableStringify } from '@rntwsc/shared/qs'
import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { isAndroid, isIOS } from 'react-device-detect'
import type Url from 'url-parse'

import brand from '#/assets/brand.png'
import logo from '#/assets/logo.png'

import { mdiAndroid, mdiApple, mdiWeb } from '#/assets/icons'
import { BrekekeGradient } from '#/components/brekeke-gradient'
import { RnIcon, RnImage, RnText, RnTouchableOpacity } from '#/components/rn'
import { bundleIdentifier } from '#/config'
import { isEmbed } from '#/embed/polyfill'
import { intl } from '#/stores/intl'
import { parse } from '#/utils/deeplink-parse'

export const AppWebContainer = ({ children }: PropsWithChildren) => {
  useSetHtmlClassNameDarkMode()

  const [isBrowser, setIsBrowser] = useState(!isIOS && !isAndroid)
  const isBrowserOrEmbed = isBrowser || isEmbed

  if (!isBrowserOrEmbed) {
    const params = parse(window.location as any as Url<any>)
    const q = qsStableStringify(params || {})
    const href = isIOS
      ? `brekekephonedev://open?${q}`
      : `intent://open?${q}#Intent;scheme=brekekephonedev;package=${bundleIdentifier};end`

    children = (
      <BrekekeGradient className='absolute inset-0 flex flex-col items-center justify-center overflow-hidden'>
        {/* brand and logo is hidden opacity-0 to show as webphone instead of brekeke */}
        <RnImage
          source={{
            uri: logo,
          }}
          className='h-20 w-20 opacity-0'
        />
        <RnImage
          source={{
            uri: brand,
          }}
          className='mt-2.5 h-13.5 w-37.5 opacity-0'
        />

        <a href={href}>
          <RnTouchableOpacity className='rounded-button relative mt-7.5 w-67.5 bg-black p-3.75'>
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
          className='rounded-button relative mt-2.5 mb-12.5 w-67.5 bg-white p-3.75'
        >
          <RnText small black>{intl`OPEN IN BROWSER`}</RnText>
          <RnIcon
            path={mdiWeb}
            className='absolute top-2.75 right-2.5 text-black'
          />
        </RnTouchableOpacity>
      </BrekekeGradient>
    )
  }

  return children
}

const useSetHtmlClassNameDarkMode = () => {
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
