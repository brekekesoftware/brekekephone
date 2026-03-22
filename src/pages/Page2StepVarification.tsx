import { useEffect, useMemo, useRef, useState } from 'react'
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
import { RnIcon } from '#/components/RnIcon'
import { RnText } from '#/components/RnText'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'
import { isIos, isWeb } from '#/config'
import type { Account } from '#/stores/accountStore'
import { getLastSignedInId } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { getPublicIp } from '#/utils/publicIpAddress'

const { width, height } = Dimensions.get('window')
const width88 = '88%'
const width95 = width * 0.95
const css = StyleSheet.create({
  Root: { flex: 1, alignItems: 'center' },
  Header: {
    paddingTop: '5%',
    height: height * 0.1,
    justifyContent: 'center',
  },
  Body: {
    flex: 1,
    width: width95,
  },
  Body_Web: {
    justifyContent: 'center',
  },
  TouchableBack: {
    flexDirection: 'row',
    width: width95,
    gap: 15,
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
  Title: { fontSize: 26 },
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
  const [isLoading, setLoading] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const veryfiFormRef = useRef<FormMFARef | null>(null)

  useEffect(() => {
    const loadAccount = async () => {
      const d = await getLastSignedInId()
      const ca = await ctx.account.findByUniqueId(d.id)
      if (ca) {
        setAccount(ca)
      } else {
        veryfiFormRef.current?.showToast(intl`Account does not exist`, 'err')
      }
    }
    loadAccount()
  }, [])

  const onSubmit = async (r: Record<string, string>) => {
    if (!account) {
      veryfiFormRef.current?.showToast(intl`Account does not exist`, 'err')
      return
    }
    setLoading(true)
    if (!validateSignIn(account, r.password)) {
      return
    }
    signIn(account)
  }

  const signIn = async (ca: Account) => {
    if (!ca) {
      veryfiFormRef.current?.showToast(intl`Account does not exist`, 'err')
      return
    }
    setLoading(true)
    try {
      console.log(`[MFA DEBUG] signIn: start MFA user=${ca.pbxUsername}`)
      const email = 'dev@nongdan.dev'
      const result = await ctx.account.mfaStart(ca, email)
      if (!result) {
        veryfiFormRef.current?.showToast(
          intl`Unable to log in. Please try again.`,
          'err',
        )
        return
      }
      setVerify(true)
      veryfiFormRef.current?.showToast(
        intl`A new OTP code was sent to your email`,
        'info',
      )
    } catch (e) {
      console.error('[MFA ERROR] mfaStart failed', e)
      veryfiFormRef.current?.showToast(
        intl`Network error. Please try again.`,
        'err',
      )
    } finally {
      setLoading(false)
    }
  }
  const onCheck2FA = async (r: Record<string, string>) => {
    if (!account) {
      veryfiFormRef.current?.showToast(intl`Account does not exist`, 'err')
      return
    }
    if (!r.auth?.trim()) {
      veryfiFormRef.current?.showToast(
        intl`Verification code is required`,
        'err',
      )
      return
    }
    setLoading(true)
    try {
      console.log(`[MFA DEBUG] checking code user=${account.pbxUsername}`)
      const status = await ctx.account.mfaCheck(account, r.auth)
      if (status === 'NO_SESSION') {
        veryfiFormRef.current?.showToast(
          intl`Session expired. Please request a new code`,
          'err',
        )
        return
      }
      if (status !== 'OK') {
        veryfiFormRef.current?.showToast(
          intl`Invalid verification code. Please try again`,
          'err',
        )
        return
      }

      const payload = {
        tenant: account.pbxTenant,
        user: account.pbxUsername,
        ip_address: await getPublicIp(),
        user_agent: isWeb ? navigator.userAgent : 'react-native',
      }
      const c = await ctx.account.createMFADeviceToken(payload, account)
      if (!c) {
        veryfiFormRef.current?.showToast(
          intl`Token creation failed..Please check again or get another code`,
          'err',
        )
        return
      }
      ctx.nav.backToPageContactUsers()
    } catch (e) {
      console.error('[MFA ERROR]', e)
      veryfiFormRef.current?.showToast(
        intl`Something went wrong. Please try again`,
        'err',
      )
    } finally {
      setLoading(false)
    }
  }

  const resendNewCode = async () => {
    setLoading(true)
    if (!account) {
      return
    }
    console.log(
      `[MFA DEBUG] Page2StepVarification.resendNewCode: deleting old session for user=${account.pbxUsername}`,
    )
    const d = await ctx.account.mfaDelete(account)
    console.log(
      `[MFA DEBUG] Page2StepVarification.resendNewCode: mfaDelete result=${d}`,
    )
    if (d) {
      veryfiFormRef.current?.clearFields()
      await signIn(account)
    } else {
      veryfiFormRef.current?.showToast(
        intl`Unable to resend code. Please try again.`,
        'err',
      )
      setLoading(false)
    }
  }

  const onBack = async () => {
    ctx.auth.signOut()
    ctx.nav.backToPageAccountSignIn()
    if (account) {
      await ctx.account.mfaDelete(account)
    }
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
            <RnIcon size={30} path={mdiClose} />
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
