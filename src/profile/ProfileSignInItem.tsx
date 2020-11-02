import {
  mdiAccountCircleOutline,
  mdiApplication,
  mdiClose,
  mdiDotsHorizontal,
  mdiServerNetwork,
  mdiWeb,
} from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import FooterActions from '../Footer/Actions'
import authStore from '../global/authStore'
import Nav from '../global/Nav'
import profileStore from '../global/profileStore'
import RnAlert from '../global/RnAlert'
import intl from '../intl/intl'
import { RnText, RnTouchableOpacity } from '../Rn'
import Field from '../shared/Field'
import g from '../variables'

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
})

const ProfileSignInItem = observer(props => {
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
  const p = profileStore.profilesMap[props.id]
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
        onValueChange={v =>
          profileStore.upsertProfile({ id: p.id, pushNotificationEnabled: v })
        }
        type='Switch'
        value={p.pushNotificationEnabled}
      />
      <Field
        label={intl`UC`}
        onValueChange={v =>
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
                <React.Fragment>
                  <View>
                    <RnText small>
                      {p.pbxUsername} - {p.pbxHostname}
                    </RnText>
                  </View>
                  <RnText>{intl`Do you want to remove this account?`}</RnText>
                </React.Fragment>
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
            authStore.signIn(p.id)
          }}
          onNextText={intl`SIGN IN`}
        />
      </View>
    </View>
  )
})

export default ProfileSignInItem
