import { observer } from 'mobx-react'

import { View } from '@/rn/core/components/view'
import { isWeb } from '@/rn/core/utils/platform'
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
import { defaultTimeout } from '#/config'
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
            className={oc.incoming ? 'text-primary' : 'text-warning'}
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
                className='border-border text-error'
                onPress={oc.hangupWithUnhold}
                path={mdiPhoneHangup}
              />
              {oc.answered && (
                <>
                  <ButtonIcon
                    className={[
                      'border-border',
                      oc.muted ? 'text-primary' : 'text-foreground',
                    ]}
                    onPress={() => oc.toggleMuted()}
                    path={oc.muted ? mdiMicrophoneOff : mdiMicrophone}
                  />
                  {!isWeb && (
                    <ButtonIcon
                      className={[
                        'border-border',
                        ctx.call.isLoudSpeakerEnabled
                          ? 'text-primary'
                          : 'text-foreground',
                      ]}
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
            className={[
              'border-border',
              oc.holding ? 'text-primary' : 'text-foreground',
            ]}
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
