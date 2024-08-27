import { action, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import type { NativeEventSubscription } from 'react-native'
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native'

import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiCameraRolate,
  mdiDialpad,
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPauseCircle,
  mdiPhone,
  mdiPhoneHangup,
  mdiPlayCircle,
  mdiRecordCall,
  mdiVideo,
  mdiVideoCamera,
  mdiVideoOff,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '../assets/icons'
import { BrekekeGradient } from '../components/BrekekeGradient'
import { ButtonIcon } from '../components/ButtonIcon'
import { IncomingItemWithTimer } from '../components/CallNotify'
import { CallVideosCarousel } from '../components/CallVideosCarousel'
import { FieldButton } from '../components/FieldButton'
import { Layout } from '../components/Layout'
import { RnIcon, RnTouchableOpacity } from '../components/Rn'
import { RnText } from '../components/RnText'
import { SmartImage } from '../components/SmartImage'
import { v } from '../components/variables'
import { getAuthStore } from '../stores/authStore'
import type { Call, CallConfigKey } from '../stores/Call'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { Duration } from '../stores/timerStore'
import { BrekekeUtils } from '../utils/RnNativeModules'
import { waitTimeout } from '../utils/waitTimeout'
import { PageCallTransferAttend } from './PageCallTransferAttend'

const { width, height } = Dimensions.get('window')
const minSizeH = height * 0.4
const minSizeW = width * 0.9
const minSizeImageWrapper = minSizeH > minSizeW ? minSizeW : minSizeH

const css = StyleSheet.create({
  BtnSwitchCamera: {
    position: 'absolute',
    top: 0, // header compact height
    right: 45,
    height: 70,
    zIndex: 100,
    width: 50,
    paddingHorizontal: 0,
    paddingVertical: 20,
    borderRadius: 0,
  },
  cameraStyle: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 100,
  },
  Video: {
    position: 'absolute',
    top: 0, // header compact height
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
  },
  Video_Space: {
    // flex: 1,
    // alignSelf: 'stretch',
    height: 70,
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
    marginHorizontal: 25,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: minSizeImageWrapper,
    minWidth: minSizeImageWrapper,
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
    flex: 1,
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
  SubInfo: {
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: 2,
  },
  Duration: {
    backgroundColor: '#4cc5de',
  },
  OnHold: {
    backgroundColor: '#88888980',
  },
  VCalling: {
    backgroundColor: '#74bf53',
  },
  DurationText: { fontSize: 10, lineHeight: 14, letterSpacing: 1.35 },
  OnHoldText: {
    fontSize: 9,
  },
})
export const backAction = () =>
  getAuthStore().phoneappliEnabled()
    ? Nav().backToPageCallKeypad()
    : Nav().backToPageCallRecents()

// render all the calls in App.tsx
// the avatars will be kept even if we navigate between views
@observer
export class RenderAllCalls extends Component {
  prevCallsLength = getCallStore().calls.length

  componentDidMount = () => {
    const s = getCallStore()
    if (s.inPageCallManage && !s.calls.length) {
      backAction()
    }
  }
  componentDidUpdate = () => {
    const l = getCallStore().calls.length
    if (this.prevCallsLength && !l) {
      backAction()
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
          onBack={backAction}
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
  componentDidMount = () => {
    this.checkJavaPn()
    this.componentDidUpdate()
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.onAppStateChange,
    )
  }
  componentDidUpdate = () => {
    this.hideButtonsIfVideo()
    this.openJavaPnOnVisible()
  }
  componentWillUnmount = () => {
    getCallStore().onCallKeepAction()
    this.appStateSubscription?.remove()
    const { call: c } = this.props
    if (c.incoming) {
      return
    }
    const s = getCallStore()
    if (s.ongoingCallId === c.id || s.displayingCallId === c.id) {
      s.prevDisplayingCallId = ''
    }
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
        // compact
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
        onBack={backAction}
        // title={c.getDisplayName() || intl`Connecting...`}
        transparent
        colorIcon='white'
        rightItems={
          c.localVideoEnabled ? (
            <RnTouchableOpacity
              style={css.BtnSwitchCamera}
              onPress={c.toggleSwitchCamera}
              activeOpacity={0.5}
            >
              <RnIcon path={mdiCameraRolate} color='white' size={28} />
            </RnTouchableOpacity>
          ) : undefined
        }
        sizeIconBack={30}
        heightDropdown={75}
      >
        <View
          // style={
          //   this.props.call.localVideoEnabled || c.localVideoEnabled
          //     ? css.vContainerVideo
          //     : css.vContainer
          // }
          style={css.vContainerVideo}
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
        {this.renderVideo()}
        {this.renderInfo()}
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
        <View style={css.Video_Space} />
        {c.localVideoEnabled && (
          <>
            <View
              style={[
                css.Video,
                { zIndex: !this.showButtonsInVideoCall ? 200 : undefined },
              ]}
            >
              <CallVideosCarousel
                call={c}
                showButtonsInVideoCall={this.showButtonsInVideoCall}
                onButtonsInVideo={this.toggleButtons}
              />
            </View>
            <RnTouchableOpacity
              onPress={this.toggleButtons}
              activeOpacity={0}
              style={[
                StyleSheet.absoluteFill,
                { opacity: 0.5, backgroundColor: '#111111' },
              ]}
            />
          </>
        )}
      </>
    )
  }

  private renderAvatar = () => {
    const { call: c } = this.props
    const incoming = c.incoming && !c.answered
    const isLarge = !!(c.partyImageSize && c.partyImageSize === 'large')
    const isShowAvatar =
      !!(c.partyImageUrl || c.talkingImageUrl) && !c.localVideoEnabled
    const styleBigAvatar = c.localVideoEnabled
      ? { flex: 1, maxHeight: Dimensions.get('window').height / 2 - 20 }
      : { flex: 1, paddingTop: 20 }
    const styleViewAvatar = isLarge ? styleBigAvatar : css.smallAvatar

    return (
      <View
        style={[
          isShowAvatar
            ? css.Image_wrapper
            : {
                ...css.Image_wrapper,
                minWidth: '100%',
                minHeight: height * 0.1,
              },
        ]}
      >
        <View
          style={isShowAvatar ? styleViewAvatar : { height: 0, opacity: 0 }}
        >
          {c.answered && (
            <SmartImage
              key={c.talkingImageUrl}
              uri={`${c.talkingImageUrl}`}
              style={{ flex: 1, aspectRatio: 1 }}
              incoming={c.incoming}
            />
          )}
          {!c.answered && (
            <SmartImage
              key={c.partyImageUrl}
              uri={`${c.partyImageUrl}`}
              style={{ flex: 1, aspectRatio: 1 }}
              incoming={c.incoming}
            />
          )}
        </View>
        <View style={!isShowAvatar ? css.styleTextBottom : {}}>
          {incoming && (
            <RnText bold white center>
              {intl`Incoming Call`}
            </RnText>
          )}
        </View>
      </View>
    )
  }

  private renderInfo = () => {
    const { call: c } = this.props
    return (
      <View
        style={{ width: '100%', alignItems: 'flex-start', paddingLeft: 18 }}
      >
        <RnText
          title
          white
          center
          bold
          numberOfLines={2}
          style={{ fontSize: 24, lineHeight: 27, marginBottom: 6 }}
        >
          {`${c.getDisplayName()}`}
        </RnText>
        {c.answered &&
          (!c.holding ? (
            <View style={[css.SubInfo, css.Duration]}>
              <Duration white center style={css.DurationText}>
                {c.answeredAt}
              </Duration>
            </View>
          ) : (
            <View style={[css.SubInfo, css.OnHold]}>
              <RnText white center style={[css.DurationText]}>
                ON HOLD
              </RnText>
            </View>
          ))}
        {!c.answered && c.localVideoEnabled && (
          <View style={[css.SubInfo, css.VCalling]}>
            <RnText white center style={[css.DurationText]}>
              VIDEO CALLING
            </RnText>
          </View>
        )}
        {!c.answered && !c.localVideoEnabled && (
          <View style={[css.SubInfo, css.VCalling]}>
            <RnText white center style={[css.DurationText]}>
              VOICE CALLING
            </RnText>
          </View>
        )}
      </View>
    )
  }

  private renderBtns = () => {
    const { call: c } = this.props
    const n = getCallStore().calls.filter(_ => _.id !== c.id).length
    if (!this.showButtonsInVideoCall) {
      return null
    }
    const Container = c.localVideoEnabled ? RnTouchableOpacity : View
    const activeColor = c.localVideoEnabled
      ? v.colors.primary
      : v.colors.greyIcon
    const isHideButtons =
      (c.incoming || (!c.withSDPControls && Platform.OS === 'web')) &&
      !c.answered
    return (
      <Container
        onPress={c.localVideoEnabled ? this.toggleButtons : undefined}
        style={{ marginTop: isHideButtons ? 30 : 0, flex: 3 }}
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
              style={{ justifyContent: 'center', alignItems: 'center' }}
              onPress={Nav().goToPageCallTransferChooseUser}
              path={mdiCallSplit}
              size={40}
              textcolor='white'
              viewBox='0 0 32 32'
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
              viewBox='0 0 32 32'
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
              path={c.localVideoEnabled ? mdiVideoCamera : mdiVideoOff}
              size={40}
              viewBox='0 0 32 32'
              textcolor='white'
            />
          )}
          {Platform.OS !== 'web' && !this.isBtnHidden('speaker') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
              disabled={c.sessionStatus === 'dialing'}
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
              color={c.recording ? '#FF4526' : 'black'}
              name={intl`RECORD`}
              noborder
              onPress={c.toggleRecording}
              path={mdiRecordCall}
              size={40}
              viewBox='0 0 32 32'
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
              viewBox='0 0 32 32'
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
              // viewBox={c.holding ? '0 0 24 24' : '0 0 32 32'}
              size={40}
              msLoading={1000}
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
    const isHangupBtnHidden =
      (incoming && this.isBtnHidden('hangup')) || !this.showButtonsInVideoCall
    return (
      <View style={[css.viewHangupBtns, { marginTop: isLarge ? 10 : 40 }]}>
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
          {incoming && <View style={{ width: isHangupBtnHidden ? 0 : 100 }} />}
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
