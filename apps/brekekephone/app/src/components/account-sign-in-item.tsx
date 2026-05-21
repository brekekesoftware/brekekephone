import { observer } from 'mobx-react'
import type { FC } from 'react'

import { View } from '@/rn/core/components/view'
import {
  mdiAccountCircleOutline,
  mdiApplicationOutline,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiWeb,
} from '#/assets/icons'
import { Field } from '#/components/field'
import { FooterActions } from '#/components/footer-actions'
import { RnText, RnTouchableOpacity } from '#/components/rn'
import { isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { checkPermForCall, permForCall } from '#/utils/permissions'

export const AccountSignInItem: FC<{
  empty?: boolean
  id?: string
  last?: boolean
}> = observer(props => {
  if (props.empty) {
    const onPressCreateAccount = async () => {
      if (!(await permForCall(true))) {
        return
      }
      ctx.nav.goToPageAccountCreate()
    }
    return (
      <View className='my-11.25 mb-3.75 ml-3.75 h-[70%] min-h-80 w-70 rounded-[3px] bg-white p-3.75'>
        <RnText subTitle>{intl`No account`}</RnText>
        <RnText>{intl`There is no account created`}</RnText>
        <RnText>{intl`Tap the below button to create one`}</RnText>
        <View className='absolute right-3.75 bottom-3.75 left-3.75'>
          <FooterActions
            onNext={onPressCreateAccount}
            onNextText={intl`CREATE NEW ACCOUNT`}
          />
        </View>
      </View>
    )
  }
  if (!props.id) {
    return null
  }
  const a = ctx.account.accountsMap[props.id]
  if (!a) {
    return null
  }
  const isLoading = ctx.account.pnSyncLoadingMap[props.id]

  const onPressSignIn = async () => {
    if (!(await permForCall(a.pushNotificationEnabled))) {
      return
    }
    ctx.auth.signIn(a)
    if (!isWeb) {
      // try to end callkeep if it's stuck
      ctx.call.endCallKeepAllCalls()
    }
  }
  const onSwitchEnableNotification = async (e: boolean) => {
    if (e && !(await checkPermForCall(true, true))) {
      return
    }
    // Block toggle when offline — sync would silently fail otherwise.
    if (ctx.auth.hasInternetConnected === false) {
      ctx.toast.internet()
      return
    }
    if (ctx.account.needsMFAForPnSync(a)) {
      ctx.account.pendingPnEnabled = e
      ctx.pnToken.sync(a)
      return
    }
    ctx.account.upsertAccount({
      id: a.id,
      pushNotificationEnabled: e,
    })
  }
  return (
    <View
      className={[
        'bg-background my-11.25 mb-3.75 ml-3.75 h-[90%] min-h-80 w-70 rounded-[3px]',
        props.last && 'mr-3.75',
      ]}
    >
      <RnTouchableOpacity
        onPress={() => ctx.nav.goToPageAccountUpdate({ id: a.id })}
      >
        <Field
          icon={mdiAccountCircleOutline}
          label={intl`USERNAME`}
          value={a.pbxUsername}
        />
        <Field
          icon={mdiApplicationOutline}
          label={intl`TENANT`}
          value={a.pbxTenant}
        />
        <Field icon={mdiWeb} label={intl`HOSTNAME`} value={a.pbxHostname} />
        <Field icon={mdiServerNetwork} label={intl`PORT`} value={a.pbxPort} />
      </RnTouchableOpacity>
      <Field
        label={intl`PUSH NOTIFICATION`}
        onValueChange={(e: boolean) => onSwitchEnableNotification(e)}
        type='Switch'
        value={a.pushNotificationEnabled}
        loading={isLoading}
      />
      <Field
        label='UC'
        onValueChange={(e: boolean) =>
          ctx.account.upsertAccount({ id: a.id, ucEnabled: e })
        }
        type='Switch'
        value={a.ucEnabled}
      />
      <View className='absolute right-3.75 bottom-3.75 left-3.75'>
        <FooterActions
          onBack={() => {
            RnAlert.prompt({
              title: intl`Remove Account`,
              message: (
                <>
                  <View>
                    <RnText small>
                      {a.pbxUsername} - {a.pbxHostname}
                    </RnText>
                  </View>
                  <RnText>{intl`Do you want to remove this account?`}</RnText>
                </>
              ),
              onConfirm: () => ctx.account.removeAccount(a.id),
            })
          }}
          onBackIcon={mdiClose}
          onMore={() => ctx.nav.goToPageAccountUpdate({ id: a.id })}
          onMoreIcon={mdiDotsHorizontal}
          onNext={onPressSignIn}
          onNextText={intl`SIGN IN`}
        />
      </View>
    </View>
  )
})
