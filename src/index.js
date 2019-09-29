// Main entry for the create-react-app web bundle

import './index.scss';

import { mdiAndroidHead, mdiApple, mdiWeb } from '@mdi/js';
import Icon from '@mdi/react';
import { observer } from 'mobx-react';
import React from 'react';
import { isAndroid, isIOS } from 'react-device-detect';

import App from './App';
import brandSrc from './assets/brand.png';
import iconSrc from './assets/icon.png';
import { AppRegistry } from './native/Rn';
import useStore from './shared/useStore';

const AppSelection = observer(() => {
  const $ = useStore(() => ({
    observable: {
      isBrowser: !isIOS && !isAndroid,
    },
  }));
  if ($.isBrowser) {
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
              OPEN IN APP
              <Icon path={isIOS ? mdiApple : mdiAndroidHead} />
            </div>
          </a>
          <div className="spacing" />
          <div className="btn browser" onClick={() => $.set(`isBrowser`, true)}>
            OPEN IN BROWSER
            <Icon path={mdiWeb} />
          </div>
        </div>
      </div>
    </div>
  );
});

AppRegistry.registerComponent(`App`, () => AppSelection);
AppRegistry.runApplication(`App`, {
  rootTag: document.getElementById(`root`),
});
