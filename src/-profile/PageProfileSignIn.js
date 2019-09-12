import { observer } from 'mobx-react';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import authStore from '../-/authStore';
import { setUrlParams } from '../-/deeplink';
import g from '../global';
import BrekekeGradient from '../shared/BrekekeGradient';
import Layout from '../shared/Layout';
import ProfileSignInItem from './ProfileSignInItem';

const s = StyleSheet.create({
  PageProfileSignIn_ListServers: {
    height: '70%',
    minHeight: 320,
    marginBottom: 30,
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
      <BrekekeGradient>
        <Layout
          noPadding
          header={{
            transparent: true,
            title: 'Servers',
            description: `${l} server${l > 1 ? 's' : ''} in total`,
            onPlusBtnPress: !!l && g.goToProfileCreate,
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
          {!l && <ProfileSignInItem empty />}
        </Layout>
      </BrekekeGradient>
    );
  }
}

export default PageProfileSignIn;
