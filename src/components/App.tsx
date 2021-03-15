import { observe } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import SplashScreen from 'react-native-splash-screen'

import api from '../api'
import { SyncPnToken } from '../api/syncPnToken'
import AuthPBX from '../stores/AuthPBX'
import AuthSIP from '../stores/AuthSIP'
import { getAuthStore } from '../stores/authStore'
import AuthUC from '../stores/AuthUC'
import chatStore from '../stores/chatStore'
import contactStore from '../stores/contactStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import profileStore from '../stores/profileStore'
import RnAlert from '../stores/RnAlert'
import RnAlertRoot from '../stores/RnAlertRoot'
import RnKeyboard from '../stores/RnKeyboard'
import RnPicker from '../stores/RnPicker'
import RnPickerRoot from '../stores/RnPickerRoot'
import RnStacker from '../stores/RnStacker'
import RootStacks from '../stores/RnStackerRoot'
import { setupCallKeep } from '../utils/callkeep'
// @ts-ignore
import PushNotification from '../utils/PushNotification'
import registerOnUnhandledError from '../utils/registerOnUnhandledError'
import AnimatedSize from './AnimatedSize'
import CallBar from './CallBar'
import CallNotify from './CallNotify'
import CallVideos from './CallVideos'
import CallVoices from './CallVoices'
import ChatGroupInvite, { UnreadChatNoti } from './ChatGroupInvite'
import { RnStatusBar, RnText } from './Rn'
import g from './variables'

// API was a component but had been rewritten to a listener
void api

AppState.addEventListener('change', () => {
  if (AppState.currentState === 'active') {
    getAuthStore().reconnect()
    PushNotification.resetBadgeNumber()
  }
})
registerOnUnhandledError(unexpectedErr => {
  // Must wrap in window.setTimeout to make sure
  //    there's no state change when rendering
  window.setTimeout(() => RnAlert.error({ unexpectedErr }))
  return false
})

const getAudioVideoPermission = () => {
  const cb = (s: MediaStream) => s.getTracks().forEach(t => t.stop())
  const er = (err: MediaStreamError) => {
    /* TODO */
  }
  const p = (window.navigator.getUserMedia(
    {
      audio: true,
      video: true,
    },
    cb,
    er,
  ) as unknown) as Promise<MediaStream>
  if (p?.then) {
    p.then(cb).catch(er)
  }
}

if (Platform.OS === 'web') {
  RnAlert.prompt({
    title: intl`Action Required`,
    message: intl`Brekeke Phone needs your action to work well on browser. Press OK to continue`,
    confirmText: 'OK',
    dismissText: false,
    onConfirm: getAudioVideoPermission,
    onDismiss: getAudioVideoPermission,
  })
} else {
  getAudioVideoPermission()
}

// Handle android hardware back button press
BackHandler.addEventListener('hardwareBackPress', () => {
  if (RnKeyboard.isKeyboardShowing) {
    Keyboard.dismiss()
    return true
  }
  if (RnAlert.alerts.length) {
    RnAlert.dismiss()
    return true
  }
  if (RnPicker.currentRnPicker) {
    RnPicker.dismiss()
    return true
  }
  if (RnStacker.stacks.length > 1) {
    RnStacker.stacks.pop()
    return true
  }
  return false
})

let alreadyInitApp = false
PushNotification.register(() => {
  if (alreadyInitApp) {
    return
  }
  const s = getAuthStore()
  alreadyInitApp = true

  setupCallKeep()
  profileStore.loadProfilesFromLocalStorage().then(() => {
    if (AppState.currentState === 'active') {
      SyncPnToken().syncForAllAccounts()
    }
  })

  Nav().goToPageIndex()
  s.handleUrlParams()

  const authPBX = new AuthPBX()
  const authSIP = new AuthSIP()
  const authUC = new AuthUC()

  observe(s, 'signedInId', () => {
    Nav().goToPageIndex()
    chatStore.clearStore()
    contactStore.clearStore()
    if (s.signedInId) {
      s.reconnect()
      authPBX.auth()
      authSIP.auth()
      authUC.auth()
    } else {
      authPBX.dispose()
      authSIP.dispose()
      authUC.dispose()
    }
  })
})

const css = StyleSheet.create({
  App: {
    backgroundColor: g.bg,
  },
  App_Inner: {
    flex: 1,
  },
  App_ConnectionStatus: {
    backgroundColor: g.colors.warning,
  },
  App_ConnectionStatus__failure: {
    backgroundColor: g.colors.danger,
  },
  App_ConnectionStatusInner: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  LoadingFullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#74bf53', // Old color from design, not g.colors.primary
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const App = observer(() => {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      SplashScreen.hide()
    }
  }, [])

  if (!profileStore.profilesLoadedObservable) {
    return (
      <View style={css.LoadingFullscreen}>
        <ActivityIndicator size='small' color='white' />
      </View>
    )
  }
  const s = getAuthStore()
  const {
    isConnFailure,
    pbxConnectingOrFailure,
    shouldShowConnStatus,
    sipConnectingOrFailure,
    ucConnectingOrFailure,
    ucLoginFromAnotherPlace,
    pbxTotalFailure,
    sipTotalFailure,
    ucTotalFailure,
    signedInId,
  } = s
  let service = ''
  let isRetrying = false
  if (pbxConnectingOrFailure) {
    service = intl`PBX`
    isRetrying = pbxTotalFailure > 0
  } else if (sipConnectingOrFailure) {
    service = intl`SIP`
    isRetrying = sipTotalFailure > 0
  } else if (ucConnectingOrFailure) {
    service = intl`UC`
    isRetrying = ucTotalFailure > 0
  }
  let connMessage =
    service &&
    (isConnFailure
      ? intl`${service} connection failed`
      : intl`Connecting to ${service}...`)
  void isRetrying
  if (isConnFailure && ucConnectingOrFailure && ucLoginFromAnotherPlace) {
    connMessage = intl`UC signed in from another location`
  }

  return (
    <View style={[StyleSheet.absoluteFill, css.App]}>
      <RnStatusBar />
      {shouldShowConnStatus && !!signedInId && (
        <AnimatedSize
          style={[
            css.App_ConnectionStatus,
            isConnFailure && css.App_ConnectionStatus__failure,
          ]}
        >
          <View style={css.App_ConnectionStatusInner}>
            <RnText small white>
              {connMessage}
            </RnText>
          </View>
        </AnimatedSize>
      )}

      {!!signedInId && (
        <>
          <CallNotify />
          <CallBar />
          <CallVideos />
          <CallVoices />
          <ChatGroupInvite />
          <UnreadChatNoti />
        </>
      )}
      <View style={css.App_Inner}>
        <RootStacks />
        <RnPickerRoot />
        <RnAlertRoot />
      </View>
      {Platform.OS === 'ios' && <KeyboardSpacer />}
    </View>
  )
})

export default App
