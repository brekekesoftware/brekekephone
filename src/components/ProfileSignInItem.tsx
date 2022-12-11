import { observer } from 'mobx-react'
import { FC } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import {
  mdiAccountCircleOutline,
  mdiApplicationOutline,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiUnfoldMoreHorizontal,
  mdiWeb,
} from '../assets/icons'
import { accountStore, PNOptions } from '../stores/accountStore'
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
  ProfileSignInItem: {
    backgroundColor: v.bg,
    marginBottom: 15,
    marginLeft: 15,
    borderRadius: v.borderRadius,
    width: 280,
  },
  ProfileSignInItem__last: {
    marginRight: 15,
  },
  ProfileSignInItem__empty: {
    height: '70%',
    minHeight: 320,
    marginVertical: 45,
    marginLeft: 15,
    padding: 15,
  },
  ProfileSignInItem_Btns: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
})

export const ProfileSignInItem: FC<{
  empty?: boolean
  id?: string
  last?: boolean
}> = observer(props => {
  if (props.empty) {
    return (
      <View style={[css.ProfileSignInItem, css.ProfileSignInItem__empty]}>
        <RnText subTitle>{intl`No account`}</RnText>
        <RnText>{intl`There is no account created`}</RnText>
        <RnText>{intl`Tap the below button to create one`}</RnText>
        <View style={css.ProfileSignInItem_Btns}>
          <FooterActions
            onNext={Nav().goToPageProfileCreate}
            onNextText={intl`CREATE NEW ACCOUNT`}
          />
        </View>
      </View>
    )
  }
  if (!props.id) {
    return null
  }
  const p = accountStore.accountsMap[props.id]
  if (!p) {
    return null
  }
  const isWeb = Platform.OS === 'web'
  const isIos = Platform.OS === 'ios'
  const isLoading = accountStore.pnSyncLoadingMap[props.id]

  const onNotificationPress = (value: PNOptions) => {
    if (value === 'LPC') {
      Nav().goToPageProfileUpdate({ id: p.id, pushNotificationType: value })
      return
    }
    accountStore.upsertAccount({
      id: p.id,
      pushNotificationEnabled: value === 'disabled' ? false : true,
      pushNotificationType: value,
    })
  }
  return (
    <View
      style={[css.ProfileSignInItem, props.last && css.ProfileSignInItem__last]}
    >
      <RnTouchableOpacity
        onPress={() => Nav().goToPageProfileUpdate({ id: p.id })}
      >
        <Field
          icon={mdiAccountCircleOutline}
          label={intl`USERNAME`}
          value={p.pbxUsername}
        />
        <Field
          icon={mdiApplicationOutline}
          label={intl`TENANT`}
          value={p.pbxTenant}
        />
        <Field icon={mdiWeb} label={intl`HOSTNAME`} value={p.pbxHostname} />
        <Field icon={mdiServerNetwork} label={intl`PORT`} value={p.pbxPort} />
      </RnTouchableOpacity>
      {!isWeb &&
        (!isIos ? (
          <Field
            label={intl`PUSH NOTIFICATION`}
            onValueChange={(e: boolean) =>
              accountStore.upsertAccount({
                id: p.id,
                pushNotificationEnabled: e,
              })
            }
            type='Switch'
            value={p.pushNotificationEnabled}
            loading={isLoading}
          />
        ) : (
          <Field
            label={intl`PUSH NOTIFICATION`}
            onValueChange={onNotificationPress}
            type='RnPicker'
            options={[
              { key: 'disabled', label: intl`Disabled` },
              { key: 'APNs', label: intl`APNs Push Notification` },
              { key: 'LPC', label: intl`LPC Push Notification` },
            ]}
            value={p.pushNotificationType}
            disabled={false}
            icon={mdiUnfoldMoreHorizontal}
            loading={isLoading}
          />
        ))}
      <Field
        label={intl`UC`}
        onValueChange={(e: boolean) =>
          accountStore.upsertAccount({ id: p.id, ucEnabled: e })
        }
        type='Switch'
        value={p.ucEnabled}
      />
      <View style={css.ProfileSignInItem_Btns}>
        <FooterActions
          onBack={() => {
            RnAlert.prompt({
              title: intl`Remove Account`,
              message: (
                <>
                  <View>
                    <RnText small>
                      {p.pbxUsername} - {p.pbxHostname}
                    </RnText>
                  </View>
                  <RnText>{intl`Do you want to remove this account?`}</RnText>
                </>
              ),
              onConfirm: () => {
                accountStore.removeAccount(p.id)
              },
            })
          }}
          onBackIcon={mdiClose}
          onMore={() => Nav().goToPageProfileUpdate({ id: p.id })}
          onMoreIcon={mdiDotsHorizontal}
          onNext={() => {
            getAuthStore().signIn(p)
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
