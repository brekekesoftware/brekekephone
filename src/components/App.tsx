// API was a component but had been rewritten to a listener
import '../api'

import { observe } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import SplashScreen from 'react-native-splash-screen'

import { SyncPnToken } from '../api/syncPnToken'
import { authPBX } from '../stores/AuthPBX'
import { authSIP } from '../stores/AuthSIP'
import { getAuthStore } from '../stores/authStore'
import { authStore } from '../stores/authStore2'
import { authUC } from '../stores/AuthUC'
import { callStore } from '../stores/callStore'
import { chatStore } from '../stores/chatStore'
import { contactStore } from '../stores/contactStore'
import { intl } from '../stores/intl'
import { intlStore } from '../stores/intlStore'
import { Nav } from '../stores/Nav'
import { profileStore } from '../stores/profileStore'
import { RnAlert } from '../stores/RnAlert'
import { RnAlertRoot } from '../stores/RnAlertRoot'
import { RnPickerRoot } from '../stores/RnPickerRoot'
import { RnStackerRoot } from '../stores/RnStackerRoot'
import { BackgroundTimer } from '../utils/BackgroundTimer'
import { onBackPressed, setupCallKeep } from '../utils/callkeep'
// @ts-ignore
import { PushNotification } from '../utils/PushNotification'
import { registerOnUnhandledError } from '../utils/registerOnUnhandledError'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { AnimatedSize } from './AnimatedSize'
import { CallBar } from './CallBar'
import { CallNotify } from './CallNotify'
import { CallVideos } from './CallVideos'
import { CallVoices } from './CallVoices'
import { ChatGroupInvite, UnreadChatNoti } from './ChatGroupInvite'
import { RnStatusBar, RnText } from './Rn'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

AppState.addEventListener('change', () => {
  if (AppState.currentState === 'active') {
    getAuthStore().resetFailureState()
    // PushNotification.resetBadgeNumber()
    BrekekeUtils.closeAllIncomingCalls()
    callStore.onCallKeepAction()
  }
})
registerOnUnhandledError(unexpectedErr => {
  // Must wrap in setTimeout to make sure
  //    there's no state change when rendering
  BackgroundTimer.setTimeout(() => RnAlert.error({ unexpectedErr }), 300)
  return false
})

const getAudioVideoPermission = () => {
  const cb = (s: MediaStream) => s.getTracks().forEach(t => t.stop())
  // @ts-ignore
  const er = (err: MediaStreamError) => {
    /* TODO */
  }
  // @ts-ignore
  const p = window.navigator.getUserMedia(
    {
      audio: true,
      video: true,
    },
    cb,
    er,
  ) as unknown as Promise<MediaStream>
  if (p?.then) {
    p.then(cb).catch(er)
  }
}

if (Platform.OS === 'web') {
  intlStore.loadingPromise.then(() => {
    RnAlert.prompt({
      title: intl`Action Required`,
      message: intl`Web Phone needs your action to work well on browser. Press OK to continue`,
      confirmText: 'OK',
      dismissText: false,
      onConfirm: getAudioVideoPermission,
      onDismiss: getAudioVideoPermission,
    })
  })
} else if (
  AppState.currentState === 'active' &&
  !callStore.calls.length &&
  !Object.keys(callStore.callkeepMap).length &&
  !authStore.sipPn.sipAuth
) {
  getAudioVideoPermission()
}

// Handle android hardware back button press
BackHandler.addEventListener('hardwareBackPress', onBackPressed)

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

  observe(s, 'signedInId', () => {
    Nav().goToPageIndex()
    chatStore.clearStore()
    contactStore.clearStore()
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
    backgroundColor: '#74bf53', // Old color from design, not g.colors.primary
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

  const s = getAuthStore()
  const {
    isConnFailure,
    pbxConnectingOrFailure,
    sipConnectingOrFailure,
    ucConnectingOrFailure,
    ucLoginFromAnotherPlace,
    signedInId,
  } = s
  let service = ''
  if (pbxConnectingOrFailure()) {
    service = intl`PBX`
  } else if (sipConnectingOrFailure()) {
    service = intl`SIP`
  } else if (ucConnectingOrFailure()) {
    service = intl`UC`
  }
  const failure = isConnFailure()
  let connMessage =
    service &&
    (failure
      ? intl`${service} connection failed`
      : intl`Connecting to ${service}...`)
  if (failure && ucLoginFromAnotherPlace) {
    connMessage = intl`UC signed in from another location`
  }

  return (
    <View style={[StyleSheet.absoluteFill, css.App]}>
      <RnStatusBar />
      {!!signedInId && !!connMessage && (
        <AnimatedSize
          style={[
            css.App_ConnectionStatus,
            failure && css.App_ConnectionStatus__failure,
          ]}
        >
          <RnTouchableOpacity
            style={css.App_ConnectionStatusInner}
            onPress={failure ? s.resetFailureState : undefined}
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
        <RnPickerRoot />
        <RnAlertRoot />
        {failure && (
          <RnTouchableOpacity
            style={css.App_ConnectionStatusIncreaseTouchSize}
            onPress={s.resetFailureState}
          />
        )}
      </View>
      {Platform.OS === 'ios' && <KeyboardSpacer />}

      {!profileStore.profilesLoadedObservable && (
        <View style={css.LoadingFullscreen}>
          <ActivityIndicator size='small' color='white' />
        </View>
      )}
    </View>
  )
})
