import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import { FlatList, StyleSheet, View } from '../native/Rn';
import BrekekeGradient from '../shared/BrekekeGradient';
import Layout from '../shared/Layout';
import ProfileSignInItem from './ProfileSignInItem';

const css = StyleSheet.create({
  PageProfileSignIn_ListServers: {
    height: `70%`,
    minHeight: 320,
    marginBottom: 30,
  },
  PageProfileSignIn_Spacing: {
    flex: 1,
    maxHeight: `30%`,
  },
});

const PageProfileSignIn = observer(() => {
  const l = g.profiles.length;
  return (
    <BrekekeGradient colors={[g.mainBg, g.revBg]}>
      <Layout
        header={{
          transparent: true,
          title: `Servers`,
          description: `${l} server${l > 1 ? `s` : ``} in total`,
          onCreateBtnPress: !!l && g.goToPageProfileCreate,
        }}
        noScroll
      >
        <View style={css.PageProfileSignIn_Spacing} />
        {!!l && (
          <FlatList
            data={g.profiles.toJS() /* Fix observable inside FlatList */}
            horizontal
            keyExtractor={item => item.id}
            renderItem={({ index, item }) => (
              <ProfileSignInItem id={item.id} last={index === l - 1} />
            )}
            style={css.PageProfileSignIn_ListServers}
          />
        )}
        {!l && <ProfileSignInItem empty />}
      </Layout>
    </BrekekeGradient>
  );
});

export default PageProfileSignIn;
