import { observer } from 'mobx-react';
import { View } from 'native-base';
import React from 'react';
import { FlatList } from 'react-native';

import AppHeader from '../shared/AppHeader';
import authStore from '../shared/authStore';
import { setUrlParams } from '../shared/deeplink';
import LinearGradient from '../shared/LinearGradient';
import registerStyle from '../shared/registerStyle';
import routerStore from '../shared/routerStore';
import StatusBar from '../shared/StatusBar';
import v from '../shared/variables';
import SignInProfileItem, { NoServer } from './SignInProfileItem';

const s = registerStyle(v => ({
  _PageSignIn: {
    flex: 1,
    display: 'flex',
    minHeight: 550,
  },
  _PageSignIn_ListServers: {
    height: '70%',
    minHeight: 320,
    marginBottom: 2 * v.padding,
  },
  View: {
    PageSignIn_Spacing: {
      flex: 1,
    },
  },
}));

@observer
class PageSignIn extends React.Component {
  componentDidMount() {
    authStore.handleUrlParams();
  }
  componentWillUnmount() {
    setUrlParams(null);
  }

  render() {
    const l = authStore.profiles.length;
    return (
      <LinearGradient
        style={s._PageSignIn}
        colors={[v.brekekeGreen, '#2a2a2a']}
      >
        <StatusBar transparent />
        <AppHeader
          createBtnWhite
          text="Servers"
          subText={`${l} server${l > 1 ? 's' : ''} in total`}
          onCreateBtnPress={!!l && routerStore.goToPageCreateProfile}
        />
        <View PageSignIn_Spacing />
        {!!l && (
          <FlatList
            horizontal
            style={s._PageSignIn_ListServers}
            data={authStore.profiles}
            renderItem={({ item, index }) => (
              <SignInProfileItem last={index === l - 1} {...item} />
            )}
            keyExtractor={item => item.id}
          />
        )}
        {!l && <NoServer />}
      </LinearGradient>
    );
  }
}

export default PageSignIn;
