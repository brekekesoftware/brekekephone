import { action, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { Component } from 'react'
import type { NativeEventSubscription } from 'react-native'
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native'

import {
  mdiAlphaPCircle,
  mdiCallSplit,
  mdiChat,
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
} from '#/assets/icons'
import { BrekekeGradient } from '#/components/BrekekeGradient'
import { ButtonIcon } from '#/components/ButtonIcon'
import { IncomingItemWithTimer } from '#/components/CallNotify'
import { CallVideosCarousel } from '#/components/CallVideosCarousel'
import { FieldButton } from '#/components/FieldButton'
import { Layout } from '#/components/Layout'
import { RnTouchableOpacity } from '#/components/Rn'
import { RnText } from '#/components/RnText'
import { SmartImage } from '#/components/SmartImage'
import { v } from '#/components/variables'
import { VideoPlayer } from '#/components/VideoPlayer'
import { isAndroid, isWeb } from '#/config'
import { PageCallTransferAttend } from '#/pages/PageCallTransferAttend'
import type { Call, CallConfigKey } from '#/stores/Call'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { Duration } from '#/stores/timerStore'
import { BrekekeUtils } from '#/utils/BrekekeUtils'
import { checkMutedRemoteUser } from '#/utils/checkMutedRemoteUser'
import { waitTimeout } from '#/utils/waitTimeout'

const { width, height } = Dimensions.get('window')
const minSizeH = height * 0.3
const minSizeW = width * 0.8
const minSizeImageWrapper = minSizeH > minSizeW ? minSizeW : minSizeH

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
  BtnFuncCalls: {
    marginBottom: 10,
  },
  Btns_Hidden: {
    opacity: 0,
  },
  Btns_Inner: {
    flexDirection: 'row',
    alignSelf: 'center',
    width,
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
    marginHorizontal: 15,
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
    zIndex: 101,
  },
  hidden: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '-100%',
    left: '-100%',
  },
  viewHangupBtns: {
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 10,
    zIndex: 12,
    pointerEvents: 'box-none',
  },
  viewHangupBtn: {
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
    zIndex: 12,
    flexDirection: 'row',
    pointerEvents: 'box-none',
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
export const backAction = () =>
  ctx.auth.phoneappliEnabled()
    ? ctx.nav.backToPageCallKeypad()
    : ctx.nav.backToPageCallRecents()

// render all the calls in App.tsx
// the avatars will be kept even if we navigate between views
@observer
export class RenderAllCalls extends Component {
  prevCallsLength = ctx.call.calls.length

  componentDidMount = () => {
    if (ctx.call.inPageCallManage && !ctx.call.calls.length) {
      backAction()
    }
  }
  componentDidUpdate = () => {
    const l = ctx.call.calls.length
    if (this.prevCallsLength && !l) {
      backAction()
    }
    this.prevCallsLength = l
  }

  render() {
    if (ctx.call.inPageCallManage && !ctx.call.calls.length) {
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
        {ctx.call.calls.map(c => (
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
    // handle the case when app is killed and opened during a call with incoming call
    if (this.props.call.incoming) {
      this.onAppStateChange(AppState.currentState)
    }

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
    ctx.call.onCallKeepAction()
    this.appStateSubscription?.remove()
    const { call: c } = this.props
    if (c.incoming) {
      return
    }

    if (ctx.call.ongoingCallId === c.id || ctx.call.displayingCallId === c.id) {
      ctx.call.prevDisplayingCallId = ''
    }
  }

  @observable private showButtonsInVideoCall = true
  private alreadySetShowButtonsInVideoCall = false
  @action private toggleButtons = () => {
    this.showButtonsInVideoCall = !this.showButtonsInVideoCall
  }
  @action private hideButtonsIfVideo = () => {
    if (
      !ctx.call.inPageCallManage?.isFromCallBar &&
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
      !isAndroid ||
      !this.props.call.incoming ||
      !ctx.auth.getCurrentAccount()?.pushNotificationEnabled
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

    if (
      this.hasJavaPn &&
      this.isVisible() &&
      c.callkeepUuid &&
      !c.transferring &&
      ctx.call.prevDisplayingCallId !== c.id
    ) {
      ctx.call.prevDisplayingCallId = c.id
      BrekekeUtils.onPageCallManage(c.callkeepUuid)
    }
  }

  private appStateSubscription?: NativeEventSubscription
  private onAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      const { call: c } = this.props
      if (
        this.hasJavaPn &&
        this.isVisible() &&
        c.callkeepUuid &&
        !c.transferring
      ) {
        ctx.call.inPageCallManage = undefined
      }
    }
  }

  private isVisible = () => {
    const { call: c } = this.props
    return ctx.call.inPageCallManage && ctx.call.displayingCallId === c.id
  }

  private isBtnHidden = (k: CallConfigKey) => {
    const {
      call: { callConfig },
    } = this.props
    if (callConfig?.[k]) {
      return callConfig[k] === 'false'
    }
    return ctx.auth.pbxConfig?.[`webphone.call.${k}`] === 'false'
  }

  private renderLayout = () => {
    const { call: c } = this.props
    const navChatDetail = () => {
      if (c.partyNumber.startsWith('uc')) {
        ctx.nav.goToPageChatGroupDetail({
          groupId: c.partyNumber.replace('uc', ''),
        })
      } else {
        ctx.nav.goToPageChatDetail({ buddy: c.partyNumber })
      }
    }
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
        iconRights={!c.transferring ? [mdiChat] : []}
        iconRightFuncs={[() => navChatDetail()]}
        noScroll
        onBack={backAction}
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
        {c.localVideoEnabled && <View style={{ flex: 1 }} />}
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
        <View style={[css.Video]}>
          <VideoPlayer
            sourceObject={
              checkMutedRemoteUser(
                c.remoteUserOptionsTable?.[c.videoStreamActive?.user ?? '']
                  ?.muted,
              )
                ? c.videoStreamActive?.remoteStreamObject
                : null
            }
            zOrder={0}
          />
        </View>
        <CallVideosCarousel
          call={c}
          showButtonsInVideoCall={this.showButtonsInVideoCall}
          onButtonsInVideo={this.toggleButtons}
        />
        <RnTouchableOpacity
          onPress={this.toggleButtons}
          activeOpacity={0}
          style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
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
      ? { flex: 1, maxHeight: height / 2 - 20 }
      : { flex: 1 }
    const styleViewAvatar = isLarge ? styleBigAvatar : css.smallAvatar
    return (
      <View style={[!c.localVideoEnabled && css.Image_wrapper, { flex: 1 }]}>
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
    const n = ctx.call.calls.filter(_ => _.id !== c.id).length
    if (c.localVideoEnabled && !this.showButtonsInVideoCall) {
      return null
    }
    const Container = c.localVideoEnabled ? RnTouchableOpacity : View
    const activeColor = c.localVideoEnabled
      ? v.colors.primary
      : v.colors.warning
    const isHideButtons =
      (c.incoming || (!c.withSDPControls && isWeb)) && !c.answered
    return (
      <Container
        onPress={c.localVideoEnabled ? this.toggleButtons : undefined}
        style={{
          marginTop: isHideButtons ? 30 : 0,
          zIndex: 100,
        }}
      >
        {n > 0 && (
          <FieldButton
            label={intl`BACKGROUND CALLS`}
            onCreateBtnPress={ctx.nav.goToPageCallBackgrounds}
            textInputStyle={css.labelStyle}
            disabled={ctx.call.isAnyHoldLoading}
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
              onPress={ctx.nav.goToPageCallTransferChooseUser}
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
              onPress={ctx.nav.goToPageCallParksOngoing}
              path={mdiAlphaPCircle}
              size={40}
              textcolor='white'
            />
          )}
          {!this.isBtnHidden('video') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
              disabled={!c.answered}
              bgcolor={
                c.localVideoEnabled && !c.mutedVideo ? activeColor : 'white'
              }
              color={c.localVideoEnabled && !c.mutedVideo ? 'white' : 'black'}
              name={intl`VIDEO`}
              noborder
              onPress={c.toggleVideo}
              path={
                c.localVideoEnabled && !c.mutedVideo ? mdiVideo : mdiVideoOff
              }
              size={40}
              textcolor='white'
            />
          )}
          {!isWeb && !this.isBtnHidden('speaker') && (
            <ButtonIcon
              styleContainer={css.BtnFuncCalls}
              disabled={c.sessionStatus === 'dialing'}
              bgcolor={ctx.call.isLoudSpeakerEnabled ? activeColor : 'white'}
              color={ctx.call.isLoudSpeakerEnabled ? 'white' : 'black'}
              name={intl`SPEAKER`}
              noborder
              onPress={ctx.call.toggleLoudSpeaker}
              path={
                ctx.call.isLoudSpeakerEnabled ? mdiVolumeHigh : mdiVolumeMedium
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
              loading={c.rqLoadings['record']}
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
              onPress={ctx.nav.goToPageCallDtmfKeypad}
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
              loading={c.rqLoadings['hold']}
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
      (incoming && this.isBtnHidden('hangup')) ||
      (!this.showButtonsInVideoCall && c.answered)
    return (
      <View style={[css.viewHangupBtns, { marginTop: isLarge ? 10 : 40 }]}>
        {c.holding && !c.rqLoadings['hold'] ? (
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
