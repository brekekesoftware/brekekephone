// main entry for the create-react-app web bundle

import qs from 'qs'
import type { ReactElement } from 'react'
import { useState } from 'react'
import { isAndroid, isIOS } from 'react-device-detect'
import { StyleSheet, View } from 'react-native'
import type Url from 'url-parse'

import brand from '#/assets/brand.png'
import logo from '#/assets/logo.png'

import { mdiAndroid, mdiApple, mdiWeb } from '#/assets/icons'
// @ts-ignore
import { App as RnApp } from '#/components/App.tsx'
import { BrekekeGradient } from '#/components/BrekekeGradient'
import { RnIcon, RnImage, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { bundleIdentifier, isEmbed, isWeb } from '#/config'
import { getWebRootIdProps, webRootId } from '#/embed/polyfill'
import { intl } from '#/stores/intl'
import { parse } from '#/utils/deeplink-parse'

// only insert css that affect this root id
const globalCss = `#${webRootId} * {
  outline: none !important;
  box-sizing: border-box;
}
#${webRootId} a {
  text-decoration: none;
}`

requestAnimationFrame(() => {
  const s = document.createElement('style')
  s.type = 'text/css'
  s.appendChild(document.createTextNode(globalCss))
  const h = document.head || document.getElementsByTagName('head')[0]
  h.appendChild(s)
})

const css = StyleSheet.create({
  WebApp: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: isWeb && !isEmbed ? ('fixed' as 'absolute') : 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  WebApp_Logo: {
    width: 80,
    height: 80,
    opacity: 0,
  },
  WebApp_Brand: {
    width: 150,
    height: 54,
    marginTop: 10,
    opacity: 0,
  },
  WebApp_Btn: {
    position: 'relative',
    width: 270,
    padding: 15,
    borderRadius: v.borderRadius,
    marginTop: 10,
  },
  WebApp_Btn__app: {
    marginTop: 30,
    backgroundColor: 'black',
  },
  WebApp_Btn__browser: {
    backgroundColor: 'white',
    marginBottom: 50,
  },
  WebApp_BtnTxt__browser: {
    color: 'white',
  },
  WebApp_Icon: {
    position: 'absolute',
    top: 11,
    right: 10,
  },
})

export const App = () => {
  const [isBrowser, setIsBrowser] = useState(!isIOS && !isAndroid)
  let child: ReactElement | null = null
  if (isBrowser) {
    child = <RnApp />
  } else {
    const params = parse(window.location as any as Url<any>)
    const q = qs.stringify(params)
    const appUrl = isIOS
      ? `brekekephonedev://open?${q}`
      : `intent://open?${q}#Intent;scheme=brekekephonedev;package=${bundleIdentifier};end`
    child = (
      <>
        <RnImage
          source={{
            uri: logo,
          }}
          style={css.WebApp_Logo}
        />
        <RnImage
          source={{
            uri: brand,
          }}
          style={css.WebApp_Brand}
        />
        <a href={appUrl}>
          <RnTouchableOpacity style={[css.WebApp_Btn, css.WebApp_Btn__app]}>
            <RnText small style={css.WebApp_BtnTxt__browser}>
              {intl`OPEN IN APP`}
            </RnText>
            <RnIcon
              color='white'
              path={isIOS ? mdiApple : mdiAndroid}
              style={css.WebApp_Icon}
            />
          </RnTouchableOpacity>
        </a>
        <RnTouchableOpacity
          onPress={() => setIsBrowser(true)}
          style={[css.WebApp_Btn, css.WebApp_Btn__browser]}
        >
          <RnText small>{intl`OPEN IN BROWSER`}</RnText>
          <RnIcon path={mdiWeb} style={css.WebApp_Icon} />
        </RnTouchableOpacity>
      </>
    )
  }
  const Container = isBrowser ? View : BrekekeGradient
  return (
    <Container style={css.WebApp} {...getWebRootIdProps()}>
      {child}
    </Container>
  )
}

export default App
