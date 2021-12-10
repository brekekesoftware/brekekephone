import { observer } from 'mobx-react'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

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
} from '../assets/icons'
import { callStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
import { RnStacker } from '../stores/RnStacker'
import { Duration } from '../stores/timerStore'
import { ButtonIcon } from './ButtonIcon'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

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
  const c = callStore.getCurrentCall()
  if (
    RnStacker.stacks.some(t => t.name === 'PageCallManage') ||
    !c ||
    (c.incoming && !c.answered)
  ) {
    return null
  }
  return (
    <View style={css.CallBar}>
      <RnTouchableOpacity
        onPress={() => Nav().goToPageCallManage({ isFromCallBar: true })}
        style={css.CallBar_Outer}
      >
        <View style={css.CallBar_Icon}>
          <RnIcon
            color={c.incoming ? v.colors.primary : v.colors.warning}
            path={c.incoming ? mdiPhoneInTalkOutline : mdiPhoneOutgoingOutline}
          />
        </View>
        <View style={css.CallBar_Info}>
          <RnText style={css.Notify_Info_PartyName}>{c.computedName}</RnText>
          <RnText>
            {c.answered ? (
              <Duration>{c.answeredAt}</Duration>
            ) : (
              intl`Dialing...`
            )}
          </RnText>
        </View>

        <View style={css.CallBar_BtnCall}>
          {!c.holding && (
            <>
              <ButtonIcon
                bdcolor={v.borderBg}
                color={v.colors.danger}
                onPress={c.hangupWithUnhold}
                path={mdiPhoneHangup}
              />
              {c.answered && (
                <>
                  <ButtonIcon
                    bdcolor={v.borderBg}
                    color={c.muted ? v.colors.primary : v.color}
                    onPress={() => c.toggleMuted()}
                    path={c.muted ? mdiMicrophoneOff : mdiMicrophone}
                  />
                  {Platform.OS !== 'web' && (
                    <ButtonIcon
                      bdcolor={v.borderBg}
                      color={
                        callStore.isLoudSpeakerEnabled
                          ? v.colors.primary
                          : v.color
                      }
                      onPress={callStore.toggleLoudSpeaker}
                      path={
                        callStore.isLoudSpeakerEnabled
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
            color={c.holding ? v.colors.primary : v.color}
            onPress={c.toggleHoldWithCheck}
            path={c.holding ? mdiPlay : mdiPause}
          />
        </View>
      </RnTouchableOpacity>
    </View>
  )
})
