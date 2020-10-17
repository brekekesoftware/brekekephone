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

import FooterActions from '../Footer/Actions'
import g from '../global'
import authStore from '../global/authStore'
import intl from '../intl/intl'
import { StyleSheet, Text, TouchableOpacity, View } from '../Rn'
import Field from '../shared/Field'

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
        <Text subTitle>{intl`No account`}</Text>
        <Text>{intl`There is no account created`}</Text>
        <Text>{intl`Tap the below button to create one`}</Text>
        <View style={css.ProfileSignInItem_Btns}>
          <FooterActions
            onNext={g.goToPageProfileCreate}
            onNextText={intl`CREATE NEW ACCOUNT`}
          />
        </View>
      </View>
    )
  }
  const p = g.profilesMap[props.id]
  return (
    <View
      style={[css.ProfileSignInItem, props.last && css.ProfileSignInItem__last]}
    >
      <TouchableOpacity onPress={() => g.goToPageProfileUpdate({ id: p.id })}>
        <Field
          icon={mdiAccountCircleOutline}
          label={intl`USERNAME`}
          value={p.pbxUsername}
        />
        <Field icon={mdiApplication} label={intl`TENANT`} value={p.pbxTenant} />
        <Field icon={mdiWeb} label={intl`HOSTNAME`} value={p.pbxHostname} />
        <Field icon={mdiServerNetwork} label={intl`PORT`} value={p.pbxPort} />
      </TouchableOpacity>
      <Field
        label={intl`PUSH NOTIFICATION`}
        onValueChange={v =>
          g.upsertProfile({ id: p.id, pushNotificationEnabled: v })
        }
        type="Switch"
        value={p.pushNotificationEnabled}
      />
      <Field
        label={intl`UC`}
        onValueChange={v => g.upsertProfile({ id: p.id, ucEnabled: v })}
        type="Switch"
        value={p.ucEnabled}
      />
      <View style={css.ProfileSignInItem_Btns}>
        <FooterActions
          onBack={() => {
            g.showPrompt({
              title: intl`Remove Account`,
              message: (
                <React.Fragment>
                  <View>
                    <Text small>
                      {p.pbxUsername} - {p.pbxHostname}
                    </Text>
                  </View>
                  <Text>{intl`Do you want to remove this account?`}</Text>
                </React.Fragment>
              ),
              onConfirm: () => {
                g.removeProfile(p.id)
              },
            })
          }}
          onBackIcon={mdiClose}
          onMore={() => g.goToPageProfileUpdate({ id: p.id })}
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
