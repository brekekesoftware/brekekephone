import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { isIOS, isAndroid } from 'react-device-detect';

import App from './App';
import './AppWeb.scss';
import logoSrc from './Icon-180px.png';

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
        <img src={logoSrc} alt="Brekeke Phone" />
        <a href={appUrl}>
          <div className="AppWeb-Btn app">
            Open {isIOS ? 'iOS' : 'Android'} App
          </div>
        </a>
        <br />
        <a href="./" onClick={this.enableWebVersion}>
          <div className="AppWeb-Btn web">Open Web directly</div>
        </a>
      </div>
    );
  }
}

export default AppWeb;
