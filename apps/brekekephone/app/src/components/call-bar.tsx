import { observer } from 'mobx-react'

import { View } from '@/rn/core/components/view'
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
import { ButtonIcon } from '#/components/button-icon'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { defaultTimeout, isWeb } from '#/config'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { Duration } from '#/stores/timer-store'

export const CallBar = observer(() => {
  const oc = ctx.call.getOngoingCall()
  if (ctx.call.inPageCallManage || !oc || (oc.incoming && !oc.answered)) {
    return null
  }
  return (
    <View className='border-border bg-muted border-b'>
      <RnTouchableOpacity
        onPress={() => ctx.nav.goToPageCallManage({ isFromCallBar: true })}
        className='flex-row items-center p-1.25'
      >
        <View className='flex-1'>
          <RnIcon
            color={oc.incoming ? v.colors.primary : v.colors.warning}
            path={oc.incoming ? mdiPhoneInTalkOutline : mdiPhoneOutgoingOutline}
          />
        </View>
        <View className='flex-2'>
          <RnText bold className='text-[15px]'>
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

        <View className='flex-5 flex-row justify-end'>
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
            msLoading={defaultTimeout}
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
