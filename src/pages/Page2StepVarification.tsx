import { useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { mdiClose } from '#/assets/icons'
import type { FormFields, FormMFARef } from '#/components/FormMFA'
import { FormMFA } from '#/components/FormMFA'
import { RnCheckBox } from '#/components/RnCheckbox'
import { RnIcon } from '#/components/RnIcon'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'
import { isIos, isWeb } from '#/config'
import type { Account } from '#/stores/accountStore'
import { getLastSignedInId } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'

const { width, height } = Dimensions.get('window')
const width88 = '88%'
const css = StyleSheet.create({
  Root: { flex: 1 },
  Header: {
    paddingTop: '5%',
    height: height * 0.1,
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
    width: width * 0.8,
    gap: 15,
  },
  Icon: {
    paddingLeft: 15,
  },
  Remember: {
    height: height * 0.03,
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

export const Page2StepVarification = ({
  tenant,
  user,
}: {
  tenant: string
  user: string
}) => {
  const formFields = useMemo<FormFields[]>(
    () => [
      {
        id: 'pbxUsername',
        placeholder: 'ID Number',
        editable: false,
        defaultValue: user,
      },
      {
        id: 'password',
        placeholder: 'Password',
        secureTextEntry: true,
        editable: true,
      },
      {
        id: 'pbxTenant',
        placeholder: 'Tenant',
        editable: false,
        defaultValue: tenant,
      },
    ],
    [user, tenant],
  )

  const [isVerify, setVerify] = useState(false)
  const [isRemember, setRemember] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const veryfiFormRef = useRef<FormMFARef | null>(null)

  const onSubmit = async (r: Record<string, string>) => {
    setLoading(true)
    setLoading(false)
    const ca = await getAccount()
    if (!ca) {
      return
    }
    if (!validateSignIn(ca, r.password)) {
      return
    }
    signIn(ca)
  }

  const signIn = async (ca: Account) => {
    const c = await ctx.account.mfaStart(ca, 'dev@nongdan.dev')
    if (!c) {
      console.log(' Page2StepVarification: Start mfa false ')
      veryfiFormRef.current?.showToast(
        intl`Unable to log in. Please try again.`,
        'err',
      )
      return
    }
    if (typeof c === 'string' && c === 'none') {
      console.log(' Page2StepVarification: Do not need to 2FA ')
      return
    }
    setVerify(true)
    veryfiFormRef.current?.showToast(
      intl`A new OTP code was sent to your email`,
      'info',
    )
    setLoading(false)
  }

  const getAccount = async () => {
    if (account) {
      return account
    }

    const d = await getLastSignedInId()
    const ca = await ctx.account.findByUniqueId(d.id)
    if (ca) {
      setAccount(ca)
      return ca
    }
    setLoading(false)
    veryfiFormRef.current?.showToast(intl`Account does not exist`, 'err')
    return
  }

  const onCheck2FA = async (r: Record<string, string>) => {
    setLoading(true)
    if (!account) {
      veryfiFormRef.current?.showToast(intl`Account does not exist`, 'err')
      setLoading(false)
      return
    }
    const c = await ctx.account.mfaCheck(account, r.auth)
    if (c) {
      ctx.nav.backToPageContactUsers()
    } else {
      veryfiFormRef.current?.showToast(
        intl`Invalid verification code. Please check again or get another code`,
        'err',
      )
    }
    setLoading(false)
  }

  const resendNewCode = async () => {
    setLoading(true)
    if (!account) {
      return
    }
    const d = await ctx.account.mfaDelete(account)
    if (d) {
      await signIn(account)
      veryfiFormRef.current?.showToast(
        intl`A new OTP code was sent to your email`,
        'info',
      )
    }
  }

  const onBack = () => {
    ctx.auth.signOut()
    ctx.nav.backToPageAccountSignIn()
  }

  const validateSignIn = (ca: Account, pwd: string) => {
    if (ca.pbxPassword !== pwd) {
      veryfiFormRef.current?.showToast(intl`Incorrect password`, 'err')
      setLoading(false)
      return false
    }
    return true
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={isIos ? 'padding' : 'height'}
        keyboardVerticalOffset={isIos ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={css.Body}
          keyboardShouldPersistTaps='handled'
        >
          {!isVerify ? (
            <FormMFA
              disbaled={isLoading}
              ref={veryfiFormRef}
              formFields={formFields}
              buttonLabel={intl`Sign In`}
              aboveButton={
                <View style={css.Remember}>
                  <RnCheckBox
                    style={css.CheckBox}
                    isSelected={isRemember}
                    disabled={false}
                    onPress={() => setRemember(!isRemember)}
                  />
                  <RnText>{intl`Remember Me`}</RnText>
                </View>
              }
              onSubmit={onSubmit}
            />
          ) : (
            <>
              <View style={isWeb ? css.Desciption_Web : css.Desciption}>
                <RnText>
                  {intl`We sent an 6-digit code to your email. Please copy and paste here to verify your account.`}
                </RnText>
              </View>

              <FormMFA
                disbaled={isLoading}
                ref={veryfiFormRef}
                formFields={formVerifyFields}
                buttonLabel={intl`VERIFY`}
                belowButton={
                  <View style={css.ResendCode}>
                    <RnText>{intl`Can't find your code?`} </RnText>
                    <RnTouchableOpacity
                      disabled={isLoading}
                      onPress={resendNewCode}
                    >
                      <RnText style={css.TouchResendCode}>
                        {intl`Resend a new code`}
                      </RnText>
                    </RnTouchableOpacity>
                  </View>
                }
                onSubmit={onCheck2FA}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const formVerifyFields: FormFields[] = [
  {
    id: 'auth',
    placeholder: 'Authentication Code',
    keyboardType: 'numeric',
    editable: true,
  },
]
