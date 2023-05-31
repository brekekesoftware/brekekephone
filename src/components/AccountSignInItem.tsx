import { observer } from 'mobx-react'
import { FC } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import {
  mdiAccountCircleOutline,
  mdiApplicationOutline,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiWeb,
} from '../assets/icons'
import { accountStore } from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { Field } from './Field'
import { FooterActions } from './FooterActions'
import { RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  AccountSignInItem: {
    backgroundColor: v.bg,
    marginBottom: 15,
    marginLeft: 15,
    borderRadius: v.borderRadius,
    width: 280,
  },
  AccountSignInItem__last: {
    marginRight: 15,
  },
  AccountSignInItem__empty: {
    height: '70%',
    minHeight: 320,
    marginVertical: 45,
    marginLeft: 15,
    padding: 15,
  },
  AccountSignInItem_Btns: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
})

export const AccountSignInItem: FC<{
  empty?: boolean
  id?: string
  last?: boolean
}> = observer(props => {
  if (props.empty) {
    return (
      <View style={[css.AccountSignInItem, css.AccountSignInItem__empty]}>
        <RnText subTitle>{intl`No account`}</RnText>
        <RnText>{intl`There is no account created`}</RnText>
        <RnText>{intl`Tap the below button to create one`}</RnText>
        <View style={css.AccountSignInItem_Btns}>
          <FooterActions
            onNext={Nav().goToPageAccountCreate}
            onNextText={intl`CREATE NEW ACCOUNT`}
          />
        </View>
      </View>
    )
  }
  if (!props.id) {
    return null
  }
  const a = accountStore.accountsMap[props.id]
  if (!a) {
    return null
  }
  const isLoading = accountStore.pnSyncLoadingMap[props.id]

  return (
    <View
      style={[css.AccountSignInItem, props.last && css.AccountSignInItem__last]}
    >
      <RnTouchableOpacity
        onPress={() => Nav().goToPageAccountUpdate({ id: a.id })}
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
        onValueChange={(e: boolean) =>
          accountStore.upsertAccount({
            id: a.id,
            pushNotificationEnabled: e,
          })
        }
        type='Switch'
        value={a.pushNotificationEnabled}
        loading={isLoading}
      />
      <Field
        label='UC'
        onValueChange={(e: boolean) =>
          accountStore.upsertAccount({ id: a.id, ucEnabled: e })
        }
        type='Switch'
        value={a.ucEnabled}
      />
      <View style={css.AccountSignInItem_Btns}>
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
              onConfirm: () => {
                accountStore.removeAccount(a.id)
              },
            })
          }}
          onBackIcon={mdiClose}
          onMore={() => Nav().goToPageAccountUpdate({ id: a.id })}
          onMoreIcon={mdiDotsHorizontal}
          onNext={() => {
            getAuthStore().signIn(a)
            // Try to end callkeep if it's stuck
            if (Platform.OS !== 'web') {
              getCallStore().endCallKeepAllCalls()
            }
          }}
          onNextText={intl`SIGN IN`}
        />
      </View>
    </View>
  )
})
