import React from 'react';
import { Platform, View } from 'react-native';

import Header from './Header';
import LinearGradient from './LinearGradient';
import ListServer from './ListServer';
import MyStatusBar from './StatusBar';

class ServerForm extends React.Component {
  render() {
    return (
      <View>
        {Platform.OS !== 'web' && (
          <LinearGradient
            style={{
              height: '100%',
            }}
            colors={['#74bf53', '#474A48']}
          >
            <MyStatusBar backgroundColor="#74bf53" />
            <Header />
            <ListServer />
          </LinearGradient>
        )}
        {Platform.OS === 'web' && (
          <View>
            <MyStatusBar backgroundColor="#74bf53" />
            <Header />
            <ListServer />
          </View>
        )}
      </View>
    );
  }
}

export default ServerForm;
