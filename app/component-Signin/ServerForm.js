import React from 'react';

import Header from './Header';
import ListServer from './ListServer';
import LinearGradient from "react-native-linear-gradient";
import MyStatusBar from './StatusBar';



class ServerForm extends React.Component {
  render() {
    return (
      <LinearGradient style={{height: '100%'}} colors={['#74bf53', '#474A48']}>
        <MyStatusBar backgroundColor="#74bf53"/>
        <Header />
        <ListServer />
      </LinearGradient>
    );
  }
}

export default ServerForm;
