import './captureConsoleOutput'
import './polyfill'
import './utils/validator'

import { observe } from 'mobx'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import SplashScreen from 'react-native-splash-screen'

import CallBar from './-call/CallBar'
import CallNotify from './-call/CallNotify'
import PageBackgroundCalls from './-call/PageBackgroundCalls'
import PageCallKeypad from './-call/PageCallKeypad'
import PageCallManage from './-call/PageCallManage'
import PageCallParks from './-call/PageCallParks'
import PageCallParks2 from './-call/PageCallParks2'
import PageCallRecents from './-call/PageCallRecents'
import PageDtmfKeypad from './-call/PageDtmfKeypad'
import PageTransferDial from './-call/PageTransferDial'
import ChatGroupInvite, { UnreadChatNoti } from './-chat/ChatGroupInvite'
import PageChatDetail from './-chat/PageChatDetail'
import PageChatGroupCreate from './-chat/PageChatGroupCreate'
import PageChatGroupDetail from './-chat/PageChatGroupDetail'
import PageChatGroupInvite from './-chat/PageChatGroupInvite'
import PageChatRecents from './-chat/PageChatRecents'
import PageContactPhonebook from './-contact/PageContactPhonebook'
import PageContactUsers from './-contact/PageContactUsers'
import PagePhonebookCreate from './-contact/PagePhonebookCreate'
import PagePhonebookUpdate from './-contact/PagePhonebookUpdate'
import PageProfileCreate from './-profile/PageProfileCreate'
import PageProfileSignIn from './-profile/PageProfileSignIn'
import PageProfileUpdate from './-profile/PageProfileUpdate'
import PageSettingsDebug from './-settings/PageSettingsDebug'
import PageSettingsOther from './-settings/PageSettingsOther'
import PageSettingsProfile from './-settings/PageSettingsProfile'
import api from './api'
import g from './global'
import AuthPBX from './global/AuthPBX'
import AuthSIP from './global/AuthSIP'
import authStore from './global/authStore'
import AuthUC from './global/AuthUC'
import chatStore from './global/chatStore'
import contactStore from './global/contactStore'
import intl from './intl/intl'
import { setupCallKeep } from './native/callkeep'
// @ts-ignore
import PushNotification from './native/PushNotification'
import registerOnUnhandledError from './native/registerOnUnhandledError'
import {
  ActivityIndicator,
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from './Rn'
import AnimatedSize from './shared/AnimatedSize'
import CallVideos from './shared/CallVideos'
import CallVoices from './shared/CallVoices'
import RootAlert from './shared/RootAlert'
import RootPicker from './shared/RootPicker'
import RootStacks from './shared/RootStacks'

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
  batchRender(() => g.showError({ unexpectedErr }))
  return false
})

const getAudioVideoPermission = () => {
  const cb = (s: MediaStream) => s.getTracks().forEach(t => t.stop())
  const er = err => {
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
    p.then(cb)
  }
}

if (Platform.OS === 'web') {
  g.showPrompt({
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

let alreadyInitApp = false
PushNotification.register(() => {
  if (alreadyInitApp) {
    return
  }
  alreadyInitApp = true

  setupCallKeep()
  g.loadProfilesFromLocalStorage()

  g.registerStacks({
    isRoot: true,
    PageProfileSignIn,
    PageChatRecents,
    PageContactPhonebook,
    PageContactUsers,
    PageCallKeypad,
    PageCallRecents,
    PageSettingsOther,
    PageCallParks,
    PageSettingsProfile,
  })
  g.registerStacks({
    PageProfileCreate,
    PageProfileUpdate,
    PagePhonebookCreate,
    PagePhonebookUpdate,
    PageCallManage,
    PageBackgroundCalls,
    PageTransferDial,
    PageDtmfKeypad,
    PageChatDetail,
    PageChatGroupCreate,
    PageChatGroupInvite,
    PageChatGroupDetail,
    PageSettingsDebug,
    PageCallParks2,
  })

  g.goToPageIndex()
  authStore.handleUrlParams()

  const authPBX = new AuthPBX()
  const authSIP = new AuthSIP()
  const authUC = new AuthUC()

  observe(authStore, 'signedInId', () => {
    g.goToPageIndex()
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

  if (!g.profilesLoadedObservable) {
    return (
      <View style={css.LoadingFullscreen}>
        <ActivityIndicator size="small" color="white" />
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
      <StatusBar />
      {shouldShowConnStatus && !!authStore.signedInId && (
        <AnimatedSize
          style={[
            css.App_ConnectionStatus,
            isConnFailure && css.App_ConnectionStatus__failure,
          ]}
        >
          <View style={css.App_ConnectionStatusInner}>
            <Text small white>
              {connMessage}
            </Text>
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
        <RootPicker />
        <RootAlert />
      </View>
      {Platform.OS === 'ios' && <KeyboardSpacer />}
    </View>
  )
})

export default App
