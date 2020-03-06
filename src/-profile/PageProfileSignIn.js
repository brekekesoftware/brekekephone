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
import { currentVersion } from '../-settings/PageSettingsDebug';

const css = StyleSheet.create({
  PageProfileSignIn_ListServers: {
    height: `70%`,
    minHeight: 320,
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
  CornerButton__info: {
    left: 0,
  },
  CornerButton__language: {
    right: 0,
  },
  CornerButton_Inner: {
    flexDirection: `row`,
    justifyContent: `flex-end`,
  },
  CornerButton_Inner__info: {
    paddingLeft: 19,
  },
  CornerButton_Inner__language: {
    paddingRight: 18,
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
  CornerButton_Icon__info: {
    left: 0,
  },
  CornerButton_Icon__language: {
    right: 0,
  },
});

const PageProfileSignIn = observer(() => {
  const l = g.profiles.length;
  return (
    <BrekekeGradient>
      <Layout
        description={intl`${l} accounts in total`}
        noScroll
        onCreate={!!l && g.goToPageProfileCreate}
        title={intl`Accounts`}
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
        <View style={[css.CornerButton_Inner, css.CornerButton_Inner__info]}>
          <Icon
            color="white"
            path={mdiLadybug}
            size={16}
            style={[css.CornerButton_Icon, css.CornerButton_Icon__info]}
          />
          <Text bold white>
            {currentVersion}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={g.localeLoading ? null : g.selectLocale}
        style={[css.CornerButton, css.CornerButton__language]}
      >
        <View
          style={[css.CornerButton_Inner, css.CornerButton_Inner__language]}
        >
          <Text bold white>
            {g.localeLoading ? `\u200a` : g.localeName}
          </Text>
          <Icon
            color="white"
            path={g.localeLoading ? mdiDotsHorizontal : mdiUnfoldMoreHorizontal}
            size={16}
            style={[css.CornerButton_Icon, css.CornerButton_Icon__language]}
          />
        </View>
      </TouchableOpacity>
      <View style={css.Space} />
    </BrekekeGradient>
  );
});

export default PageProfileSignIn;
