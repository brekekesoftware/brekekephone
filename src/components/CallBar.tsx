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
} from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import callStore from '../stores/callStore'
import intl from '../stores/intl'
import Nav from '../stores/Nav'
import RnStacker from '../stores/RnStacker'
import formatDuration from '../utils/formatDuration'
import ButtonIcon from './ButtonIcon'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import g from './variables'

const css = StyleSheet.create({
  CallBar: {
    borderBottomWidth: 1,
    borderColor: g.borderBg,
    backgroundColor: g.hoverBg,
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

@observer
class CallBar extends React.Component {
  render() {
    const bVisible =
      RnStacker.stacks.filter(t => t.name === 'PageCallManage').length === 0
    const c = callStore.currentCall
    if (!bVisible || !c || (c.incoming && !c.answered)) {
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
              color={c.incoming ? g.colors.primary : g.colors.warning}
              path={
                c.incoming ? mdiPhoneInTalkOutline : mdiPhoneOutgoingOutline
              }
            />
          </View>
          <View style={css.CallBar_Info}>
            <RnText style={css.Notify_Info_PartyName}>{c.title}</RnText>
            <RnText>
              {c.answered ? formatDuration(c.duration) : intl`Dialing...`}
            </RnText>
          </View>

          <View style={css.CallBar_BtnCall}>
            {!c.holding && (
              <>
                <ButtonIcon
                  bdcolor={g.borderBg}
                  color={g.colors.danger}
                  onPress={c.hangup}
                  path={mdiPhoneHangup}
                />
                {c.answered && (
                  <>
                    <ButtonIcon
                      bdcolor={g.borderBg}
                      color={c.muted ? g.colors.primary : g.color}
                      onPress={() => c.toggleMuted()}
                      path={c.muted ? mdiMicrophoneOff : mdiMicrophone}
                    />
                    {Platform.OS !== 'web' && (
                      <ButtonIcon
                        bdcolor={g.borderBg}
                        color={
                          callStore.isLoudSpeakerEnabled
                            ? g.colors.primary
                            : g.color
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
              bdcolor={g.borderBg}
              color={c.holding ? g.colors.primary : g.color}
              onPress={() => c.toggleHold()}
              path={c.holding ? mdiPlay : mdiPause}
            />
          </View>
        </RnTouchableOpacity>
      </View>
    )
  }
}

export default CallBar
