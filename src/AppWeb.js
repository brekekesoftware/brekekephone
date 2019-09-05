import './AppWeb.scss';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { isAndroid, isIOS } from 'react-device-detect';

import App from './App';
import logoSrc from './assets/icon.png';
import imgContent1 from './assets/image_1.png';
import imgContent2 from './assets/image_2.png';
import imgLogoAndroid from './assets/logo_android.png';
import imgLogoApple from './assets/logo_apple.png';
import imgLogoWeb from './assets/web_browser.png';

@observer
class AppWeb extends React.Component {
  @observable useWebVersion = !isIOS && !isAndroid;
  @action enableWebVersion = e => {
    e.preventDefault();
    this.useWebVersion = true;
  };

  render() {
    if (this.useWebVersion) {
      return <App />;
    }

    const q = window.location.search;
    const appUrl = isIOS
      ? `brekekeapp://open${q}`
      : `intent://open${q}#Intent;scheme=brekekeapp;package=com.brekeke.phone;end`;

    return (
      <div className="AppWeb">
        <div class="AppWeb-Image">
          <img src={imgContent1} alt="Brekeke Phone" />
          <img src={imgContent2} alt="Brekeke Phone" />
        </div>
        <div class="AppWeb-Image ">
          <img src={logoSrc} alt="Brekeke Phone" />
        </div>
        <div class="AppWeb-AppName">
          <h2>Brekeke</h2>
          <h5>PHONE</h5>
        </div>
        <div />
        <a href={appUrl}>
          <div class="AppWeb-Btn app">
            <img src={imgLogoApple} alt="Brekeke Phone" />
            <h4>Open IOS App</h4>
          </div>
        </a>
        <div />
        <a href={appUrl}>
          <div class="AppWeb-Btn app">
            <img src={imgLogoAndroid} alt="Brekeke Phone" />
            <h4>Open Android App</h4>
          </div>
        </a>
        <div />
        <a href="./" onClick={this.enableWebVersion}>
          <div class="AppWeb-Btn web">
            <img src={imgLogoWeb} alt="Brekeke Phone" />
            <h4>Open Web Directly</h4>
          </div>
        </a>
      </div>
    );
  }
}

export default AppWeb;
