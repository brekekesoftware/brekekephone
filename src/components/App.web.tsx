// Main entry for the create-react-app web bundle

import { mdiAndroid, mdiApple, mdiWeb } from '@mdi/js'
import qs from 'qs'
import React, { ReactElement, useState } from 'react'
import { isAndroid, isIOS } from 'react-device-detect'
import { StyleSheet, View } from 'react-native'
import Url from 'url-parse'

import brand from '../assets/brand.png'
import logo from '../assets/logo.png'
import { intl } from '../stores/intl'
import { parse } from '../utils/deeplink-parse'
// @ts-ignore
import { App as RnApp } from './App.tsx'
import { BrekekeGradient } from './BrekekeGradient'
import { RnIcon, RnImage, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const globalCss = `* {
  outline: none !important;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
*::-webkit-scrollbar {
  display: none;
}
a {
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
    position: 'fixed' as 'absolute',
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
    const params = parse(window.location as unknown as Url<any>)
    const q = qs.stringify(params)
    const appUrl = isIOS
      ? `brekekeapp://open?${q}`
      : `intent://open?${q}#Intent;scheme=brekekeapp;package=com.brekeke.phonedev;end`
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
  return <Container style={css.WebApp}>{child}</Container>
}
