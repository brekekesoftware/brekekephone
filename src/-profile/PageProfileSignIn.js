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
  },
  PageProfileSignIn_Spacing: {
    flex: 1,
    maxHeight: `30%`,
  },
});

const PageProfileSignIn = observer(() => {
  const l = g.profiles.length;
  return (
    <BrekekeGradient colors={[g.colors.primaryFn(0.2), g.revBg]}>
      <Layout
        description={`${l} server${l > 1 ? `s` : ``} in total`}
        noScroll
        onCreateBtnPress={!!l && g.goToPageProfileCreate}
        title="Servers"
        transparent
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
            showsHorizontalScrollIndicator={false}
            style={css.PageProfileSignIn_ListServers}
          />
        )}
        {!l && <ProfileSignInItem empty />}
      </Layout>
    </BrekekeGradient>
  );
});

export default PageProfileSignIn;
