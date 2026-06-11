import { View } from '@rntwsc/rn/core/components/view'
import { observer } from 'mobx-react'
import type { FC } from 'react'

import { mdiCloseCircle } from '#/assets/icons'
import { RnIcon, RnImageVideoLoader, RnText } from '#/components/rn'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import type { ChatFile } from '#/stores/chat-store'
import { ctx } from '#/stores/ctx'
import { intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { formatBytes } from '#/utils/format-bytes'

export const ItemImageVideoChat: FC<ChatFile> = observer(p => {
  const displaySendTo =
    p.incoming || !p.target?.user_id ? '' : ` -> ${p.target?.user_id}`
  const isStopped = p.state === 'stopped'
  const isDisableCancel =
    isStopped || p.state === 'success' || p.state === 'failure'

  const onCancelFile = () => {
    ctx.uc.rejectFile(p).catch(onRejectFileFailure)
  }
  const onRejectFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject file`,
      err,
    })
  }
  return (
    <View>
      <View className='mb-1.25 ml-2.5 w-[calc(100vw-119px)]'>
        <RnText
          className={[
            'line-clamp-2 text-[13px]',
            isStopped
              ? 'text-foreground-subtle line-through'
              : 'text-foreground',
          ]}
        >
          {p.name}
          {displaySendTo}
        </RnText>
        <View className='flex-row items-center'>
          <RnText className='text-foreground-subtle text-[13px]'>
            {formatBytes(p?.size || 0, 2)}
            {` (${p.transferPercent}%) `}
          </RnText>
          {!isDisableCancel && (
            <RnTouchableOpacity onPress={onCancelFile}>
              <RnIcon
                path={mdiCloseCircle}
                className='text-foreground'
                size={13}
              />
            </RnTouchableOpacity>
          )}
        </View>
        <RnImageVideoLoader {...p} />
      </View>
    </View>
  )
})
