import { observer } from 'mobx-react'

import { FlatList } from '@/rn/core/components/flat-list'
import { View } from '@/rn/core/components/view'
import {
  mdiDotsHorizontal,
  mdiLadybug,
  mdiUnfoldMoreHorizontal,
} from '#/assets/icons'
import { AccountSignInItem } from '#/components/account-sign-in-item'
import { BrekekeGradient } from '#/components/brekeke-gradient'
import { Layout } from '#/components/layout'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { currentVersion } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { permForCall } from '#/utils/permissions'

export const PageAccountSignIn = observer(() => {
  const ids = ctx.account.accounts.map(a => a.id).filter(id => id)
  const l = ids.length
  const createAccount = async () => {
    if (!(await permForCall(true))) {
      return
    }
    ctx.nav.goToPageAccountCreate()
  }
  return (
    <BrekekeGradient className='max-h-full flex-1'>
      <Layout
        description={intl`${l} accounts in total`}
        noScroll
        onCreate={!!l ? createAccount : undefined}
        title={intl`Accounts`}
        transparent
      >
        <View className='w-full flex-col justify-around' />
        <View className='max-h-[20%] flex-1' />
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
            className='h-[70%] min-h-80'
          />
        )}
      </Layout>
      <RnTouchableOpacity
        className='absolute bottom-0 z-999 px-3.75 pt-6.25 pb-2.5'
        onPress={ctx.nav.goToPageSettingsDebug}
      >
        <View className='flex-row justify-end pl-4.75'>
          <RnIcon
            className='absolute top-0.5 left-0 text-white'
            path={mdiLadybug}
            size={16}
          />
          <RnText bold white>
            {currentVersion}
          </RnText>
        </View>
      </RnTouchableOpacity>
      <RnTouchableOpacity
        onPress={ctx.intl.localeLoading ? undefined : ctx.intl.selectLocale}
        className='absolute right-0 bottom-0 z-999 px-3.75 pt-6.25 pb-2.5'
      >
        <View className='flex-row justify-end pr-4.5'>
          <RnText bold white>
            {ctx.intl.localeLoading ? '\u200a' : ctx.intl.getLocaleName()}
          </RnText>
          <RnIcon
            path={
              ctx.intl.localeLoading
                ? mdiDotsHorizontal
                : mdiUnfoldMoreHorizontal
            }
            size={16}
            className='absolute top-0.5 right-0 text-white'
          />
        </View>
      </RnTouchableOpacity>
      <View className='h-3.75' />
    </BrekekeGradient>
  )
})
