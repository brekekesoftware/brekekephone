import { observer } from 'mobx-react';
import React from 'react';

import g from '../global';
import { FlatList, StyleSheet, View } from '../native/Rn';
import BrekekeGradient from '../shared/BrekekeGradient';
import Layout from '../shared/Layout';
import ProfileSignInItem from './ProfileSignInItem';

const s = StyleSheet.create({
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
        noScroll
        header={{
          transparent: true,
          title: `Servers`,
          description: `${l} server${l > 1 ? `s` : ``} in total`,
          onCreateBtnPress: !!l && g.goToPageProfileCreate,
        }}
      >
        <View style={s.PageProfileSignIn_Spacing} />
        {!!l && (
          <FlatList
            horizontal
            style={s.PageProfileSignIn_ListServers}
            data={g.profiles.toJS() /* Fix observable inside FlatList */}
            renderItem={({ item, index }) => (
              <ProfileSignInItem last={index === l - 1} id={item.id} />
            )}
            keyExtractor={item => item.id}
          />
        )}
        {!l && <ProfileSignInItem empty />}
      </Layout>
    </BrekekeGradient>
  );
});

export default PageProfileSignIn;
