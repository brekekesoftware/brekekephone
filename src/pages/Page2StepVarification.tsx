import { useEffect, useRef, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'

import { mdiClose } from '#/assets/icons'
import type { FormFields, FormMFARef } from '#/components/FormMFA'
import { FormMFA } from '#/components/FormMFA'
import { RnCheckBox } from '#/components/RnCheckbox'
import { RnIcon } from '#/components/RnIcon'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'
import { isWeb } from '#/config'
import type { AccountUnique } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

const { width, height } = Dimensions.get('window')
const width88 = '88%'
const css = StyleSheet.create({
  Root: { flex: 1 },
  Header: {
    paddingTop: '5%',
    height: '10%',
    justifyContent: 'center',
  },
  Body: {
    flex: 1,
    alignItems: 'center',
  },
  Body_Web: {
    justifyContent: 'center',
  },
  TouchableBack: {
    flexDirection: 'row',
    width: width * 0.5,
    gap: 15,
  },
  Icon: {
    paddingLeft: 15,
  },
  Remember: {
    height: '10%',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  CheckBox: {
    borderRadius: 100,
  },

  Desciption: {
    width: width88,
  },
  Desciption_Web: {
    width: width88,
    marginTop: 15,
    alignItems: 'center',
  },
  ResendCode: {
    flexDirection: 'row',
    height: height * 0.07,
    width: width88,
    alignItems: 'center',
  },
  TouchResendCode: {
    color: v.colors.primary,
    textDecorationLine: 'underline',
  },
  ToastView: {
    width: width88,
  },
  MaxWidthSignInPage: {
    width: width88,
    paddingVertical: 20,
  },
  Title: { width: width * 0.7 },
})

export const Page2StepVarification = () => {
  const [isVerify, setVerify] = useState(false)
  const veryfiFormRef = useRef<FormMFARef | null>(null)
  const valueRef = useRef<AccountUnique>(null)
  const signIn = async (r: Record<string, string>) => {
    const a: AccountUnique = {
      pbxUsername: r.pbxUsername || '',
      pbxTenant: r.pbxTenant || '',
      pbxHostname: '',
      pbxPort: '',
    }
    valueRef.current = a
    const ca = await ctx.account.find(a)
    if (!ca) {
      return
    }
    const c = await ctx.account.mfaStart(ca)
    if (!c) {
      console.log('[Hoang] Page2StepVarification: No need to MFA ')
      ctx.nav.goToPageIndex()
      return
    }
    setVerify(true)
  }

  const onCheck2FA = async () => {}

  const resendNewCode = async () => {
    if (valueRef.current) {
      signIn(valueRef.current)
      veryfiFormRef.current?.showInfoToast(
        intl`A new OTP code was sent to your email`,
      )
    }
  }

  const onBack = () => {
    ctx.nav.backToPageAccountSignIn()
    console.log('[Hoang]: rn ')
  }
  return (
    <View style={css.Root}>
      <View style={css.Header}>
        <RnTouchableOpacity onPress={onBack} style={css.TouchableBack}>
          <View>
            <RnIcon style={css.Icon} size={30} path={mdiClose} />
          </View>
          <RnText style={css.Title} title>
            {isVerify ? intl`2-Step Verification` : intl`Sign In`}
          </RnText>
        </RnTouchableOpacity>
      </View>
      <View style={[css.Body, isWeb && width > 500 && css.Body_Web]}>
        {!isVerify && (
          <FormMFA
            formFields={formFields}
            buttonLabel={intl`Sign In`}
            aboveButton={
              <View style={css.Remember}>
                <RnCheckBox
                  style={css.CheckBox}
                  isSelected={true}
                  disabled={false}
                  onPress={() => {}}
                />
                <RnText>{intl`Remember Me`}</RnText>
              </View>
            }
            onSubmit={signIn}
          />
        )}
        {isVerify && (
          <>
            <View style={isWeb ? css.Desciption_Web : css.Desciption}>
              <RnText>{intl`We sent an 6-digit code to your email. Please copy and paste here to verify your account.`}</RnText>
            </View>

            <FormMFA
              ref={veryfiFormRef}
              formFields={formVerifyFields}
              buttonLabel={intl`VERIFY`}
              belowButton={
                <View style={css.ResendCode}>
                  <RnText>{intl`Can't find your code?`} </RnText>
                  <RnTouchableOpacity onPress={resendNewCode}>
                    <RnText
                      style={css.TouchResendCode}
                    >{intl`Resend a new code`}</RnText>
                  </RnTouchableOpacity>
                </View>
              }
              onSubmit={onCheck2FA}
            />
          </>
        )}
      </View>
    </View>
  )
}

const formFields: FormFields[] = [
  {
    id: 'pbxUsername',
    placeholder: 'ID Number',
  },
  {
    id: 'password',
    placeholder: 'Password',
    secureTextEntry: true,
  },
  {
    id: 'pbxTenant',
    placeholder: 'Tenant',
  },
]

const formVerifyFields: FormFields[] = [
  {
    id: 'auth',
    placeholder: 'Authentication Code',
    keyboardType: 'numeric',
  },
]
