import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Component, Fragment } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiDialpad,
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPauseCircle,
  mdiPhone,
  mdiPhoneHangup,
  mdiPlayCircle,
  mdiRecord,
  mdiRecordCircle,
  mdiVideo,
  mdiVideoOff,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '../assets/icons'
import { BrekekeGradient } from '../components/BrekekeGradient'
import { ButtonIcon } from '../components/ButtonIcon'
import { IncomingItemWithTimer } from '../components/CallNotify'
import { FieldButton } from '../components/FieldButton'
import { Layout } from '../components/Layout'
import { RnTouchableOpacity } from '../components/Rn'
import { RnText } from '../components/RnText'
import { v } from '../components/variables'
import { VideoPlayer } from '../components/VideoPlayer'
import { Call } from '../stores/Call'
import { callStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { PageCallTransferAttend } from './PageCallTransferAttend'

const css = StyleSheet.create({
  Video: {
    position: 'absolute',
    top: 40, // Header compact height
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
  },
  Video_Space: {
    flex: 1,
    alignSelf: 'stretch',
  },

  Btns: {
    position: 'absolute',
    top: 40, // Header compact height
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 124, // Hangup button 64 + 2*30
  },
  Btns_Hidden: {
    opacity: 0,
  },
  Btns_Inner: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  Btns_Space: {
    height: 20,
  },
  Btns_VerticalMargin: {
    flex: 1,
  },

  Hangup: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  Hangup_incoming: {
    marginLeft: 180,
  },
  Hangup_answer: {
    marginRight: 180,
  },
  Hangup_incomingText: {
    bottom: undefined,
    top: 100,
  },
  labelStyle: {
    paddingRight: 50,
  },
})

@observer
export class PageCallManage extends Component<{
  isFromCallBar?: boolean
}> {
  @observable showButtonsInVideoCall = true
  alreadySetShowButtonsInVideoCall = false

  componentDidMount() {
    this.hideButtonsIfVideo()
  }
  componentDidUpdate() {
    this.hideButtonsIfVideo()
    if (!callStore.calls.length) {
      Nav().goToPageCallRecents()
    }
  }
  componentWillUnmount() {
    callStore.onCallKeepAction()
  }

  @action toggleButtons = () => {
    this.showButtonsInVideoCall = !this.showButtonsInVideoCall
  }
  @action hideButtonsIfVideo = () => {
    if (
      !this.props.isFromCallBar &&
      !this.alreadySetShowButtonsInVideoCall &&
      callStore.getCurrentCall()?.remoteVideoEnabled
    ) {
      this.showButtonsInVideoCall = false
      this.alreadySetShowButtonsInVideoCall = true
    }
  }

  renderCall = (c?: Call, isVideoEnabled?: boolean) => (
    <Layout
      compact
      dropdown={
        isVideoEnabled && !c?.transferring
          ? [
              {
                label: this.showButtonsInVideoCall
                  ? intl`Hide call menu buttons`
                  : intl`Show call menu buttons`,
                onPress: this.toggleButtons,
              },
            ]
          : undefined
      }
      noScroll
      onBack={Nav().goToPageCallRecents}
      title={c?.computedName || intl`Connecting...`}
      transparent={!c?.transferring}
    >
      {!c ? null : c.transferring ? (
        <PageCallTransferAttend />
      ) : (
        <>
          {isVideoEnabled && this.renderVideo(c)}
          {this.renderBtns(c, isVideoEnabled)}
          {this.renderHangupBtn(c)}
        </>
      )}
    </Layout>
  )
  renderVideo = (c: Call) => (
    <>
      <View style={css.Video_Space} />
      <View style={css.Video}>
        <VideoPlayer sourceObject={c.remoteVideoStreamObject} />
      </View>
      <RnTouchableOpacity
        onPress={this.toggleButtons}
        style={StyleSheet.absoluteFill}
      />
    </>
  )
  renderBtns = (c: Call, isVideoEnabled?: boolean) => {
    const n = callStore.calls.filter(
      _ => _.id !== callStore.currentCallId,
    ).length
    if (isVideoEnabled && !this.showButtonsInVideoCall) {
      return null
    }
    const Container = isVideoEnabled ? RnTouchableOpacity : View
    const activeColor = isVideoEnabled ? v.colors.primary : v.colors.warning
    return (
      <Container
        onPress={isVideoEnabled ? this.toggleButtons : undefined}
        style={css.Btns}
      >
        <View style={css.Btns_VerticalMargin} />
        {/* TODO add Connecting... */}
        <View style={{}}>
          <View style={css.Btns_Inner}>
            <ButtonIcon
              disabled={!c.answered}
              bgcolor='white'
              color='black'
              name={intl`TRANSFER`}
              noborder
              onPress={Nav().goToPageCallTransferChooseUser}
              path={mdiCallSplit}
              size={40}
              textcolor='white'
            />
            <ButtonIcon
              disabled={!c.answered}
              bgcolor='white'
              color='black'
              name={intl`PARK`}
              noborder
              onPress={Nav().goToPageCallParks2}
              path={mdiAlphaPCircle}
              size={40}
              textcolor='white'
            />
            <ButtonIcon
              disabled={!c.answered}
              bgcolor={c.localVideoEnabled ? activeColor : 'white'}
              color={c.localVideoEnabled ? 'white' : 'black'}
              name={intl`VIDEO`}
              noborder
              onPress={c.toggleVideo}
              path={c.localVideoEnabled ? mdiVideo : mdiVideoOff}
              size={40}
              textcolor='white'
            />
            {Platform.OS !== 'web' && (
              <ButtonIcon
                disabled={!c.answered}
                bgcolor={callStore.isLoudSpeakerEnabled ? activeColor : 'white'}
                color={callStore.isLoudSpeakerEnabled ? 'white' : 'black'}
                name={intl`SPEAKER`}
                noborder
                onPress={callStore.toggleLoudSpeaker}
                path={
                  callStore.isLoudSpeakerEnabled
                    ? mdiVolumeHigh
                    : mdiVolumeMedium
                }
                size={40}
                textcolor='white'
              />
            )}
          </View>
          <View style={css.Btns_Space} />
          <View style={css.Btns_Inner}>
            <ButtonIcon
              disabled={!c.answered}
              bgcolor={c.muted ? activeColor : 'white'}
              color={c.muted ? 'white' : 'black'}
              name={c.muted ? intl`UNMUTE` : intl`MUTE`}
              noborder
              onPress={() => c.toggleMuted()}
              path={c.muted ? mdiMicrophoneOff : mdiMicrophone}
              size={40}
              textcolor='white'
            />
            <ButtonIcon
              disabled={!c.answered}
              bgcolor={c.recording ? activeColor : 'white'}
              color={c.recording ? 'white' : 'black'}
              name={intl`RECORD`}
              noborder
              onPress={c.toggleRecording}
              path={c.recording ? mdiRecordCircle : mdiRecord}
              size={40}
              textcolor='white'
            />
            <ButtonIcon
              bgcolor='white'
              color='black'
              name={intl`DTMF`}
              noborder
              onPress={Nav().goToPageCallDtmfKeypad}
              path={mdiDialpad}
              size={40}
              textcolor='white'
            />
            <ButtonIcon
              disabled={!c.answered}
              bgcolor={c.holding ? activeColor : 'white'}
              color={c.holding ? 'white' : 'black'}
              name={c.holding ? intl`UNHOLD` : intl`HOLD`}
              noborder
              onPress={c.toggleHoldWithCheck}
              path={c.holding ? mdiPlayCircle : mdiPauseCircle}
              size={40}
              textcolor='white'
            />
          </View>
        </View>
        {n > 0 && (
          <FieldButton
            label={intl`BACKGROUND CALLS`}
            onCreateBtnPress={Nav().goToPageCallBackgrounds}
            textInputStyle={css.labelStyle}
            value={
              n > 1
                ? intl`${n} other calls are in background`
                : intl`${n} other call is in background`
            }
          />
        )}
        <View style={css.Btns_VerticalMargin} />
      </Container>
    )
  }
  renderHangupBtn = (c: Call) => {
    const incoming = c.incoming && !c.answered
    return (
      <>
        <View style={[css.Hangup, incoming && css.Hangup_incoming]}>
          {c.holding ? (
            <RnText small white center>
              {intl`CALL IS ON HOLD`}
            </RnText>
          ) : (
            <ButtonIcon
              bgcolor={v.colors.danger}
              color='white'
              noborder
              onPress={c.hangupWithUnhold}
              path={mdiPhoneHangup}
              size={40}
              textcolor='white'
            />
          )}
        </View>
        {incoming && (
          <>
            <IncomingItemWithTimer />
            <View style={[css.Hangup, css.Hangup_incomingText]}>
              <RnText title white center>
                {c.computedName}
              </RnText>
              <RnText bold white center>
                {intl`Incoming Call`}
              </RnText>
            </View>
            <View style={[css.Hangup, css.Hangup_answer]}>
              <ButtonIcon
                bgcolor={v.colors.primary}
                color='white'
                noborder
                onPress={() => c.answer(true)}
                path={mdiPhone}
                size={40}
                textcolor='white'
              />
            </View>
          </>
        )}
      </>
    )
  }

  render() {
    const c = callStore.getCurrentCall()
    void callStore.calls.length // trigger componentDidUpdate
    const Container = c?.localVideoEnabled ? Fragment : BrekekeGradient
    return <Container>{this.renderCall(c, c?.localVideoEnabled)}</Container>
  }
}
