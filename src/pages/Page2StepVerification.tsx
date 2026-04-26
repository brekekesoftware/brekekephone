import { autorun } from 'mobx'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'

import { mdiClose } from '#/assets/icons'
import { RnIcon } from '#/components/RnIcon'
import { RnText } from '#/components/RnText'
import { RnTextInput } from '#/components/RnTextInput'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { v } from '#/components/variables'
import { isIos, isWeb } from '#/config'
import type { Account } from '#/stores/accountStore'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { useAnimationOnDidMount } from '#/utils/animation'
import { getPublicIp } from '#/utils/publicIpAddress'

const WEB_CONTAINER_MAX_WIDTH = 480
const TOAST_ANIMATION_DURATION = 800

type ToastState = {
  msg: string
  type: 'err' | 'info'
} | null

const css = StyleSheet.create({
  ModalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: v.bg,
  },
  Header: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  HeaderBack: {
    flexDirection: 'row',
    gap: 15,
  },
  Title: { fontSize: 26 },
  Body: {
    flexGrow: 1,
    paddingTop: 8,
  },
  Description: {
    marginBottom: 16,
  },
  // Input
  Input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: v.borderBg,
    paddingHorizontal: 12,
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginBottom: 16,
  },
  // Button
  Button: {
    width: '100%',
    height: 48,
    backgroundColor: v.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  ButtonDisabled: {
    opacity: 0.5,
  },
  // Resend
  ResendCode: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  TouchResendCode: {
    color: v.colors.primary,
    textDecorationLine: 'underline',
  },
  // Inline toast
  ToastContainer: {
    justifyContent: 'center',
    width: '100%',
  },
  ToastBody: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ToastContent: {
    width: '80%',
  },
  ToastErr: { backgroundColor: v.colors.danger },
  ToastInfo: { backgroundColor: v.colors.info },
})

export const Page2StepVerification = () => {
  const { width: windowWidth } = useWindowDimensions()
  const safeInsets = useContext(SafeAreaInsetsContext)

  const innerStyle = useMemo(
    () => ({
      width: '100%' as const,
      maxWidth: isWeb ? WEB_CONTAINER_MAX_WIDTH : undefined,
      alignSelf: 'center' as const,
      paddingHorizontal: isWeb ? 16 : windowWidth * 0.025,
    }),
    [windowWidth],
  )

  const [otp, setOtp] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const [fadeAnim] = useState(() => new Animated.Value(0))
  const accountRef = useRef<Account | null>(null)

  const anim = useAnimationOnDidMount({
    opacity: [0, 1],
  })

  const showToast = (msg: string, type: 'err' | 'info') => {
    setToast({ msg, type })
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: TOAST_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start()
  }

  const dismissToast = () => setToast(null)

  useEffect(() => {
    const id = ctx.mfa.accountId
    const ca = id ? ctx.account.accounts.find(a => a.id === id) : null
    if (ca) {
      accountRef.current = ca
      setAccount(ca)
      // Surface server error from mfa/start FAILED (e.g. "No email address.").
      // When present, no OTP session exists so verify will not work — user
      // should read the error and dismiss via the back button.
      if (ctx.mfa.error) {
        showToast(ctx.mfa.error, 'err')
      } else {
        showToast(intl`A new OTP code was sent to your email`, 'info')
      }
    } else {
      showToast(intl`Account does not exist`, 'err')
    }

    // TC-14: detect incoming call while modal is open → defer MFA, hide modal
    const disposeAutorun = autorun(() => {
      if (ctx.call.calls.length > 0) {
        const ca = accountRef.current
        if (ca && ctx.mfa.isShowing(ca.id)) {
          ctx.account.setMFAPendingAfterCallsId(ca.id)
          void ctx.account.setMFAPending(ca, false)
        }
      }
    })

    return () => {
      disposeAutorun()
      const ca = accountRef.current
      if (ca && ctx.mfa.isShowing(ca.id)) {
        if (ctx.call.calls.length > 0) {
          ctx.account.setMFAPendingAfterCallsId(ca.id)
        }
        // reset() resolves any pending waitComplete() promises with false,
        // avoiding the 10min timeout hang that hide() would cause.
        ctx.mfa.reset()
      }
    }
  }, [])

  const onVerify = async () => {
    dismissToast()
    if (!account) {
      showToast(intl`Account does not exist`, 'err')
      return
    }
    if (!otp.trim()) {
      showToast(intl`Verification code is required`, 'err')
      return
    }
    setLoading(true)
    try {
      const status = await ctx.account.mfaCheck(account, otp)
      if (status === 'NO_SESSION') {
        showToast(intl`Session expired. Please request a new code`, 'err')
        return
      }
      if (status !== 'OK') {
        showToast(intl`Invalid verification code. Please try again`, 'err')
        return
      }

      const payload = {
        tenant: account.pbxTenant,
        user: account.pbxUsername,
        ip_address: await getPublicIp(),
        user_agent: isWeb ? navigator.userAgent : 'react-native',
      }
      const skipReconnect = ctx.mfa.skipReconnect
      const c = await ctx.account.createMFADeviceToken(
        payload,
        account,
        skipReconnect,
      )
      if (!c) {
        showToast(
          intl`Token creation failed..Please check again or get another code`,
          'err',
        )
        return
      }
      const hadAwaiters = ctx.mfa.complete()
      if (!hadAwaiters) {
        ctx.nav.goToPageIndex()
      }
    } catch (e) {
      console.error('onVerify error:', e)
      showToast(intl`Something went wrong. Please try again`, 'err')
    } finally {
      setLoading(false)
    }
  }

  const resendNewCode = async () => {
    dismissToast()
    setLoading(true)
    if (!account) {
      return
    }
    const d = await ctx.account.mfaDelete(account)
    if (d) {
      setOtp('')
      try {
        const result = await ctx.account.mfaStart(account)
        if (result === 'none') {
          ctx.mfa.reset()
          return
        }
        if (!result) {
          showToast(intl`Unable to send new code. Please try again.`, 'err')
          return
        }
        showToast(intl`A new OTP code was sent to your email`, 'info')
      } catch (e) {
        console.error('mfaStart failed:', e)
        showToast(intl`Network error. Please try again.`, 'err')
      } finally {
        setLoading(false)
      }
    } else {
      showToast(intl`Unable to resend code. Please try again.`, 'err')
      setLoading(false)
    }
  }

  const onBack = async () => {
    if (account && ctx.account.keySessionMFA) {
      await ctx.account.mfaDelete(account)
    }
    // Sync: cancel + signOut in same tick so MobX batches the state transitions
    // into a single render. Avoids a brief flash where modal has unmounted but
    // signedInId/sipState still show "Internet connection failed" banner.
    ctx.mfa.cancel()
    ctx.auth.signOut()
    // Persist pending=false after UI has updated (stale state self-heals via
    // handleMFA's stale pending reset on next sign-in).
    if (account) {
      void ctx.account.setMFAPending(account, false)
    }
  }

  return (
    <Animated.View
      style={[
        css.ModalContainer,
        {
          opacity: anim.opacity,
          top: safeInsets?.top ?? 0,
          bottom: -(safeInsets?.bottom ?? 0),
        },
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: v.bg }}
        behavior={isIos ? 'padding' : 'height'}
        keyboardVerticalOffset={isIos ? 100 : 0}
      >
        <View style={[innerStyle, { flex: 1 }]}>
          <View style={css.Header}>
            <RnTouchableOpacity onPress={onBack} style={css.HeaderBack}>
              <View>
                <RnIcon size={30} path={mdiClose} />
              </View>
              <RnText style={css.Title} title>
                {intl`2-Step Verification`}
              </RnText>
            </RnTouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={css.Body}
            keyboardShouldPersistTaps='handled'
          >
            <View style={css.Description}>
              <RnText>
                {intl`We sent an 6-digit code to your email. Please copy and paste here to verify your account.`}
              </RnText>
            </View>
            <RnTextInput
              value={otp}
              onChangeText={t => {
                dismissToast()
                setOtp(t)
              }}
              keyboardType='numeric'
              placeholder={intl`Authentication Code`}
              placeholderTextColor={v.borderBg}
              style={css.Input}
            />
            <RnTouchableOpacity
              disabled={isLoading}
              style={[css.Button, isLoading && css.ButtonDisabled]}
              onPress={onVerify}
            >
              <RnText white small>
                {intl`VERIFY`}
              </RnText>
            </RnTouchableOpacity>
            <View style={css.ResendCode}>
              <RnText>{intl`Can't find your code?`} </RnText>
              <RnTouchableOpacity disabled={isLoading} onPress={resendNewCode}>
                <RnText style={css.TouchResendCode}>
                  {intl`Resend a new code`}
                </RnText>
              </RnTouchableOpacity>
            </View>
            {toast && (
              <View style={css.ToastContainer}>
                <Animated.View
                  style={[
                    css.ToastBody,
                    toast.type === 'err' ? css.ToastErr : css.ToastInfo,
                    { opacity: fadeAnim },
                  ]}
                >
                  <View style={css.ToastContent}>
                    <RnText normal white>
                      {toast.msg}
                    </RnText>
                  </View>
                  <RnTouchableOpacity onPress={dismissToast}>
                    <RnIcon color='white' path={mdiClose} />
                  </RnTouchableOpacity>
                </Animated.View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  )
}
