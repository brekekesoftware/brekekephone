import { observer } from 'mobx-react'
import type { FC } from 'react'
import { useCallback } from 'react'

import { View } from '@/rn/core/components/view'
import { tw } from '@/rn/core/tw/tw'
import { mdiClose } from '#/assets/icons'
import type { Conference } from '#/brekekejs'
import { Constants } from '#/brekekejs/ucclient'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { Duration } from '#/stores/timer-store'

// Reused class strings
const textColClassName = tw`min-w-20 py-2.5 pr-1.25 pl-2.5`
const btnBaseClassName = tw`my-1.25 min-w-20 items-center justify-center rounded px-2.5 py-1.25`

export const WebchatItem: FC<{
  data: Conference
}> = observer(({ data }) => {
  const messages = ctx.chat.getMessagesByThreadId(data.conf_id)
  const isEnabledAnswer =
    data.conf_status === Constants.CONF_STATUS_INVITED_WEBCHAT
  const isEnabledJoin = data.conf_status === Constants.CONF_STATUS_INVITED
  const isDisplayClose = data.conf_status === Constants.CONF_STATUS_INACTIVE
  const isDisplayShow = data.conf_status === Constants.CONF_STATUS_JOINED
  const textDisplay = messages.slice(Math.max(messages.length - 5, 0))

  const answerPress = useCallback(() => {
    ctx.uc.answerWebchatConference(data.conf_id)
    ctx.nav.goToPageChatGroupDetail({ groupId: data.conf_id })
  }, [data.conf_id])

  const showPress = useCallback(() => {
    ctx.nav.goToPageChatGroupDetail({ groupId: data.conf_id })
  }, [data.conf_id])

  const joinPress = useCallback(() => {
    ctx.uc.joinWebchatConference(data.conf_id)
    ctx.nav.goToPageChatGroupDetail({ groupId: data.conf_id })
  }, [data.conf_id])

  const closePress = useCallback(() => {
    ctx.chat.removeWebchatItem(data.conf_id)
  }, [data.conf_id])

  return (
    <View
      className={[
        'border-border flex-row items-center border-b-[0.5px] px-1.25',
        isEnabledAnswer && 'bg-primary-100',
      ]}
    >
      <View className='p-1.25'>
        {isEnabledAnswer ? (
          <RnTouchableOpacity
            onPress={answerPress}
            className={[btnBaseClassName, 'bg-primary']}
          >
            <RnText normal white bold>
              {intl`Answer`}
            </RnText>
          </RnTouchableOpacity>
        ) : (
          <RnTouchableOpacity
            onPress={showPress}
            className={[
              btnBaseClassName,
              isDisplayShow ? 'bg-black/80' : 'bg-border',
            ]}
          >
            <RnText normal white bold>
              {intl`Show`}
            </RnText>
          </RnTouchableOpacity>
        )}
        <RnTouchableOpacity
          disabled={!isEnabledJoin}
          onPress={joinPress}
          className={[
            btnBaseClassName,
            isEnabledJoin ? 'bg-black/80' : 'bg-border',
          ]}
        >
          <RnText normal white bold>
            {intl`Join`}
          </RnText>
        </RnTouchableOpacity>
      </View>
      {!isEnabledAnswer ? (
        <RnText normal singleLine small className={textColClassName}>
          {data.assigned.user_id || ''}
        </RnText>
      ) : (
        <Duration
          normal
          singleLine
          small
          className='min-w-20 px-1.25 py-2.5 pl-2.5'
        >
          {data.created_tstamp}
        </Duration>
      )}

      <RnText normal singleLine small className={textColClassName}>
        {data.webchatinfo.profinfo_formatted || ''}
      </RnText>
      <RnText
        normal
        small
        className={['flex-1', textColClassName]}
        // className='line-clamp-5'
      >
        {textDisplay.map(
          (text, i, { length }) =>
            `${text.text}${i === length - 1 ? '' : '\n'}`,
        )}
      </RnText>
      {isDisplayClose && (
        <RnTouchableOpacity onPress={closePress}>
          <RnIcon path={mdiClose} className='p-2.5' />
        </RnTouchableOpacity>
      )}
    </View>
  )
})
