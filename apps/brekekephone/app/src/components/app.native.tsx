import NetInfo from '@react-native-community/netinfo'
import { reaction, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { useEffect } from 'react'
import {
  ActivityIndicator,
  AppState,
  DeviceEventEmitter,
  Platform,
} from 'react-native'
import SplashScreen from 'react-native-splash-screen'

import { View } from '@/rn/core/components/view'
import { TwPeerProvider } from '@/rn/core/tw/marker.native'
import { composeProviders } from '@/rn/core/utils/compose-providers'
import { debounce } from '@/shared/lodash'
import { AnimatedSize } from '#/components/animated-size'
import { CallBar } from '#/components/call-bar'
import { CallNotify } from '#/components/call-notify'
import { CallVideos } from '#/components/call-videos'
import { CallVoices } from '#/components/call-voices'
import { ChatGroupInvite, UnreadChatNoti } from '#/components/chat-group-invite'
import { PhonebookAddItem } from '#/components/phonebook-add-item'
import { AudioPlayer, RnStatusBar, RnText } from '#/components/rn'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { RootView } from '#/components/root-view'
import { ToastRoot } from '#/components/toast-root'
import { defaultTimeout, isIos, isWeb } from '#/config'
import { isEmbed } from '#/embed/polyfill'
import { RenderAllCalls } from '#/pages/page-call-manage'
import { PageCustomPageView } from '#/pages/page-custom-page-view'
import { Page2StepVerification } from '#/pages/page2-step-verification'
import { getLastSignedInId } from '#/stores/account-store'
import {
  isFirstRunFromLocalStorage,
  saveFirstRunToLocalStorage,
} from '#/stores/app-store'
import { ctx } from '#/stores/ctx'
import { RnAlert } from '#/stores/rn-alert'
import { RnAlertRoot } from '#/stores/rn-alert-root'
import { RnPickerRoot } from '#/stores/rn-picker-root'
import { RnStacker } from '#/stores/rn-stacker'
import { RnStackerRoot } from '#/stores/rn-stacker-root'
import { BackgroundTimer } from '#/utils/background-timer'
import { BrekekeUtils } from '#/utils/brekeke-utils'
import { setupCallKeepEvents } from '#/utils/callkeep'
import { isAlreadyHandleFirstOpen } from '#/utils/deeplink.native'
import { getConnectionStatus } from '#/utils/get-connection-status'
import { checkPermForCall, permForCall } from '#/utils/permissions'
import { PushNotification } from '#/utils/push-notification'
import { registerOnUnhandledError } from '#/utils/register-on-unhandled-error'
import { waitTimeout } from '#/utils/wait-timeout'
import { webPromptPermission } from '#/utils/web-prompt-permission'

const initApp = async () => {
  await ctx.intl.wait()

  const checkHasCall = () =>
    Object.keys(ctx.call.callkeepMap).length ||
    ctx.sip.phone?.getSessionCount() ||
    ctx.call.calls.length
  const checkWakeFromPN = () => ctx.auth.sipPn.sipAuth
  const hasCallOrWakeFromPN = checkHasCall() || checkWakeFromPN()

  const autoLogin = async () => {
    // skip autoLogin when MFA modal is showing
    const cau = ctx.auth.getCurrentAccount()
    if (cau && ctx.account.isAccountInMFA(cau)) {
      return
    }
    if (!(await checkPermForCall())) {
      ctx.nav.goToPageAccountSignIn()
      return
    }
    const d = await getLastSignedInId(true)
    const a = await ctx.account.findByUniqueId(d.id)
    if (d.autoSignInBrekekePhone && (await ctx.auth.signIn(a, true))) {
      console.log('App navigated by auto signin')
      // already navigated
    } else {
      // skip move to page index if there is no account
      const screen = RnStacker.stacks[RnStacker.stacks.length - 1]
      const ca = ctx.account.accounts.length
      if (!ca && screen && screen.name === 'PageAccountCreate') {
        return
      }
      ctx.nav.goToPageIndex()
    }
  }

  registerOnUnhandledError((unexpectedErr: any) => {
    // must wrap in setTimeout avoid mobx error state change when rendering
    BackgroundTimer.setTimeout(
      () => RnAlert.error({ unexpectedErr }),
      defaultTimeout,
    )
    return false
  })

  // android only, via incallmanager lib
  DeviceEventEmitter.addListener('Proximity', data => {
    if (!data?.isNear) {
      ctx.pbx.ping()
    }
  })

  AppState.addEventListener('change', async () => {
    // to check and reconnect pbx
    if (AppState.currentState === 'active') {
      ctx.call.fgAt = Date.now()
    } else if (AppState.currentState === 'background') {
      ctx.call.bgAt = Date.now()
    }

    if (AppState.currentState !== 'active') {
      return
    }

    ctx.auth.resetFailureState()
    ctx.call.onCallKeepAction()
    ctx.call.updateLoudSpeakerStatus()
    ctx.pbx.ping()
    ctx.pnToken.syncForAllAccounts()

    if (Platform.OS === 'android' && !isAlreadyHandleFirstOpen()) {
      await autoLogin()
    }

    if (checkHasCall()) {
      return
    }
    if (checkWakeFromPN()) {
      // ensure Linking listener is re-registered and handle deeplink
      // after MainActivity is destroyed and the app is reopened
      if (Platform.OS === 'android' && !isAlreadyHandleFirstOpen()) {
        await ctx.auth.handleUrlParams()
      }
      return
    }
    if (await ctx.auth.handleUrlParams()) {
      return
    }

    if (
      !hasCallOrWakeFromPN &&
      ctx.auth.signedInId &&
      !(await checkPermForCall(
        false,
        ctx.auth.getCurrentAccount()?.pushNotificationEnabled,
      ))
    ) {
      ctx.auth.signOut()
      return
    }
    // with ios when wakekup app, currentState will be 'unknown' first then 'active'
    // https://github.com/facebook/react-native-website/issues/273
    if (!isIos) {
      return
    }
    await autoLogin()
  })

  NetInfo.addEventListener(({ isConnected }) => {
    if (ctx.auth.hasInternetConnected === isConnected) {
      return
    }
    ctx.auth.hasInternetConnected = isConnected
    if (!isConnected) {
      return
    }
    ctx.auth.resetFailureState()
    ctx.authPBX.auth()
    ctx.authSIP.auth()
    ctx.authUC.auth()
  })

  if (isWeb) {
    if (!isEmbed) {
      webPromptPermission()
    }
    // with ios when wakekup app, currentState will be 'unknown' first then 'active'
    // https://github.com/facebook/react-native-website/issues/273
  } else if (
    (AppState.currentState === 'active' ||
      AppState.currentState === 'unknown') &&
    !hasCallOrWakeFromPN
  ) {
    if (!(await isFirstRunFromLocalStorage())) {
      // TODO: app will hang up if use await here
      permForCall(true)
      saveFirstRunToLocalStorage()
    }
  }

  setupCallKeepEvents()

  await ctx.account.loadAccountsFromLocalStorage()

  const clearConnectionReaction = reaction(
    () => getConnectionStatus(),
    status => {
      // should not display error message UC connection failure in incoming call
      if (
        status.isFailure &&
        status.message &&
        status.serviceConnectingOrFailure === 'UC'
      ) {
        BrekekeUtils.updateConnectionStatus('', false)
        return
      }
      BrekekeUtils.updateConnectionStatus(status.message, status.isFailure)
    },
    { fireImmediately: true },
  )
  void clearConnectionReaction

  const clearGetHoldLoadingReaction = reaction(
    () => ctx.call.isAnyHoldLoading,
    isAnyHoldLoading => {
      BrekekeUtils.updateAnyHoldLoading(isAnyHoldLoading)
    },
    { fireImmediately: true },
  )
  void clearGetHoldLoadingReaction

  const onAuthUpdate = debounce(() => {
    ctx.nav.goToPageIndex()
    ctx.chat.clearStore()
    ctx.contact.clearStore()
    ctx.user.clearStore()
    if (ctx.auth.signedInId) {
      ctx.auth.resetFailureState()
      ctx.authPBX.auth()
      ctx.authSIP.auth()
      ctx.authUC.auth()
    } else {
      ctx.authPBX.dispose()
      ctx.authSIP.dispose()
      ctx.authUC.dispose()
    }
  }, 17)
  const clearReaction = reaction(() => ctx.auth.signedInId, onAuthUpdate)
  void clearReaction
  if (await ctx.auth.handleUrlParams()) {
    console.log('App navigated by url params')
    // already navigated
  } else if (
    // only auto sign in if app active mean user open app intentionally
    // other cases like wakeup via push we should not auto sign in
    !isWeb &&
    AppState.currentState === 'active' &&
    !hasCallOrWakeFromPN
  ) {
    await autoLogin()
  } else {
    ctx.nav.goToPageIndex()
  }

  if (AppState.currentState === 'active') {
    ctx.pnToken.syncForAllAccounts()
  }
}

let alreadyInitApp = false
PushNotification.register(async () => {
  if (alreadyInitApp) {
    return
  }
  alreadyInitApp = true
  await initApp().catch(console.error)
  await waitTimeout(100)
  runInAction(() => {
    ctx.account.appInitDone = true
  })
})

const AppWithoutProviders = observer(() => {
  useEffect(() => {
    if (!isWeb) {
      SplashScreen.hide()
    }
  }, [])

  const {
    signedInId,
    message: connMessage,
    isFailure,
    onPress: onPressConnMessage,
  } = getConnectionStatus()

  return (
    <RootView>
      <AudioPlayer />
      <RnStatusBar />
      {!!signedInId && !!connMessage && (
        <AnimatedSize
          className={isFailure ? 'bg-error' : 'bg-warning'}
        >
          <RnTouchableOpacity
            className='px-1.25 pt-1 pb-1.25'
            onPress={onPressConnMessage}
          >
            <RnText small white>
              {connMessage}
            </RnText>
          </RnTouchableOpacity>
        </AnimatedSize>
      )}

      <CallNotify />
      <CallBar />
      <CallVideos />
      <CallVoices />
      <ChatGroupInvite />
      <UnreadChatNoti />
      <ToastRoot />
      <View className='flex-1'>
        <RnStackerRoot />
        <RenderAllCalls />
        <View>
          {ctx.auth.listCustomPage.map(cp => (
            <PageCustomPageView key={cp.id} id={cp.id} />
          ))}
        </View>
        <RnPickerRoot />
        <PhonebookAddItem />
        <RnAlertRoot />
        {isFailure && (
          <RnTouchableOpacity
            className='absolute top-0 right-0 left-0 h-7.5'
            onPress={onPressConnMessage}
          />
        )}
      </View>
      {/* TODO: {isIos && <KeyboardSpacer />} */}

      {!ctx.account.appInitDone && (
        <View
          className='absolute inset-0 items-center justify-center bg-[#74bf53]'
        >
          <ActivityIndicator size='large' color='white' />
        </View>
      )}
      {(() => {
        const id = ctx.auth.getCurrentAccount()?.id || ctx.mfa.accountId
        return !!id && ctx.mfa.isShowing(id) && <Page2StepVerification />
      })()}
    </RootView>
  )
})

export const App = composeProviders(
  TwPeerProvider,
  AppWithoutProviders,
)

export default App
