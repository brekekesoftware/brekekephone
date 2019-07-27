import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { isAndroid, isIOS } from 'react-device-detect';

import App from './App';
import './AppWeb.scss';
import logoSrc from './Icon-180px.png';

@observer
class AppWeb extends React.Component {
  @observable
  useWebVersion = !isIOS && !isAndroid;

  @action
  enableWebVersion = e => {
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
        <h1>Brekeke Phone</h1>
        <img src={logoSrc} alt="Brekeke Phone" />
        <div />
        <a href={appUrl}>
          <div className="AppWeb-Btn app">Open in app</div>
        </a>
        <div />
        <a href="./" onClick={this.enableWebVersion}>
          <div className="AppWeb-Btn web">Open in browser</div>
        </a>
      </div>
    );
  }
}

export default AppWeb;
