import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import type { NativeEventSubscription } from 'react-native'
import { AppState } from 'react-native'

import { View } from '@/rn/core/components/view'
import { isAndroid, isWeb } from '@/rn/core/utils/platform'
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
import { BrekekeGradient } from '#/components/brekeke-gradient'
import { ButtonIcon } from '#/components/button-icon'
import { IncomingItemWithTimer } from '#/components/call-notify'
import { CallVideosCarousel } from '#/components/call-videos-carousel'
import { FieldButton } from '#/components/field-button'
import { Layout } from '#/components/layout'
import { RnTouchableOpacity } from '#/components/rn'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { RnText } from '#/components/rn-text'
import { SmartImage } from '#/components/smart-image'
import { VideoPlayer } from '#/components/video-player'
import { defaultTimeout } from '#/config'
import { PageCallTransferAttend } from '#/pages/page-call-transfer-attend'
import type { Call, CallConfigKey } from '#/stores/call'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { Duration } from '#/stores/timer-store'
import { BrekekeUtils } from '#/utils/brekeke-utils'
import { checkMutedRemoteUser } from '#/utils/check-muted-remote-user'
import { waitTimeout } from '#/utils/wait-timeout'

export const backAction = () =>
  ctx.auth.phoneappliEnabled()
    ? ctx.nav.backToPageCallKeypad()
    : ctx.nav.backToPageCallRecents()

// render all the calls in App.tsx
// the avatars will be kept even if we navigate between views
export const RenderAllCalls = observer(() => {
  const prevCallsLengthRef = useRef(ctx.call.calls.length)
  const callsLength = ctx.call.calls.length
  useEffect(() => {
    if (ctx.call.inPageCallManage && !callsLength) {
      backAction()
    }
  }, [])
  useEffect(() => {
    const prev = prevCallsLengthRef.current
    prevCallsLengthRef.current = callsLength
    if (prev && !callsLength) {
      backAction()
    }
  }, [callsLength])

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
})

const PageCallManage = observer(({ call: c }: { call: Call }) => {
  const [showButtonsInVideoCall, setShowButtonsInVideoCall] = useState(true)
  const [
    alreadySetShowButtonsInVideoCall,
    setAlreadySetShowButtonsInVideoCall,
  ] = useState(false)
  const [hasJavaPn, setHasJavaPn] = useState(true)

  const appStateSubscriptionRef = useRef<NativeEventSubscription | undefined>(
    undefined,
  )
  // keep hasJavaPn accessible in the stable onAppStateChange callback
  const hasJavaPnRef = useRef(hasJavaPn)
  hasJavaPnRef.current = hasJavaPn

  const isVisible = () =>
    ctx.call.inPageCallManage && ctx.call.displayingCallId === c.id

  const isBtnHidden = (k: CallConfigKey) => {
    const { callConfig } = c
    if (callConfig?.[k]) {
      return callConfig[k] === 'false'
    }
    return ctx.auth.pbxConfig?.[`webphone.call.${k}`] === 'false'
  }

  const toggleButtons = () => setShowButtonsInVideoCall(prev => !prev)

  const checkJavaPn = async () => {
    if (
      !isAndroid ||
      !c.incoming ||
      !ctx.auth.getCurrentAccount()?.pushNotificationEnabled
    ) {
      setHasJavaPn(false)
      return
    }
    // the PN may come slower than SIP web socket
    // we check if PN screen exists here in 5 seconds
    // must get callkeepUuid from object since it may be assigned lately
    for (let i = 0; i < 5; i++) {
      const uuid = c.callkeepUuid
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
    console.warn(`No incoming call activity for uuid=${c.callkeepUuid}`)
    setHasJavaPn(false)
  }

  const onAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      if (
        hasJavaPnRef.current &&
        isVisible() &&
        c.callkeepUuid &&
        !c.transferring
      ) {
        ctx.call.inPageCallManage = undefined
      }
    }
  }

  useEffect(() => {
    // handle the case when app is killed and opened during a call with incoming call
    if (c.incoming) {
      onAppStateChange(AppState.currentState)
    }

    checkJavaPn()
    // componentDidUpdate logic runs on first render naturally via effects below
    const sub = AppState.addEventListener('change', onAppStateChange)
    appStateSubscriptionRef.current = sub
    return () => {
      ctx.call.onCallKeepAction()
      appStateSubscriptionRef.current?.remove()
      if (!c.incoming) {
        if (
          ctx.call.ongoingCallId === c.id ||
          ctx.call.displayingCallId === c.id
        ) {
          ctx.call.prevDisplayingCallId = ''
        }
      }
    }
  }, [])

  // hideButtonsIfVideo
  useEffect(() => {
    if (
      !ctx.call.inPageCallManage?.isFromCallBar &&
      !alreadySetShowButtonsInVideoCall &&
      c.remoteVideoEnabled
    ) {
      setShowButtonsInVideoCall(false)
      setAlreadySetShowButtonsInVideoCall(true)
    }
  }, [c.remoteVideoEnabled, alreadySetShowButtonsInVideoCall])

  // openJavaPnOnVisible
  const callkeepUuid = c.callkeepUuid
  const transferring = c.transferring
  const answered = c.answered
  useEffect(() => {
    // BUG-1225: don't auto-reorder this already-answered call to front if a
    // newer ringing call exists. Race: upsertCall sets displayingCallId=newCall,
    // then debounced updateCurrentCall reverts it ~500ms later, retriggering
    // this componentDidUpdate hook for the talking call - which would push the
    // ringing call's IncomingCallActivity to background. Only auto-reorders are
    // guarded; user-initiated Nav.goToPageCallManage / backToPageCallManage
    // still proceed via their own direct BrekekeUtils.onPageCallManage call.
    if (
      answered &&
      ctx.call.calls.some(o => o.id !== c.id && o.incoming && !o.answered)
    ) {
      return
    }

    if (
      hasJavaPn &&
      isVisible() &&
      callkeepUuid &&
      !transferring &&
      ctx.call.prevDisplayingCallId !== c.id
    ) {
      ctx.call.prevDisplayingCallId = c.id
      BrekekeUtils.onPageCallManage(callkeepUuid)
    }
  }, [hasJavaPn, callkeepUuid, transferring, answered])

  const renderVideo = () => (
    <>
      {/* Keep the name/duration under the compact header, but let this spacer
          shrink on short screens so the video call controls do not get cut. */}
      <View className='max-h-13.75 min-h-11 shrink basis-[7.5vh] self-stretch' />
      <View className='absolute top-10 right-0 bottom-0 left-0 bg-black'>
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
        showButtonsInVideoCall={showButtonsInVideoCall}
        onButtonsInVideo={toggleButtons}
      />
      <RnTouchableOpacity
        onPress={toggleButtons}
        activeOpacity={0}
        className='absolute top-10 right-0 bottom-0 left-0 z-10'
      />
    </>
  )

  const renderAvatar = () => {
    const incoming = c.incoming && !c.answered
    const isLarge = !!(c.partyImageSize && c.partyImageSize === 'large')
    const isShowAvatar =
      (c.partyImageUrl || c.talkingImageUrl) && !c.localVideoEnabled
    // keep both images mounted so they don't reload when answered toggles
    const avatarImages = (
      <>
        {c.answered && (
          <SmartImage
            key={c.talkingImageUrl}
            uri={`${c.talkingImageUrl}`}
            className='h-full w-full'
            incoming={c.incoming}
          />
        )}
        {!c.answered && (
          <SmartImage
            key={c.partyImageUrl}
            uri={`${c.partyImageUrl}`}
            className='h-full w-full'
            incoming={c.incoming}
          />
        )}
      </>
    )
    // Square avatar capped at 80vw (keeps margins, never overflows the header).
    // While ringing the cap is on the wrapper (name stays under the avatar); once
    // answered it moves to the inner box so the wrapper grows and lowers the name.
    const renderAvatarBox = () => {
      if (!isShowAvatar) {
        return <View className='h-0 opacity-0'>{avatarImages}</View>
      }
      if (!isLarge) {
        return (
          <View className='h-50 w-50 overflow-hidden rounded-full'>
            {avatarImages}
          </View>
        )
      }
      return (
        <View
          className={[
            'w-full flex-1 items-center justify-start',
            !c.answered && 'max-h-[80vw]',
          ]}
        >
          <View
            className={[
              'aspect-square h-full overflow-hidden',
              c.answered && 'max-h-[80vw]',
            ]}
          >
            {avatarImages}
          </View>
        </View>
      )
    }
    return (
      <View
        className={
          !c.localVideoEnabled &&
          'mx-3.75 mt-2 flex-1 flex-col items-center justify-start self-stretch pb-1.25'
        }
      >
        {renderAvatarBox()}
        <View
          className={[
            'mb-1.25 min-h-16 max-w-full shrink-0 self-stretch px-3.75',
            isShowAvatar ? 'mt-2.5' : 'mt-5',
          ]}
        >
          <RnText title white center className='line-clamp-2'>
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

  const renderBtns = () => {
    const n = ctx.call.calls.filter(_ => _.id !== c.id).length
    if (c.localVideoEnabled && !showButtonsInVideoCall) {
      return null
    }
    const Container = c.localVideoEnabled ? RnTouchableOpacity : View
    // active state bg class - primary when in video call, warning otherwise.
    const activeBg = c.localVideoEnabled ? 'bg-primary' : 'bg-warning'
    const isHideButtons =
      (c.incoming || (!c.withSDPControls && isWeb)) && !c.answered
    return (
      <Container
        onPress={c.localVideoEnabled ? toggleButtons : undefined}
        className={['z-100 self-stretch', isHideButtons && 'mt-7.5']}
      >
        {n > 0 && (
          <FieldButton
            label={intl`BACKGROUND CALLS`}
            onCreateBtnPress={ctx.nav.goToPageCallBackgrounds}
            textInputClassName='pr-12.5'
            disabled={ctx.call.isAnyHoldLoading}
            value={
              n > 1
                ? intl`${n} other calls are in background`
                : intl`${n} other call is in background`
            }
          />
        )}
        <View className='pt-2.5' />
        <View
          className={[
            'w-full flex-row flex-wrap items-center justify-center self-center',
            // hidden (not opacity-0) frees the grid's height so the avatar can grow
            isHideButtons && 'hidden',
          ]}
        >
          {!isBtnHidden('transfer') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={!c.answered}
              className='bg-background text-foreground'
              name={intl`TRANSFER`}
              noborder
              onPress={ctx.nav.goToPageCallTransferChooseUser}
              path={mdiCallSplit}
              size={40}
            />
          )}
          {!isBtnHidden('park') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={!c.answered}
              className='bg-background text-foreground'
              name={intl`PARK`}
              noborder
              onPress={ctx.nav.goToPageCallParksOngoing}
              path={mdiAlphaPCircle}
              size={40}
            />
          )}
          {!isBtnHidden('video') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={!c.answered}
              className={
                c.localVideoEnabled && !c.mutedVideo
                  ? [activeBg, 'text-white']
                  : 'bg-background text-foreground'
              }
              name={intl`VIDEO`}
              noborder
              onPress={c.toggleVideo}
              path={
                c.localVideoEnabled && !c.mutedVideo ? mdiVideo : mdiVideoOff
              }
              size={40}
            />
          )}
          {!isWeb && !isBtnHidden('speaker') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={c.sessionStatus === 'dialing'}
              className={
                ctx.call.isLoudSpeakerEnabled
                  ? [activeBg, 'text-white']
                  : 'bg-background text-foreground'
              }
              name={intl`SPEAKER`}
              noborder
              onPress={ctx.call.toggleLoudSpeaker}
              path={
                ctx.call.isLoudSpeakerEnabled ? mdiVolumeHigh : mdiVolumeMedium
              }
              size={40}
            />
          )}
          {!isBtnHidden('mute') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={!c.answered}
              className={
                c.muted
                  ? [activeBg, 'text-white']
                  : 'bg-background text-foreground'
              }
              name={c.muted ? intl`UNMUTE` : intl`MUTE`}
              noborder
              onPress={() => c.toggleMuted()}
              path={c.muted ? mdiMicrophoneOff : mdiMicrophone}
              size={40}
            />
          )}
          {!isBtnHidden('record') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={!c.answered}
              className={
                c.recording
                  ? [activeBg, 'text-white']
                  : 'bg-background text-foreground'
              }
              name={intl`RECORD`}
              noborder
              onPress={c.toggleRecording}
              path={c.recording ? mdiRecordCircle : mdiRecord}
              loading={c.rqLoadings['record']}
              size={40}
            />
          )}
          {!isBtnHidden('dtmf') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={!(c.withSDPControls || c.answered)}
              className='bg-background text-foreground'
              name={intl`KEYPAD`}
              noborder
              onPress={ctx.nav.goToPageCallDtmfKeypad}
              path={mdiDialpad}
              size={40}
            />
          )}
          {!isBtnHidden('hold') && (
            <ButtonIcon
              containerClassName='mb-2.5'
              disabled={!c.answered}
              className={
                c.holding
                  ? [activeBg, 'text-white']
                  : 'bg-background text-foreground'
              }
              name={c.holding ? intl`UNHOLD` : intl`HOLD`}
              noborder
              onPress={c.toggleHoldWithCheck}
              path={c.holding ? mdiPlayCircle : mdiPauseCircle}
              size={40}
              loading={c.rqLoadings['hold']}
              msLoading={defaultTimeout}
            />
          )}
        </View>
        <View className='pb-2.5' />
      </Container>
    )
  }

  const renderHangupBtn = () => {
    const incoming = c.incoming && !c.answered
    const isLarge = !!(c.partyImageSize && c.partyImageSize === 'large')
    const isHangupBtnHidden =
      (incoming && isBtnHidden('hangup')) ||
      (!showButtonsInVideoCall && c.answered)
    return (
      <View
        className={[
          'items-center justify-center',
          // Video: centred (self-center, NOT full-width) so it does not cover the
          // bottom-left PIP. A full-width bar at z-102 would swallow the PIP
          // controls' taps (box-none pass-through is unreliable on Android).
          c.localVideoEnabled
            ? 'absolute bottom-2 z-102 self-center'
            : 'z-12 mb-2 self-stretch',
          !c.localVideoEnabled && (isLarge ? 'mt-2.5' : 'mt-10'),
        ]}
      >
        {c.holding && !c.rqLoadings['hold'] ? (
          <View className='mb-2.5 h-16.25'>
            <RnText small white center>
              {intl`CALL IS ON HOLD`}
            </RnText>
          </View>
        ) : (
          <View className='z-12 mb-2.5 flex-row items-center justify-center self-stretch'>
            {incoming && isVisible() && <IncomingItemWithTimer />}
            {incoming && (
              <ButtonIcon
                className='bg-primary text-white'
                noborder
                onPress={() => c.answer({ ignoreNav: true })}
                path={mdiPhone}
                size={40}
              />
            )}
            {incoming && (
              <View className={isHangupBtnHidden ? 'w-0' : 'w-25'} />
            )}
            {!isHangupBtnHidden && (
              <ButtonIcon
                className='bg-error text-white'
                noborder
                onPress={c.hangupWithUnhold}
                path={mdiPhoneHangup}
                size={40}
              />
            )}
          </View>
        )}
      </View>
    )
  }

  const renderCall = () => {
    // render PageCallTransferAttend as a layer instead
    // so switching will not cause the avatar to reload
    const renderTransferring = () => (
      <View className='bg-background absolute inset-0 z-101 items-center justify-center'>
        <PageCallTransferAttend />
      </View>
    )
    if (hasJavaPn) {
      if (c.transferring) {
        return renderTransferring()
      }
      return (
        <View className='bg-background absolute inset-0 z-101 items-center justify-center'>
          <RnActivityIndicator
            size='large'
            className='text-foreground h-10 w-10'
          />
        </View>
      )
    }
    return (
      <>
        {c.localVideoEnabled && renderVideo()}
        {renderAvatar()}
        {/* Push the buttons down to the lower-middle while the name stays
            pinned under the header (renderVideo's fixed top gap). */}
        {c.localVideoEnabled && <View className='flex-1' />}
        {renderBtns()}
        {/* Clear the bottom-left PIP (fixed 214px) so the buttons never overlap it;
            the min-h floor stays >= the PIP height even when shrunk on short
            screens. With no PIP yet (dialing) reserve only enough to clear the
            hangup, so the buttons sit low like a voice call. */}
        {c.localVideoEnabled && (
          <View
            className={
              c.localStreamObject
                ? 'min-h-54 shrink basis-56'
                : 'shrink basis-24'
            }
          />
        )}
        {renderHangupBtn()}
        {c.transferring ? renderTransferring() : null}
      </>
    )
  }

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
    <BrekekeGradient
      white={c.localVideoEnabled}
      className={!isVisible() && 'absolute -top-full -left-full h-full w-full'}
    >
      <Layout
        compact
        dropdown={
          c.localVideoEnabled && !c.transferring
            ? [
                {
                  label: showButtonsInVideoCall
                    ? intl`Hide call menu buttons`
                    : intl`Show call menu buttons`,
                  onPress: toggleButtons,
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
          className={
            c.localVideoEnabled && !c.transferring
              ? 'absolute h-full w-full flex-col items-center justify-start'
              : 'flex-1 flex-col items-center justify-start'
          }
        >
          {renderCall()}
        </View>
      </Layout>
    </BrekekeGradient>
  )
})
