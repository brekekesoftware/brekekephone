import {
  mdiAccountCircleOutline,
  mdiApplication,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiWeb,
} from '@mdi/js'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { getAuthStore } from '../stores/authStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore from '../stores/profileStore'
import RnAlert from '../stores/RnAlert'
import Field from './Field'
import FooterActions from './FooterActions'
import { RnText, RnTouchableOpacity } from './Rn'
import g from './variables'

const css = StyleSheet.create({
  ProfileSignInItem: {
    backgroundColor: g.bg,
    marginBottom: 15,
    marginLeft: 15,
    borderRadius: g.borderRadius,
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
  Loading: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    opacity: 0.3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const ProfileSignInItem: FC<{
  empty?: boolean
  id?: string
  last?: boolean
}> = observer(props => {
  if (props.empty || !props.id) {
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
  const p = profileStore.profilesMap[props.id]
  const isLoading = profileStore.pnSyncLoadingMap[props.id]
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
        <Field icon={mdiApplication} label={intl`TENANT`} value={p.pbxTenant} />
        <Field icon={mdiWeb} label={intl`HOSTNAME`} value={p.pbxHostname} />
        <Field icon={mdiServerNetwork} label={intl`PORT`} value={p.pbxPort} />
      </RnTouchableOpacity>
      <Field
        label={intl`PUSH NOTIFICATION`}
        onValueChange={(v: boolean) =>
          profileStore.upsertProfile({ id: p.id, pushNotificationEnabled: v })
        }
        type='Switch'
        value={p.pushNotificationEnabled}
      />
      <Field
        label={intl`UC`}
        onValueChange={(v: boolean) =>
          profileStore.upsertProfile({ id: p.id, ucEnabled: v })
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
                profileStore.removeProfile(p.id)
              },
            })
          }}
          onBackIcon={mdiClose}
          onMore={() => Nav().goToPageProfileUpdate({ id: p.id })}
          onMoreIcon={mdiDotsHorizontal}
          onNext={() => {
            getAuthStore().signIn(p.id)
          }}
          onNextText={intl`SIGN IN`}
        />
      </View>
      {isLoading && (
        <View style={css.Loading}>
          <ActivityIndicator size='small' color='white' />
        </View>
      )}
    </View>
  )
})

export default ProfileSignInItem
