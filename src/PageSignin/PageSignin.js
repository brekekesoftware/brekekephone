import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import authStore from '../mobx/authStore';
import * as routerUtils from '../mobx/routerStore';
import AppHeader from '../shared/AppHeader';
import { setUrlParams } from '../shared/deeplink';
import LinearGradient from '../shared/LinearGradient';
import StatusBar from '../shared/StatusBar';
import v from '../style/variables';
import SigninProfileItem, { NoServer } from './SigninProfileItem';

const s = StyleSheet.create({
  PageSignin: {
    flex: 1,
  },
  ListServer: {
    paddingTop: 3 * v.padding,
    marginBottom: 2 * v.padding,
  },
});

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
      <LinearGradient style={s.PageSignin} colors={[v.brekekeGreen, '#2a2a2a']}>
        <StatusBar transparent />
        <AppHeader
          text="Servers"
          subText={`${l} SERVER${l > 1 ? 'S' : ''} IN TOTAL`}
          onCreateBtnPress={routerUtils.goToProfilesCreate}
          createBtnGreen={false}
        />
        {!!l && (
          <FlatList
            horizontal
            style={s.ListServer}
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
