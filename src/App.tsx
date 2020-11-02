import './captureConsoleOutput'
import './polyfill'
import './utils/validator'
import './global/Nav2' // Fix circular dependencies

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

import api from './api'
import CallBar from './call/CallBar'
import CallNotify from './call/CallNotify'
import ChatGroupInvite, { UnreadChatNoti } from './chat/ChatGroupInvite'
import AuthPBX from './global/AuthPBX'
import AuthSIP from './global/AuthSIP'
import authStore from './global/authStore'
import AuthUC from './global/AuthUC'
import chatStore from './global/chatStore'
import contactStore from './global/contactStore'
import Nav from './global/Nav'
import profileStore from './global/profileStore'
import RnAlert from './global/RnAlert'
import RnAlertRoot from './global/RnAlertRoot'
import RnKeyboard from './global/RnKeyboard'
import RnPicker from './global/RnPicker'
import RnPickerRoot from './global/RnPickerRoot'
import RnStacker from './global/RnStacker'
import RootStacks from './global/RnStackerRoot'
import intl from './intl/intl'
import { setupCallKeep } from './native/callkeep'
// @ts-ignore
import PushNotification from './native/PushNotification'
import registerOnUnhandledError from './native/registerOnUnhandledError'
import { RnStatusBar, RnText } from './Rn'
import AnimatedSize from './shared/AnimatedSize'
import CallVideos from './shared/CallVideos'
import CallVoices from './shared/CallVoices'
import g from './variables'

// API was a component but had been rewritten to a listener
void api

// Must wrap in window.setTimeout to make sure
//    there's no state change when rendering
const batchRender = window.setTimeout

AppState.addEventListener('change', () => {
  if (AppState.currentState === 'active') {
    authStore.reconnect()
    PushNotification.resetBadgeNumber()
  }
})
registerOnUnhandledError(unexpectedErr => {
  batchRender(() => RnAlert.error({ unexpectedErr }))
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
  alreadyInitApp = true

  setupCallKeep()
  profileStore.loadProfilesFromLocalStorage()

  Nav().goToPageIndex()
  authStore.handleUrlParams()

  const authPBX = new AuthPBX()
  const authSIP = new AuthSIP()
  const authUC = new AuthUC()

  observe(authStore, 'signedInId', () => {
    Nav().goToPageIndex()
    chatStore.clearStore()
    contactStore.clearStore()
    if (authStore.signedInId) {
      authStore.reconnect()
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
  } = authStore
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
      {shouldShowConnStatus && !!authStore.signedInId && (
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

      {!!authStore.signedInId && (
        <React.Fragment>
          <CallNotify />
          <CallBar />
          <CallVideos />
          <CallVoices />
          <ChatGroupInvite />
          <UnreadChatNoti />
        </React.Fragment>
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
