import { mdiDotsHorizontal, mdiLadybug, mdiUnfoldMoreHorizontal } from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'
import { FlatList, Platform, StyleSheet, View } from 'react-native'

import g from '../global'
import Nav from '../global/Nav'
import intl from '../intl/intl'
import intlStore from '../intl/intlStore'
import { RnIcon, RnText, RnTouchableOpacity } from '../Rn'
import BrekekeGradient from '../shared/BrekekeGradient'
import Layout from '../shared/Layout'
import { currentVersion } from '../variables'
import ProfileSignInItem from './ProfileSignInItem'

const css = StyleSheet.create({
  PageProfileSignIn_ListServers: {
    height: '70%',
    minHeight: 320,
  },
  PageProfileSignIn_Spacing: {
    flex: 1,
    maxHeight: '20%',
  },
  Space: {
    height: 15,
  },
  CornerButton: {
    position: 'absolute',
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  CornerButton_Inner__info: {
    paddingLeft: 19,
  },
  CornerButton_Inner__language: {
    paddingRight: 18,
  },
  CornerButton_Icon: {
    position: 'absolute',
    ...Platform.select({
      android: {
        top: 4,
      },
      default: {
        top: 2,
      },
    }),
  },
  CornerButton_Icon__info: {
    left: 0,
  },
  CornerButton_Icon__language: {
    right: 0,
  },
})

const PageProfileSignIn = observer(() => {
  const l = g.profiles.length
  return (
    <BrekekeGradient>
      <Layout
        description={intl`${l} accounts in total`}
        noScroll
        onCreate={!!l && Nav.goToPageProfileCreate}
        title={intl`Accounts`}
        transparent
      >
        <View style={css.PageProfileSignIn_Spacing} />
        {!!l && (
          <FlatList
            data={g.profiles.toJS() /* Fix observable inside FlatList */}
            horizontal
            keyExtractor={(item: any) => item.id}
            renderItem={({ index, item }) => (
              <ProfileSignInItem id={item.id} last={index === l - 1} />
            )}
            showsHorizontalScrollIndicator={false}
            style={css.PageProfileSignIn_ListServers}
          />
        )}
        {!l && <ProfileSignInItem empty />}
      </Layout>
      <RnTouchableOpacity
        onPress={Nav.goToPageSettingsDebug}
        style={css.CornerButton}
      >
        <View style={[css.CornerButton_Inner, css.CornerButton_Inner__info]}>
          <RnIcon
            color='white'
            path={mdiLadybug}
            size={16}
            style={[css.CornerButton_Icon, css.CornerButton_Icon__info]}
          />
          <RnText bold white>
            {currentVersion}
          </RnText>
        </View>
      </RnTouchableOpacity>
      <RnTouchableOpacity
        onPress={intlStore.localeLoading ? null : intlStore.selectLocale}
        style={[css.CornerButton, css.CornerButton__language]}
      >
        <View
          style={[css.CornerButton_Inner, css.CornerButton_Inner__language]}
        >
          <RnText bold white>
            {intlStore.localeLoading ? '\u200a' : intlStore.localeName}
          </RnText>
          <RnIcon
            color='white'
            path={
              intlStore.localeLoading
                ? mdiDotsHorizontal
                : mdiUnfoldMoreHorizontal
            }
            size={16}
            style={[css.CornerButton_Icon, css.CornerButton_Icon__language]}
          />
        </View>
      </RnTouchableOpacity>
      <View style={css.Space} />
    </BrekekeGradient>
  )
})

export default PageProfileSignIn
