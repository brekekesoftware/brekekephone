import { observer } from 'mobx-react'
import { FlatList, StyleSheet, View } from 'react-native'

import { AccountSignInItem } from '#/components/AccountSignInItem'
import { AccountSignInItemMFA } from '#/components/AccountSignInItemMFA'
import { BrekekeGradient } from '#/components/BrekekeGradient'
import { Layout } from '#/components/Layout'
import { intl } from '#/stores/intl'

const css = StyleSheet.create({
  PageAccountSignIn_ListServers: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    height: '20%',
    minHeight: 320,
  },
  PageAccountSignIn_Spacing: {
    flex: 1,
    maxHeight: '20%',
  },
  Space: {
    height: 15,
  },
})

export const PageAccountSignInMFA = observer(() => {
  const l = 0
  // TODO: Text color must be white
  const dataMock = [{ id: '0', pbxHostname: '', pbxPort: '', pbxTenant: '' }]
  return (
    <BrekekeGradient>
      <Layout
        description={intl`${l} SERVERS IN TOTAL`}
        noScroll
        onCreate={undefined}
        title={intl`Servers`}
        transparent
      >
        {/* <View style={css.PageAccountSignIn_Spacing} /> */}
        <View style={css.PageAccountSignIn_ListServers}>
          {l ? (
            <AccountSignInItem empty />
          ) : (
            <FlatList
              data={['1']}
              horizontal
              keyExtractor={(id: string) => id}
              renderItem={({ index, item }) => (
                <AccountSignInItemMFA id={item} last={index === l - 1} />
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </Layout>
    </BrekekeGradient>
  )
})
