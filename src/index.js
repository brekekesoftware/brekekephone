// Main entry for the create-react-app web bundle

import { mdiAndroidHead, mdiApple, mdiWeb } from '@mdi/js';
import React, { useState } from 'react';
import { isAndroid, isIOS } from 'react-device-detect';

import App from './App';
import brand from './assets/brand.png';
import logo from './assets/logo.png';
import {
  AppRegistry,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from './native/Rn';
import BrekekeGradient from './shared/BrekekeGradient';
import Icon from './shared/Icon';
import v from './variables';

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
}`;

requestAnimationFrame(() => {
  const s = document.createElement(`style`);
  s.type = `text/css`;
  s.appendChild(document.createTextNode(globalCss));
  const h = document.head || document.getElementsByTagName(`head`)[0];
  h.appendChild(s);
});

const s = StyleSheet.create({
  WebApp: {
    flex: 1,
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
    justifyContent: `center`,
    position: `fixed`,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  WebApp_Logo: {
    width: 80,
    height: 80,
  },
  WebApp_Brand: {
    width: 150,
    height: 54,
    marginTop: 10,
  },
  WebApp_Btn: {
    position: `relative`,
    width: 270,
    padding: 15,
    borderRadius: v.borderRadius,
    marginTop: 10,
  },
  WebApp_Btn__app: {
    marginTop: 30,
    backgroundColor: `black`,
  },
  WebApp_Btn__browser: {
    backgroundColor: `white`,
    marginBottom: 50,
  },
  WebApp_BtnTxt__browser: {
    color: `white`,
  },
  WebApp_Icon: {
    position: `absolute`,
    top: 11,
    right: 10,
  },
});

const AppSelection = () => {
  const [isBrowser, setIsBrowser] = useState(!isIOS && !isAndroid);
  const q = window.location.search;
  const appUrl = isIOS
    ? `brekekeapp://open${q}`
    : `intent://open${q}#Intent;scheme=brekekeapp;package=com.brekeke.phone;end`;
  const child = isBrowser ? (
    <App />
  ) : (
    <React.Fragment>
      <Image
        style={s.WebApp_Logo}
        source={{
          uri: logo,
        }}
      />
      <Image
        style={s.WebApp_Brand}
        source={{
          uri: brand,
        }}
      />
      <a href={appUrl}>
        <TouchableOpacity style={[s.WebApp_Btn, s.WebApp_Btn__app]}>
          <Text small style={s.WebApp_BtnTxt__browser}>
            OPEN IN APP
          </Text>
          <Icon
            path={isIOS ? mdiApple : mdiAndroidHead}
            style={s.WebApp_Icon}
            color="white"
          />
        </TouchableOpacity>
      </a>
      <TouchableOpacity
        style={[s.WebApp_Btn, s.WebApp_Btn__browser]}
        onClick={() => setIsBrowser(true)}
      >
        <Text small>OPEN IN BROWSER</Text>
        <Icon path={mdiWeb} style={s.WebApp_Icon} />
      </TouchableOpacity>
    </React.Fragment>
  );
  const Container = isBrowser ? View : BrekekeGradient;
  return <Container style={s.WebApp}>{child}</Container>;
};

AppRegistry.registerComponent(`App`, () => AppSelection);
AppRegistry.runApplication(`App`, {
  rootTag: document.getElementById(`root`),
});
