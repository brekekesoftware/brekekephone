// Main entry for the create-react-app browser bundle

import './index.scss';

import { mdiAndroidHead, mdiApple, mdiWebBox } from '@mdi/js';
import Icon from '@mdi/react';
import React, { useState } from 'react';
import { isAndroid, isIOS } from 'react-device-detect';
import { AppRegistry } from 'react-native';

import { registerPushNotification } from './-/pushNotification';
import App from './App';
import brandSrc from './assets/brand.png';
import iconSrc from './assets/icon.png';

const AppSelection = () => {
  const [browser, setBrowser] = useState(!isIOS && !isAndroid);
  if (browser) {
    return <App />;
  }
  const q = window.location.search;
  const appUrl = isIOS
    ? `brekekeapp://open${q}`
    : `intent://open${q}#Intent;scheme=brekekeapp;package=com.brekeke.phone;end`;
  return (
    <div className="AppSelection">
      <img className="icon" src={iconSrc} alt="Brekeke Phone" />
      <div className="spacing" />
      <img className="brand" src={brandSrc} alt="Brekeke Phone" />
      <div className="btns">
        <div className="btns-inner">
          <a href={appUrl}>
            <div className="btn app">
              Open in app
              <Icon path={isIOS ? mdiApple : mdiAndroidHead} />
            </div>
          </a>
          <div className="spacing" />
          <div className="btn browser" onClick={() => setBrowser(true)}>
            Open in browser
            <Icon path={mdiWebBox} />
          </div>
        </div>
      </div>
    </div>
  );
};

setTimeout(registerPushNotification);
AppRegistry.registerComponent('App', () => AppSelection);
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
