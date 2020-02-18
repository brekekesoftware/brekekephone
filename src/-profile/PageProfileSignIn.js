import { mdiDotsHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import {
  FlatList,
  Icon,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from '../-/Rn';
import g from '../global';
import intl from '../intl/intl';
import BrekekeGradient from '../shared/BrekekeGradient';
import Layout from '../shared/Layout';
import ProfileSignInItem from './ProfileSignInItem';

const css = StyleSheet.create({
  PageProfileSignIn_ListServers: {
    height: `70%`,
    minHeight: 500,
  },
  PageProfileSignIn_Spacing: {
    flex: 1,
    maxHeight: `20%`,
  },
  Space: {
    height: 15,
  },
  Language: {
    position: `absolute`,
    bottom: 0,
    right: 0,
    paddingTop: 25,
    paddingBottom: 10,
    paddingHorizontal: 15,
    ...g.backdropZindex,
  },
  Language_Inner: {
    flexDirection: `row`,
    justifyContent: `flex-end`,
    paddingRight: 17,
  },
  Language_DropdownIcon: {
    position: `absolute`,
    top: 2,
    right: 0,
    ...Platform.select({
      android: {
        top: 4,
      },
    }),
  },
});

const PageProfileSignIn = observer(() => {
  const l = g.profiles.length;
  return (
    <BrekekeGradient>
      <Layout
        description={intl`${l} server${l > 1 ? `s` : ``} in total`}
        noScroll
        onCreate={!!l && g.goToPageProfileCreate}
        title={intl`Servers`}
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
      <TouchableOpacity
        onPress={g.localeLoading ? null : g.selectLocale}
        style={css.Language}
      >
        <View style={css.Language_Inner}>
          <Text bold white>
            {g.localeLoading ? `\u200a` : g.localeName}
          </Text>
          <Icon
            color="white"
            path={g.localeLoading ? mdiDotsHorizontal : mdiUnfoldMoreHorizontal}
            size={16}
            style={css.Language_DropdownIcon}
          />
        </View>
      </TouchableOpacity>
      <View style={css.Space} />
    </BrekekeGradient>
  );
});

export default PageProfileSignIn;
