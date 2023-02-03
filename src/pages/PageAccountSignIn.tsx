import { observer } from 'mobx-react'
import { FlatList, Platform, StyleSheet, View } from 'react-native'

import {
  mdiDotsHorizontal,
  mdiLadybug,
  mdiUnfoldMoreHorizontal,
} from '../assets/icons'
import { AccountSignInItem } from '../components/AccountSignInItem'
import { BrekekeGradient } from '../components/BrekekeGradient'
import { Layout } from '../components/Layout'
import { RnIcon, RnText, RnTouchableOpacity } from '../components/Rn'
import { currentVersion, v } from '../components/variables'
import { accountStore } from '../stores/accountStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { Nav } from '../stores/Nav'

const css = StyleSheet.create({
  PageAccountSignIn_ListServers: {
    height: '70%',
    minHeight: 320,
  },
  PageAccountSignIn_Spacing: {
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
    ...v.backdropZindex,
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

export const PageAccountSignIn = observer(() => {
  const ids = accountStore.accounts.map(a => a.id).filter(id => id)
  const l = ids.length
  return (
    <BrekekeGradient>
      <Layout
        description={intl`${l} accounts in total`}
        noScroll
        onCreate={!!l ? Nav().goToPageAccountCreate : undefined}
        title={intl`Accounts`}
        transparent
      >
        <View
          style={{
            flexDirection: 'column',
            width: '100%',
            justifyContent: 'space-around',
          }}
        ></View>
        <View style={css.PageAccountSignIn_Spacing} />
        {!l ? (
          <AccountSignInItem empty />
        ) : (
          <FlatList
            data={ids}
            horizontal
            keyExtractor={(id: string) => id}
            renderItem={({ index, item }) => (
              <AccountSignInItem id={item} last={index === l - 1} />
            )}
            showsHorizontalScrollIndicator={false}
            style={css.PageAccountSignIn_ListServers}
          />
        )}
      </Layout>
      <RnTouchableOpacity
        onPress={Nav().goToPageSettingsDebug}
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
        onPress={intlStore.localeLoading ? undefined : intlStore.selectLocale}
        style={[css.CornerButton, css.CornerButton__language]}
      >
        <View
          style={[css.CornerButton_Inner, css.CornerButton_Inner__language]}
        >
          <RnText bold white>
            {intlStore.localeLoading ? '\u200a' : intlStore.getLocaleName()}
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
