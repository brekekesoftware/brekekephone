import {
  mdiDotsHorizontal,
  mdiLadybug,
  mdiUnfoldMoreHorizontal,
} from '@mdi/js';
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
  CornerButton: {
    position: `absolute`,
    bottom: 0,
    paddingTop: 25,
    paddingBottom: 10,
    paddingHorizontal: 15,
    ...g.backdropZindex,
  },
  CornerButton__left: {
    left: 0,
  },
  CornerButton__right: {
    right: 0,
  },
  CornerButton_Inner: {
    flexDirection: `row`,
    justifyContent: `flex-end`,
  },
  CornerButton_Inner__left: {
    paddingLeft: 15,
  },
  CornerButton_Inner__right: {
    paddingRight: 17,
  },
  CornerButton_Icon: {
    position: `absolute`,
    top: 2,
    ...Platform.select({
      android: {
        top: 4,
      },
    }),
  },
  CornerButton_Icon__left: {
    top: 4,
    left: 0,
    ...Platform.select({
      android: {
        top: 6,
      },
    }),
  },
  CornerButton_Icon__right: {
    right: 0,
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
        onPress={g.goToPageSettingsDebug}
        style={[css.CornerButton, css.CornerButton__Left]}
      >
        <View
          style={[
            css.CornerButton_Inner,
            css.CornerButton_Inner__right,
            css.CornerButton_Inner__left,
          ]}
        >
          <Icon
            color="white"
            path={mdiLadybug}
            size={13}
            style={[css.CornerButton_Icon, css.CornerButton_Icon__left]}
          />
          <Text bold white>
            2.0.0
          </Text>
          <Icon
            color="white"
            path={mdiUnfoldMoreHorizontal}
            size={16}
            style={[css.CornerButton_Icon, css.CornerButton_Icon__right]}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={g.localeLoading ? null : g.selectLocale}
        style={[css.CornerButton, css.CornerButton__right]}
      >
        <View style={[css.CornerButton_Inner, css.CornerButton_Inner__right]}>
          <Text bold white>
            {g.localeLoading ? `\u200a` : g.localeName}
          </Text>
          <Icon
            color="white"
            path={g.localeLoading ? mdiDotsHorizontal : mdiUnfoldMoreHorizontal}
            size={16}
            style={[css.CornerButton_Icon, css.CornerButton_Icon__right]}
          />
        </View>
      </TouchableOpacity>
      <View style={css.Space} />
    </BrekekeGradient>
  );
});

export default PageProfileSignIn;
