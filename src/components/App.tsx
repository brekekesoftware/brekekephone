// api was a component but had been rewritten to a listener
import '../api'

import NetInfo from '@react-native-community/netinfo'
import { debounce } from 'lodash'
import { reaction, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { useEffect } from 'react'
import {
  ActivityIndicator,
  AppState,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import SplashScreen from 'react-native-splash-screen'

import { sip } from '../api/sip'
import { SyncPnToken } from '../api/syncPnToken'
import { RenderAllCalls } from '../pages/PageCallManage'
import {
  accountStore,
  getAccountUniqueId,
  getLastSignedInId,
} from '../stores/accountStore'
import { authPBX } from '../stores/AuthPBX'
import { authSIP } from '../stores/AuthSIP'
import { getAuthStore } from '../stores/authStore'
import { authUC } from '../stores/AuthUC'
import { getCallStore } from '../stores/callStore'
import { chatStore } from '../stores/chatStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { Nav } from '../stores/Nav'
import { RnAlert } from '../stores/RnAlert'
import { RnAlertRoot } from '../stores/RnAlertRoot'
import { RnPickerRoot } from '../stores/RnPickerRoot'
import { RnStackerRoot } from '../stores/RnStackerRoot'
import { userStore } from '../stores/userStore'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { setupCallKeep } from '../utils/callkeep'
import { getAudioVideoPermission } from '../utils/getAudioVideoPermission'
// @ts-ignore
import { PushNotification } from '../utils/PushNotification'
import { registerOnUnhandledError } from '../utils/registerOnUnhandledError'
import { waitTimeout } from '../utils/waitTimeout'
import { webPromptPermission } from '../utils/webPromptPermission'
import { AnimatedSize } from './AnimatedSize'
import { CallBar } from './CallBar'
import { CallNotify } from './CallNotify'
import { CallVideos } from './CallVideos'
import { CallVoices } from './CallVoices'
import { ChatGroupInvite, UnreadChatNoti } from './ChatGroupInvite'
import { PhonebookAddItem } from './PhonebookAddItem'
import { AudioPlayer, RnStatusBar, RnText } from './Rn'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const initApp = async () => {
  await intlStore.wait()

  if (Platform.OS === 'android') {
    //https://github.com/facebook/react-native/issues/32584#issuecomment-968950165 for android 12
    await PermissionsAndroid.requestMultiple([
      'android.permission.READ_PHONE_NUMBERS',
    ])
  }

  const s = getAuthStore()
  const cs = getCallStore()
  const nav = Nav()
  const pnToken = SyncPnToken()

  const checkHasCallOrWakeFromPN = () =>
    Object.keys(cs.callkeepMap).length ||
    sip.phone?.getSessionCount() ||
    cs.calls.length ||
    s.sipPn.sipAuth
  const hasCallOrWakeFromPN = checkHasCallOrWakeFromPN()

  const autoLogin = async () => {
    const d = await getLastSignedInId(true)
    const a = accountStore.accounts.find(_ => getAccountUniqueId(_) === d.id)
    if (d.autoSignInBrekekePhone && (await s.signIn(a, true))) {
      console.log('App navigated by auto signin')
      // already navigated
    } else {
      nav.goToPageIndex()
    }
  }

  registerOnUnhandledError(unexpectedErr => {
    // must wrap in setTimeout avoid mobx error state change when rendering
    BackgroundTimer.setTimeout(() => RnAlert.error({ unexpectedErr }), 300)
    return false
  })

  AppState.addEventListener('change', async () => {
    if (AppState.currentState !== 'active') {
      return
    }
    s.resetFailureState()
    cs.onCallKeepAction()
    pnToken.syncForAllAccounts()
    // with ios when wakekup app, currentState will be 'unknown' first then 'active'
    // https://github.com/facebook/react-native-website/issues/273
    if (Platform.OS !== 'ios') {
      return
    }
    if (!checkHasCallOrWakeFromPN() && !(await s.handleUrlParams())) {
      await autoLogin()
    }
  })

  NetInfo.addEventListener(({ isConnected }) => {
    if (s.hasInternetConnected === isConnected) {
      return
    }
    s.hasInternetConnected = isConnected
    if (!isConnected) {
      return
    }
    s.resetFailureState()
    authPBX.auth()
    authSIP.auth()
    authUC.auth()
  })

  if (Platform.OS === 'web') {
    if (window._BrekekePhoneWebRoot) {
      webPromptPermission()
    }
  } else if (AppState.currentState === 'active' && !hasCallOrWakeFromPN) {
    getAudioVideoPermission()
  }

  setupCallKeep()
  await accountStore.loadAccountsFromLocalStorage()

  const onAuthUpdate = debounce(() => {
    nav.goToPageIndex()
    chatStore.clearStore()
    contactStore.clearStore()
    userStore.clearStore()
    if (s.signedInId) {
      s.resetFailureState()
      authPBX.auth()
      authSIP.auth()
      authUC.auth()
    } else {
      authPBX.dispose()
      authSIP.dispose()
      authUC.dispose()
    }
  }, 17)
  const clearReaction = reaction(() => s.signedInId, onAuthUpdate)
  void clearReaction

  if (await s.handleUrlParams()) {
    console.log('App navigated by url params')
    // already navigated
  } else if (
    // only auto sign in if app active mean user open app intentionally
    // other cases like wakeup via push we should not auto sign in
    Platform.OS !== 'web' &&
    AppState.currentState === 'active' &&
    !hasCallOrWakeFromPN
  ) {
    await autoLogin()
  } else {
    nav.goToPageIndex()
  }

  if (AppState.currentState === 'active') {
    pnToken.syncForAllAccounts()
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
    accountStore.appInitDone = true
  })
})

const css = StyleSheet.create({
  App: {
    backgroundColor: v.bg,
  },
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
    if (Platform.OS !== 'web') {
      SplashScreen.hide()
    }
  }, [])

  const {
    isConnFailure,
    pbxConnectingOrFailure,
    sipConnectingOrFailure,
    ucConnectingOrFailure,
    ucLoginFromAnotherPlace,
    signedInId,
    resetFailureStateIncludeUcLoginFromAnotherPlace,
  } = getAuthStore()

  const serviceConnectingOrFailure = pbxConnectingOrFailure()
    ? 'PBX'
    : sipConnectingOrFailure()
    ? 'SIP'
    : ucConnectingOrFailure()
    ? 'UC'
    : ''
  const isFailure = isConnFailure()

  const connMessage =
    isFailure && ucLoginFromAnotherPlace
      ? intl`UC signed in from another location`
      : !serviceConnectingOrFailure
      ? ''
      : isFailure
      ? intl`${serviceConnectingOrFailure} connection failed`
      : intl`Connecting to ${serviceConnectingOrFailure}...`

  return (
    <View style={[StyleSheet.absoluteFill, css.App]}>
      {chatStore.chatNotificationSoundRunning && <AudioPlayer />}
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
            onPress={
              isFailure
                ? resetFailureStateIncludeUcLoginFromAnotherPlace
                : undefined
            }
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

      <View style={css.App_Inner}>
        <RnStackerRoot />
        <RenderAllCalls />
        <RnPickerRoot />
        <PhonebookAddItem />

        <RnAlertRoot />
        {isFailure && (
          <RnTouchableOpacity
            style={css.App_ConnectionStatusIncreaseTouchSize}
            onPress={resetFailureStateIncludeUcLoginFromAnotherPlace}
          />
        )}
      </View>
      {Platform.OS === 'ios' && <KeyboardSpacer />}

      {!accountStore.appInitDone && (
        <View style={css.LoadingFullscreen}>
          <ActivityIndicator size='large' color='white' />
        </View>
      )}
    </View>
  )
})

export default App
