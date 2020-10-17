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

import g from '../global'
import callStore from '../global/callStore'
import intl from '../intl/intl'
import { Icon, Platform, StyleSheet, Text, TouchableOpacity, View } from '../Rn'
import ButtonIcon from '../shared/ButtonIcon'
import formatDuration from '../utils/formatDuration'

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
      g.stacks.filter(t => t.name === 'PageCallManage').length === 0
    const c = callStore.currentCall
    if (!bVisible || !c || (c.incoming && !c.answered)) {
      return null
    }
    return (
      <View style={css.CallBar}>
        <TouchableOpacity
          onPress={() => g.goToPageCallManage({ isFromCallBar: true })}
          style={css.CallBar_Outer}
        >
          <View style={css.CallBar_Icon}>
            <Icon
              color={c.incoming ? g.colors.primary : g.colors.warning}
              path={
                c.incoming ? mdiPhoneInTalkOutline : mdiPhoneOutgoingOutline
              }
            />
          </View>
          <View style={css.CallBar_Info}>
            <Text style={css.Notify_Info_PartyName}>{c.title}</Text>
            <Text>
              {c.answered ? formatDuration(c.duration) : intl`Dialing...`}
            </Text>
          </View>

          <View style={css.CallBar_BtnCall}>
            {!c.holding && (
              <React.Fragment>
                <ButtonIcon
                  bdcolor={g.borderBg}
                  color={g.colors.danger}
                  onPress={c.hangup}
                  path={mdiPhoneHangup}
                />
                {c.answered && (
                  <React.Fragment>
                    <ButtonIcon
                      bdcolor={g.borderBg}
                      color={c.muted ? g.colors.primary : g.color}
                      onPress={c.toggleMuted}
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
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
            <ButtonIcon
              bdcolor={g.borderBg}
              color={c.holding ? g.colors.primary : g.color}
              onPress={c.toggleHold}
              path={c.holding ? mdiPlay : mdiPause}
            />
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

export default CallBar
