import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import authStore from '../---shared/authStore';
import { setUrlParams } from '../---shared/deeplink';
import routerStore from '../---shared/routerStore';
import v from '../---style/variables';
import Layout from '../shared/Layout';
import LinearGradient from '../shared/LinearGradient';
import ProfileSignInItem, { NoServer } from './ProfileSignInItem';

const s = StyleSheet.create({
  PageProfileSignIn: {
    display: 'flex',
    height: '100%',
    minHeight: 550,
  },
  PageProfileSignIn_ListServers: {
    height: '70%',
    minHeight: 320,
    marginBottom: 2 * v.padding,
  },
  PageProfileSignIn_Spacing: {
    flex: 1,
    maxHeight: '30%',
  },
});

@observer
class PageProfileSignIn extends React.Component {
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
        style={s.PageProfileSignIn}
        colors={[v.brekekeGreen, '#2a2a2a']}
      >
        <Layout
          header={{
            transparent: true,
            title: 'Servers',
            description: `${l} server${l > 1 ? 's' : ''} in total`,
            onPlusBtnPress: !!l && routerStore.goToPageProfileCreate,
          }}
        >
          <View style={s.PageProfileSignIn_Spacing} />
          {!!l && (
            <FlatList
              horizontal
              style={s.PageProfileSignIn_ListServers}
              data={authStore.profiles}
              renderItem={({ item, index }) => (
                <ProfileSignInItem last={index === l - 1} {...item} />
              )}
              keyExtractor={item => item.id}
            />
          )}
          {!l && <NoServer />}
        </Layout>
      </LinearGradient>
    );
  }
}

export default PageProfileSignIn;
