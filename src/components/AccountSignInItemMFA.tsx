import { observer } from 'mobx-react'
import type { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import {
  mdiDeleteAccount,
  mdiEditAccount,
  mdiHomeAccount,
  mdiHostName,
  mdiPort,
} from '#/assets/icons'
import { FieldMFA } from '#/components/FieldMFA'
import { FieldSwitchMFA } from '#/components/FieldSwitchMFA'
import { FooterActions } from '#/components/FooterActions'
import { FooterActionsMFA } from '#/components/FooterActionsMFA'
import { RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'

const css = StyleSheet.create({
  AccountSignInItem: {
    backgroundColor: v.bg,
    marginLeft: 15,
    borderRadius: v.borderRadiusMFA,
    width: 270,
    height: '100%',
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
  Content: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  Username: {
    padding: 15,
    color: 'black',
    fontSize: 22,
    fontWeight: 'bold',
  },
})

export const AccountSignInItemMFA: FC<{
  empty?: boolean
  id?: string
  last?: boolean
}> = observer(props => {
  const { empty, id, last } = props
  if (empty) {
    const onNext = () => {}
    // TODO: Need re-style this component
    return (
      <View style={[css.AccountSignInItem, css.AccountSignInItem__empty]}>
        <RnText subTitle>{intl`No account`}</RnText>
        <RnText>{intl`There is no account created`}</RnText>
        <RnText>{intl`Tap the below button to create one`}</RnText>
        <FooterActions onNext={onNext} onNextText={intl`CREATE NEW ACCOUNT`} />
      </View>
    )
  }
  if (!id) {
    return null
  }
  const a = {
    id: '0',
    pbxHostname: 'dev01.brekeke.com',
    pbxPort: '8443',
    pbxTenant: 'nam',
    pbxUsername: 'Hoang01',
    ucEnabled: false,
  }

  if (!a) {
    return null
  }

  const onPressSignIn = async () => {}
  return (
    <View style={[css.AccountSignInItem, last && css.AccountSignInItem__last]}>
      <RnTouchableOpacity style={css.Content} onPress={() => {}}>
        <RnText style={css.Username}>{a.pbxUsername}</RnText>
        <FieldMFA
          icon={mdiHomeAccount}
          title={intl`TENANT`}
          data={a.pbxTenant}
        />
        <FieldMFA
          icon={mdiHostName}
          title={intl`HOST NAME`}
          data={a.pbxHostname}
        />
        <FieldMFA icon={mdiPort} title={intl`PORT`} data={a.pbxPort} />
      </RnTouchableOpacity>
      <FieldSwitchMFA title={intl`UC STATUS`} isEnable={a.ucEnabled} />
      {/* <Field
        label='UC'
        onValueChange={(e: boolean) => {}}
        type='Switch'
        value={a.ucEnabled}
      /> */}
      <FooterActionsMFA
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
            onConfirm: () => {},
          })
        }}
        onBackIcon={mdiDeleteAccount}
        onMore={() => {}}
        onMoreIcon={mdiEditAccount}
        onNext={onPressSignIn}
        onNextText={intl`SIGN IN`}
      />
    </View>
  )
})
