import NetInfo from '@react-native-community/netinfo'
import { debounce } from 'lodash'
import { reaction, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { useEffect } from 'react'
import {
  ActivityIndicator,
  AppState,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import SplashScreen from 'react-native-splash-screen'

import { AnimatedSize } from '#/components/AnimatedSize'
import { CallBar } from '#/components/CallBar'
import { CallNotify } from '#/components/CallNotify'
import { CallVideos } from '#/components/CallVideos'
import { CallVoices } from '#/components/CallVoices'
import { ChatGroupInvite, UnreadChatNoti } from '#/components/ChatGroupInvite'
import { PhonebookAddItem } from '#/components/PhonebookAddItem'
import { AudioPlayer, RnStatusBar, RnText } from '#/components/Rn'
import { RnTouchableOpacity } from '#/components/RnTouchableOpacity'
import { RootView } from '#/components/RootView'
import { ToastRoot } from '#/components/ToastRoot'
import { v } from '#/components/variables'
import { defaultTimeout, isIos, isWeb } from '#/config'
import { isEmbed } from '#/embed/polyfill'
import { RenderAllCalls } from '#/pages/PageCallManage'
import { PageCustomPageView } from '#/pages/PageCustomPageView'
import { getLastSignedInId } from '#/stores/accountStore'
import {
  isFirstRunFromLocalStorage,
  saveFirstRunToLocalStorage,
} from '#/stores/appStore'
import { ctx } from '#/stores/ctx'
import { RnAlert } from '#/stores/RnAlert'
import { RnAlertRoot } from '#/stores/RnAlertRoot'
import { RnPickerRoot } from '#/stores/RnPickerRoot'
import { RnStacker } from '#/stores/RnStacker'
import { RnStackerRoot } from '#/stores/RnStackerRoot'
import { BackgroundTimer } from '#/utils/BackgroundTimer'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { setupCallKeepEvents } from '#/utils/callkeep'
import { isAlreadyHandleFirstOpen } from '#/utils/deeplink'
import { getConnectionStatus } from '#/utils/getConnectionStatus'
import { checkPermForCall, permForCall } from '#/utils/permissions'
import { PushNotification } from '#/utils/PushNotification'
import { registerOnUnhandledError } from '#/utils/registerOnUnhandledError'
import { waitTimeout } from '#/utils/waitTimeout'
import { webPromptPermission } from '#/utils/webPromptPermission'

const initApp = async () => {
  await ctx.intl.wait()

  const checkHasCall = () =>
    Object.keys(ctx.call.callkeepMap).length ||
    ctx.sip.phone?.getSessionCount() ||
    ctx.call.calls.length
  const checkWakeFromPN = () => ctx.auth.sipPn.sipAuth
  const hasCallOrWakeFromPN = checkHasCall() || checkWakeFromPN()

  const autoLogin = async () => {
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

  registerOnUnhandledError(unexpectedErr => {
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

const css = StyleSheet.create({
  App_Inner: {
    flex: 1,
  },
  App_ConnectionStatus: {
    backgroundColor: v.colors.warning,
  },
  App_ConnectionStatus__failure: {
    backgroundColor: v.colors.danger,
  },
  App_ConnectionStatusInner: {
    paddingHorizontal: 5,
    paddingTop: 4,
    paddingBottom: 5,
  },
  App_ConnectionStatusIncreaseTouchSize: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  LoadingFullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#74bf53', // old color from design, not g.colors.primary
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export const App = observer(() => {
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
          style={[
            css.App_ConnectionStatus,
            isFailure && css.App_ConnectionStatus__failure,
          ]}
        >
          <RnTouchableOpacity
            style={css.App_ConnectionStatusInner}
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
      <View style={css.App_Inner}>
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
            style={css.App_ConnectionStatusIncreaseTouchSize}
            onPress={onPressConnMessage}
          />
        )}
      </View>
      {isIos && <KeyboardSpacer />}

      {!ctx.account.appInitDone && (
        <View style={css.LoadingFullscreen}>
          <ActivityIndicator size='large' color='white' />
        </View>
      )}
    </RootView>
  )
})

export default App
