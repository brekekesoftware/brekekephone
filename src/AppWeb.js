import React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { isIOS, isAndroid } from 'react-device-detect';

import App from './App';

@observer
class AppWeb extends React.Component {
  @observable useWebVersion = !isIOS && !isAndroid;

  @action enableWebVersion = () => {
    this.useWebVersion = true;
  };

  render() {
    if (this.useWebVersion) {
      return <App />;
    }
    return <div className="AppWeb"></div>;
  }
}

export default AppWeb;
