import { observer } from 'mobx-react'
import { FlatList, StyleSheet, View } from 'react-native'

import { AccountSignInItemMFA } from '#/components/AccountSignInItemMFA'
import { BrekekeGradient } from '#/components/BrekekeGradient'
import { Layout } from '#/components/Layout'
import { v } from '#/components/variables'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { permForCall } from '#/utils/permissions'

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
  Footer: {
    position: 'absolute',
    bottom: 0,
    paddingTop: 25,
    paddingBottom: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    ...v.backdropZindex,
  },
})

export const PageAccountSignInMFA = observer(() => {
  const ids = ctx.account.accounts.map(a => a.id).filter(id => id)
  const l = 1
  const createAccount = async () => {
    if (!(await permForCall(true))) {
      return
    }
    ctx.nav.goToPageAccountCreate()
  }
  return (
    <BrekekeGradient>
      <Layout
        description={intl`${l} SERVERS IN TOTAL`}
        noScroll
        onCreate={!!l ? createAccount : undefined}
        title={intl`Servers`}
        transparent
      >
        <View style={css.PageAccountSignIn_ListServers}>
          {!l ? (
            <AccountSignInItemMFA empty />
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
