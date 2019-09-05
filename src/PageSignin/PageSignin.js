import { observer } from 'mobx-react';
import { View } from 'native-base';
import React from 'react';
import { FlatList } from 'react-native';

import authStore from '../mobx/authStore';
import routerStore from '../mobx/routerStore';
import AppHeader from '../shared/AppHeader';
import { setUrlParams } from '../shared/deeplink';
import LinearGradient from '../shared/LinearGradient';
import registerStyle from '../shared/registerStyle';
import StatusBar from '../shared/StatusBar';
import v from '../shared/variables';
import SigninProfileItem, { NoServer } from './SigninProfileItem';

const s = registerStyle(v => ({
  _PageSignin: {
    flex: 1,
    display: 'flex',
  },
  _PageSignin_ListServers: {
    height: 320,
    marginBottom: 2 * v.padding,
  },
  View: {
    PageSignin_Spacing: {
      flex: 1,
    },
  },
}));

@observer
class PageSignin extends React.Component {
  componentDidMount() {
    authStore.handleUrlParams();
  }
  componentWillUnmount() {
    setUrlParams(null);
  }

  render() {
    const l = authStore.allProfiles.length;
    return (
      <LinearGradient
        style={s._PageSignin}
        colors={[v.brekekeGreen, '#2a2a2a']}
      >
        <StatusBar transparent />
        <AppHeader
          white
          text="Servers"
          subText={`${l} SERVER${l > 1 ? 'S' : ''} IN TOTAL`}
          onCreateBtnPress={routerStore.goToProfilesCreate}
        />
        <View PageSignin_Spacing />
        {!!l && (
          <FlatList
            horizontal
            style={s._PageSignin_ListServers}
            data={authStore.allProfiles}
            renderItem={({ item, index }) => (
              <SigninProfileItem last={index === l - 1} {...item} />
            )}
            keyExtractor={item => item.id}
          />
        )}
        {!l && <NoServer />}
      </LinearGradient>
    );
  }
}

export default PageSignin;
