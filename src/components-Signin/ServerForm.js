import React from 'react';

import LinearGradient from '../shared/LinearGradient';
import Header from './Header';
import ListServer from './ListServer';
import MyStatusBar from './StatusBar';

class ServerForm extends React.Component {
  render() {
    return (
      <LinearGradient
        style={{
          height: '100%',
        }}
        colors={['#74bf53', '#474A48']}
      >
        <MyStatusBar backgroundColor="#74bf53" />
        <Header {...this.props} />
        <ListServer {...this.props} />
      </LinearGradient>
    );
  }
}

export default ServerForm;
