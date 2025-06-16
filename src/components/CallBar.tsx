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
} from '../assets/icons'
import { isWeb } from '../config'
import { getCallStore } from '../stores/callStore'
import { intl } from '../stores/intl'
import { Nav } from '../stores/Nav'
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
  const s = getCallStore()
  const oc = s.getOngoingCall()
  if (s.inPageCallManage || !oc || (oc.incoming && !oc.answered)) {
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
                        getCallStore().isLoudSpeakerEnabled
                          ? v.colors.primary
                          : v.color
                      }
                      onPress={getCallStore().toggleLoudSpeaker}
                      path={
                        getCallStore().isLoudSpeakerEnabled
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
