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
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnAlert } from '#/stores/RnAlert'
import { permForCall } from '#/utils/permissions'

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
    marginLeft: 15,
    padding: 15,
    backgroundColor: v.bg,
    borderRadius: v.borderRadiusMFA,
    width: 270,
    position: 'relative',
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
  Button_Empty: {
    width: '100%',
    height: '15%',
    position: 'absolute',
    backgroundColor: 'red',
    alignSelf: 'center',
    bottom: 30,
    borderRadius: 2,
  },
})

export const AccountSignInItemMFA: FC<{
  empty?: boolean
  id?: string
  last?: boolean
}> = observer(props => {
  const { empty, id, last } = props
  if (empty) {
    const onPressCreateAccount = async () => {
      if (!(await permForCall(true))) {
        return
      }
      ctx.nav.goToPageAccountCreate()
    }
    return (
      <View style={[css.AccountSignInItem__empty]}>
        <RnText subTitle>{intl`No account`}</RnText>
        <RnText>{intl`There is no account created`}</RnText>
        <RnText>{intl`Tap the below button to create one`}</RnText>
        <View style={css.Button_Empty}>
          <FooterActions
            onNext={onPressCreateAccount}
            onNextText={intl`CREATE NEW ACCOUNT`}
          />
        </View>
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
  const onPressSignIn = async () => {
    ctx.nav.goToPage2StepVarification()
  }

  const onChangeUC = (e: boolean) => {
    ctx.account.upsertAccount({ id: a.id, ucEnabled: e })
  }
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
      <FieldSwitchMFA
        onChangeValue={onChangeUC}
        title={intl`UC STATUS`}
        value={a.ucEnabled}
      />
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
