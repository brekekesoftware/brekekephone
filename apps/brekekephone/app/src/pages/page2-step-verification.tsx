import { autorun } from 'mobx'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'

import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { mdiClose } from '#/assets/icons'
import { AnimatedView } from '#/components/rn-animated'
import { RnIcon } from '#/components/rn-icon'
import { RnKeyboardAvoidingView } from '#/components/rn-keyboard-avoiding-view'
import { RnText } from '#/components/rn-text'
import { RnTextInput } from '#/components/rn-text-input'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'
import { isIos, isWeb } from '#/config'
import type { Account } from '#/stores/account-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { getPublicIp } from '#/utils/public-ip-address'

const WEB_CONTAINER_MAX_WIDTH = 480

type ToastState = {
  msg: string
  type: 'err' | 'info'
} | null

export const Page2StepVerification = () => {
  const { width: windowWidth } = useWindowDimensions()
  const safeInsets = useContext(SafeAreaInsetsContext)

  const innerCls = useMemo(
    () =>
      isWeb
        ? `w-full self-center max-w-[${WEB_CONTAINER_MAX_WIDTH}px] px-4`
        : `w-full self-center px-[${windowWidth * 0.025}px]`,
    [windowWidth],
  )

  const [otp, setOtp] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)
  const [toast, setToast] = useState<ToastState>(null)
  const accountRef = useRef<Account | null>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const [toastShown, setToastShown] = useState(false)
  useEffect(() => {
    if (!toast) {
      setToastShown(false)
      return
    }
    setToastShown(false)
    const id = requestAnimationFrame(() => setToastShown(true))
    return () => cancelAnimationFrame(id)
  }, [toast])

  const showToast = (msg: string, type: 'err' | 'info') => {
    setToast({ msg, type })
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
        const a = accountRef.current
        if (a && ctx.mfa.isShowing(a.id)) {
          ctx.account.setMFAPendingAfterCallsId(a.id)
          void ctx.account.setMFAPending(a, false)
        }
      }
    })

    return () => {
      disposeAutorun()
      const a = accountRef.current
      if (a && ctx.mfa.isShowing(a.id)) {
        if (ctx.call.calls.length > 0) {
          ctx.account.setMFAPendingAfterCallsId(a.id)
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

  const insetsCls = `top-[${safeInsets?.top ?? 0}px] bottom-[${-(safeInsets?.bottom ?? 0)}px]`

  return (
    <AnimatedView
      className={[
        'absolute right-0 left-0 bg-background transition-opacity duration-150',
        insetsCls,
        mounted ? 'opacity-100' : 'opacity-0',
      ]}
    >
      <RnKeyboardAvoidingView
        className='flex-1 bg-background'
        behavior={isIos ? 'padding' : 'height'}
        keyboardVerticalOffset={isIos ? 100 : 0}
      >
        <View className={['flex-1', innerCls]}>
          <View className='pt-5 pb-3'>
            <RnTouchableOpacity onPress={onBack} className='flex-row gap-3.75'>
              <View>
                <RnIcon size={30} path={mdiClose} />
              </View>
              <RnText className='text-[26px]' title>
                {intl`2-Step Verification`}
              </RnText>
            </RnTouchableOpacity>
          </View>
          <ScrollView
            contentContainerClassName='grow pt-2'
            keyboardShouldPersistTaps='handled'
          >
            <View className='mb-4'>
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
              className='w-full h-12 border rounded-[5px] border-border px-3 text-center mb-4'
            />
            <RnTouchableOpacity
              disabled={isLoading}
              className={[
                'w-full h-12 bg-primary justify-center items-center rounded-[5px] mb-2.5',
                isLoading && 'opacity-50',
              ]}
              onPress={onVerify}
            >
              <RnText white small>
                {intl`VERIFY`}
              </RnText>
            </RnTouchableOpacity>
            <View className='flex-row flex-wrap items-center gap-1 py-3'>
              <RnText>{intl`Can't find your code?`} </RnText>
              <RnTouchableOpacity disabled={isLoading} onPress={resendNewCode}>
                <RnText primary className='underline'>
                  {intl`Resend a new code`}
                </RnText>
              </RnTouchableOpacity>
            </View>
            {toast && (
              <View className='w-full justify-center'>
                <AnimatedView
                  className={[
                    'flex-row w-full justify-around items-center rounded-[5px] py-2.5 transition-opacity duration-800',
                    toast.type === 'err' ? 'bg-error' : 'bg-info',
                    toastShown ? 'opacity-100' : 'opacity-0',
                  ]}
                >
                  <View className='w-4/5'>
                    <RnText normal white>
                      {toast.msg}
                    </RnText>
                  </View>
                  <RnTouchableOpacity onPress={dismissToast}>
                    <RnIcon color='white' path={mdiClose} />
                  </RnTouchableOpacity>
                </AnimatedView>
              </View>
            )}
          </ScrollView>
        </View>
      </RnKeyboardAvoidingView>
    </AnimatedView>
  )
}
