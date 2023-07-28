import { action, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  NativeEventSubscription,
  Platform,
  StyleSheet,
  View,
} from 'react-native'

import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiCameraFrontVariant,
  mdiCameraRearVariant,
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
import { SmartImage } from '../components/SmartAvatarHTML'
import { v } from '../components/variables'
import { VideoPlayer } from '../components/VideoPlayer'
import { getAuthStore } from '../stores/authStore'
import { Call, CallConfigKey } from '../stores/Call'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { Duration } from '../stores/timerStore'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { PageCallTransferAttend } from './PageCallTransferAttend'

const height = Dimensions.get('window').height
const css = StyleSheet.create({
  BtnSwitchCamera: {
    position: 'absolute',
    top: 10, // header compact height
    right: 10,
    zIndex: 100,
  },
  cameraStyle: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 100,
  },
  Video: {
    position: 'absolute',
    top: 40, // header compact height
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
    marginTop: 10,
  },
  BtnFuncCalls: {
    marginBottom: 10,
  },
  Btns_Hidden: {
    opacity: 0,
  },
  Btns_Inner: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: Dimensions.get('screen').width,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  Btns_Space: {
    height: 20,
  },
  Btns_VerticalMargin: {
    flex: 1,
  },
  Hangup: {
    // position: 'absolute',
    // bottom: 40,
    // left: 0,
    // right: 0,
    marginBottom: 40,
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
  Hangup_incomingText_avoidLargeImg: {
    bottom: undefined,
    top: 200,
  },
  labelStyle: {
    paddingRight: 50,
  },
  Image_wrapper: {
    marginHorizontal: 15,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ImageSize: {
    height: 130,
    width: 130,
    borderRadius: 75,
  },
  ImageLargeSize: {
    height: '100%',
    width: (height * 30) / 100,
    backgroundColor: 'white',
  },
  styleTextBottom: {
    marginTop: 20,
  },
  Hangup_avoidAvatar: {
    top: '35%',
  },
  Hangup_avoidAvatar_Large: {
    top: '60%',
  },
  LoadingFullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hidden: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '-100%',
    left: '-100%',
  },
  viewHangupBtns: {
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 10,
  },
  viewHangupBtn: {
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  txtHold: {
    height: 65,
    marginBottom: 10,
  },
  smallAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
  },
  vContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  vContainerVideo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
})

// render all the calls in App.tsx
// the avatars will be kept even if we navigate between views
@observer
export class RenderAllCalls extends Component {
  prevCallsLength = getCallStore().calls.length
  componentDidUpdate() {
    const l = getCallStore().calls.length
    if (this.prevCallsLength && !l) {
      Nav().backToPageCallRecents()
    }
    this.prevCallsLength = l
  }
  render() {
    const s = getCallStore()
    if (s.inPageCallManage && !s.calls.length) {
      return (
        <Layout
          compact
          noScroll
          onBack={Nav().backToPageCallRecents}
          title={intl`Connecting...`}
        />
      )
    }
    return (
      <>
        {s.calls.map(c => (
          <PageCallManage key={c.id} call={c} />
        ))}
      </>
    )
  }
}

@observer
class PageCallManage extends Component<{
  call: Call
}> {
  componentDidMount() {
    this.checkJavaPn()
    this.componentDidUpdate()
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.onAppStateChange,
    )
  }
  componentDidUpdate() {
    this.hideButtonsIfVideo()
    this.openJavaPnOnVisible()
  }
  componentWillUnmount() {
    getCallStore().onCallKeepAction()
    this.appStateSubscription?.remove()
  }

  @observable private showButtonsInVideoCall = true
  private alreadySetShowButtonsInVideoCall = false
  @action private toggleButtons = () => {
    this.showButtonsInVideoCall = !this.showButtonsInVideoCall
  }
  @action private hideButtonsIfVideo = () => {
    if (
      !getCallStore().inPageCallManage?.isFromCallBar &&
      !this.alreadySetShowButtonsInVideoCall &&
      this.props.call.remoteVideoEnabled
    ) {
      this.showButtonsInVideoCall = false
      this.alreadySetShowButtonsInVideoCall = true
    }
  }

  @observable private hasJavaPn = true
  private checkJavaPn = async () => {
    if (
      Platform.OS !== 'android' ||
      !this.props.call.incoming ||
      !getAuthStore().getCurrentAccount()?.pushNotificationEnabled
    ) {
      runInAction(() => {
        this.hasJavaPn = false
      })
      return
    }
    // the PN may come slower than SIP web socket
    // we check if PN screen exists here in 5 seconds
    // must get callkeepUuid from object since it may be assigned lately
    for (let i = 0; i < 5; i++) {
      const uuid = this.props.call.callkeepUuid
      if (!uuid) {
        await waitTimeout(1000)
        continue
      }
      const r = await BrekekeUtils.hasIncomingCallActivity(uuid)
      console.log('hasIncomingCallActivity', r)
      if (r) {
        return
      }
      await waitTimeout(1000)
    }
    runInAction(() => {
      console.warn(
        `No incoming call activity for uuid=${this.props.call.callkeepUuid}`,
      )
      this.hasJavaPn = false
    })
  }
  private openJavaPnOnVisible = () => {
    const { call: c } = this.props
    const s = getCallStore()
    if (
      this.hasJavaPn &&
      this.isVisible() &&
      c.callkeepUuid &&
      !c.transferring &&
      s.prevDisplayingCallId !== c.id
    ) {
      s.prevDisplayingCallId = c.id
      BrekekeUtils.onPageCallManage(c.callkeepUuid)
    }
  }

  private appStateSubscription?: NativeEventSubscription
  private onAppStateChange = () => {
    if (AppState.currentState === 'active') {
      const { call: c } = this.props
      if (
        this.hasJavaPn &&
        this.isVisible() &&
        c.callkeepUuid &&
        !c.transferring
      ) {
        getCallStore().inPageCallManage = undefined
      }
    }
  }

  private isVisible = () => {
    const s = getCallStore()
    const { call: c } = this.props
    return s.inPageCallManage && s.displayingCallId === c.id
  }

  private isBtnHidden = (k: CallConfigKey) => {
    const {
      call: { callConfig },
    } = this.props
    if (callConfig?.[k]) {
      return callConfig[k] === 'false'
    }
    const { pbxConfig } = getAuthStore()
    return pbxConfig?.[`webphone.call.${k}`] === 'false'
  }

  private renderLayout = () => {
    const { call: c } = this.props
    return (
      <Layout
        compact
        dropdown={
          c.localVideoEnabled && !c.transferring
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
        onBack={Nav().backToPageCallRecents}
        title={c.getDisplayName() || intl`Connecting...`}
        transparent={!c.transferring}
      >
        <View
          style={
            this.props.call.localVideoEnabled || c.localVideoEnabled
              ? css.vContainerVideo
              : css.vContainer
          }
        >
          {this.renderCall()}
        </View>
      </Layout>
    )
  }
  private renderCall = () => {
    const { call: c } = this.props
    // render PageCallTransferAttend as a layer instead
    // so switching will not cause the avatar to reload
    const renderTransferring = () => (
      <View style={css.LoadingFullScreen}>
        <PageCallTransferAttend />
      </View>
    )
    if (this.hasJavaPn) {
      if (c.transferring) {
        return renderTransferring()
      }
      return (
        <View style={css.LoadingFullScreen}>
          <ActivityIndicator size='large' color='black' />
        </View>
      )
    }
    return (
      <>
        {c.localVideoEnabled && this.renderVideo()}
        {this.renderAvatar()}
        {this.renderBtns()}
        {this.renderHangupBtn()}
        {c.transferring ? renderTransferring() : null}
      </>
    )
  }

  private renderVideo = () => {
    const { call: c } = this.props
    return (
      <>
        <View style={css.cameraStyle}>
          <ButtonIcon
            color='white'
            noborder
            onPress={c.toggleSwitchCamera}
            path={
              c.isFrontCamera ? mdiCameraFrontVariant : mdiCameraRearVariant
            }
            size={40}
          />
        </View>
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
  }

  private renderAvatar = () => {
    const { call: c } = this.props
    const incoming = c.incoming && !c.answered
    const isLarge = !!(c.partyImageSize && c.partyImageSize === 'large')
    const isShowAvatar =
      (c.partyImageUrl || c.talkingImageUrl) && !c.localVideoEnabled
    const styleBigAvatar = c.localVideoEnabled
      ? { flex: 1, maxHeight: Dimensions.get('window').height / 2 - 20 }
      : { flex: 1 }
    const styleViewAvatar = isLarge ? styleBigAvatar : css.smallAvatar
    return (
      <View style={[css.Image_wrapper, { flex: 1 }]}>
        <View
          style={isShowAvatar ? styleViewAvatar : { height: 0, opacity: 0 }}
        >
          {c.answered && (
            <SmartImage
              key={c.talkingImageUrl}
              uri={`${c.talkingImageUrl}`}
              style={{ flex: 1, aspectRatio: 1 }}
            />
          )}
          {!c.answered && (
            <SmartImage
              key={c.partyImageUrl}
              uri={`${c.partyImageUrl}`}
              style={{ flex: 1, aspectRatio: 1 }}
            />
          )}
        </View>
        <View style={!isShowAvatar ? css.styleTextBottom : {}}>
          <RnText title white center numberOfLines={2}>
            {`${c.getDisplayName()}`}
          </RnText>
          {c.answered && (
            <Duration subTitle white center>
              {c.answeredAt}
            </Duration>
          )}
          {incoming && (
            <RnText bold white center>
              {intl`Incoming Call`}
            </RnText>
          )}
        </View>
      </View>
    )
  }

  private renderBtns = () => {
    const { call: c } = this.props
    const n = getCallStore().calls.filter(_ => _.id !== c.id).length
    if (c.localVideoEnabled && !this.showButtonsInVideoCall) {
      return null
    }
    const Container = c.localVideoEnabled ? RnTouchableOpacity : View
    const activeColor = c.localVideoEnabled
      ? v.colors.primary
      : v.colors.warning
    const isHideButtons =
      (c.incoming || (!c.withSDPControls && Platform.OS === 'web')) &&
      !c.answered
    const incoming = c.incoming && !c.answered
    return (
      <Container
        onPress={c.localVideoEnabled ? this.toggleButtons : undefined}
        style={[css.Btns, { marginTop: !incoming ? 30 : 0 }]}
      >
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
        <View style={{ paddingTop: 10 }} />
        <View style={[css.Btns_Inner, isHideButtons && css.Btns_Hidden]}>
          {!this.isBtnHidden('transfer') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
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
          )}
          {!this.isBtnHidden('park') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
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
          )}
          {!this.isBtnHidden('video') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
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
          )}
          {Platform.OS !== 'web' && !this.isBtnHidden('speaker') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
              bgcolor={
                getCallStore().isLoudSpeakerEnabled ? activeColor : 'white'
              }
              color={getCallStore().isLoudSpeakerEnabled ? 'white' : 'black'}
              name={intl`SPEAKER`}
              noborder
              onPress={getCallStore().toggleLoudSpeaker}
              path={
                getCallStore().isLoudSpeakerEnabled
                  ? mdiVolumeHigh
                  : mdiVolumeMedium
              }
              size={40}
              textcolor='white'
            />
          )}
          {!this.isBtnHidden('mute') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
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
          )}
          {!this.isBtnHidden('record') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
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
          )}
          {!this.isBtnHidden('dtmf') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
              disabled={!(c.withSDPControls || c.answered)}
              bgcolor='white'
              color='black'
              name={intl`KEYPAD`}
              noborder
              onPress={Nav().goToPageCallDtmfKeypad}
              path={mdiDialpad}
              size={40}
              textcolor='white'
            />
          )}
          {!this.isBtnHidden('hold') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
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
          )}
        </View>
        <View style={{ paddingBottom: 10 }} />
      </Container>
    )
  }

  private renderHangupBtn = () => {
    const { call: c } = this.props
    const incoming = c.incoming && !c.answered
    const isLarge = !!(c.partyImageSize && c.partyImageSize === 'large')
    const isHangupBtnHidden = incoming && this.isBtnHidden('hangup')
    return (
      <View style={[css.viewHangupBtns, { marginTop: isLarge ? 10 : 40 }]}>
        {c.holding ? (
          <View style={css.txtHold}>
            <RnText small white center>
              {intl`CALL IS ON HOLD`}
            </RnText>
          </View>
        ) : (
          <View style={css.viewHangupBtn}>
            {incoming && this.isVisible() && <IncomingItemWithTimer />}
            {incoming && (
              <ButtonIcon
                bgcolor={v.colors.primary}
                color='white'
                noborder
                onPress={() => c.answer({ ignoreNav: true })}
                path={mdiPhone}
                size={40}
                textcolor='white'
              />
            )}
            {incoming && (
              <View style={{ width: isHangupBtnHidden ? 0 : 100 }} />
            )}
            {!isHangupBtnHidden && (
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
        )}
      </View>
    )
  }

  render() {
    return (
      <BrekekeGradient
        white={this.props.call.localVideoEnabled}
        style={this.isVisible() ? undefined : css.hidden}
      >
        {this.renderLayout()}
      </BrekekeGradient>
    )
  }
}
