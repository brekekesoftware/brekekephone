import { observer } from 'mobx-react'
import { StyleSheet, View } from 'react-native'

import {
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPause,
  mdiPhoneHangup,
  mdiPhoneInTalkOutline,
  mdiPhoneOutgoingOutline,
  mdiPlay,
  mdiVolumeHigh,
  mdiVolumeMedium,
} from '#/assets/icons'
import { ButtonIcon } from '#/components/ButtonIcon'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { holdingTimeout, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { Duration } from '#/stores/timerStore'

const css = StyleSheet.create({
  CallBar: {
    borderBottomWidth: 1,
    borderColor: v.borderBg,
    backgroundColor: v.hoverBg,
  },
  CallBar_Outer: {
    flexDirection: 'row',
    padding: 5,
    alignItems: 'center',
  },
  CallBar_Icon: {
    flex: 1,
  },
  CallBar_Info: {
    flex: 2,
  },

  CallBar_BtnCall: {
    flex: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  Notify_Info_PartyName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
})

export const CallBar = observer(() => {
  const oc = ctx.call.getOngoingCall()
  if (ctx.call.inPageCallManage || !oc || (oc.incoming && !oc.answered)) {
    return null
  }
  return (
    <View style={css.CallBar}>
      <RnTouchableOpacity
        onPress={() => ctx.nav.goToPageCallManage({ isFromCallBar: true })}
        style={css.CallBar_Outer}
      >
        <View style={css.CallBar_Icon}>
          <RnIcon
            color={oc.incoming ? v.colors.primary : v.colors.warning}
            path={oc.incoming ? mdiPhoneInTalkOutline : mdiPhoneOutgoingOutline}
          />
        </View>
        <View style={css.CallBar_Info}>
          <RnText style={css.Notify_Info_PartyName}>
            {trimDisplayName(oc.getDisplayName())}
          </RnText>
          <RnText>
            {oc.answered ? (
              <Duration>{oc.answeredAt}</Duration>
            ) : (
              intl`Dialing...`
            )}
          </RnText>
        </View>

        <View style={css.CallBar_BtnCall}>
          {!oc.holding && (
            <>
              <ButtonIcon
                bdcolor={v.borderBg}
                color={v.colors.danger}
                onPress={oc.hangupWithUnhold}
                path={mdiPhoneHangup}
              />
              {oc.answered && (
                <>
                  <ButtonIcon
                    bdcolor={v.borderBg}
                    color={oc.muted ? v.colors.primary : v.color}
                    onPress={() => oc.toggleMuted()}
                    path={oc.muted ? mdiMicrophoneOff : mdiMicrophone}
                  />
                  {!isWeb && (
                    <ButtonIcon
                      bdcolor={v.borderBg}
                      color={
                        ctx.call.isLoudSpeakerEnabled
                          ? v.colors.primary
                          : v.color
                      }
                      onPress={ctx.call.toggleLoudSpeaker}
                      path={
                        ctx.call.isLoudSpeakerEnabled
                          ? mdiVolumeHigh
                          : mdiVolumeMedium
                      }
                    />
                  )}
                </>
              )}
            </>
          )}
          <ButtonIcon
            bdcolor={v.borderBg}
            color={oc.holding ? v.colors.primary : v.color}
            onPress={oc.toggleHoldWithCheck}
            path={oc.holding ? mdiPlay : mdiPause}
            loading={oc.rqLoadings['hold']}
            msLoading={holdingTimeout}
          />
        </View>
      </RnTouchableOpacity>
    </View>
  )
})

export const trimDisplayName = (n?: string) => {
  n = n || ''
  n = n.replace(/\s+/, ' ').trim()
  return n.length > 25 ? n.substring(0, 25) + '...' : n
}
