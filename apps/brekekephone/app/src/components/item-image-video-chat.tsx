import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Dimensions } from 'react-native'

import { View } from '@/rn/core/components/view'
import { mdiCloseCircle } from '#/assets/icons'
import { RnIcon, RnImageVideoLoader, RnText } from '#/components/rn'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { isWeb } from '#/config'
import type { ChatFile } from '#/stores/chat-store'
import { ctx } from '#/stores/ctx'
import { intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { formatBytes } from '#/utils/format-bytes'

const vMessageWidthClassName = isWeb
  ? 'w-[calc(100vw-119px)]'
  : `w-[${Dimensions.get('screen').width - 119}px]`

export const ItemImageVideoChat: FC<ChatFile> = observer(p => {
  const displaySendTo =
    p.incoming || !p.target?.user_id ? '' : ` -> ${p.target?.user_id}`
  const isStopped = p.state === 'stopped'
  const isDisableCancel =
    isStopped || p.state === 'success' || p.state === 'failure'
  const textClass = isStopped
    ? 'text-[#9e9e9e] text-[13px] line-through'
    : 'text-[#9e9e9e] text-[13px]'

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
      <View className={['mb-1.25 ml-2.5', vMessageWidthClassName]}>
        <RnText className={['line-clamp-2', textClass]}>
          {p.name}
          {displaySendTo}
        </RnText>
        <View className='flex-row items-center'>
          <RnText className={textClass}>
            {formatBytes(p?.size || 0, 2)}
            {` (${p.transferPercent}%) `}
          </RnText>
          {!isDisableCancel && (
            <RnTouchableOpacity onPress={onCancelFile}>
              <RnIcon path={mdiCloseCircle} color='black' size={13} />
            </RnTouchableOpacity>
          )}
        </View>
        <RnImageVideoLoader {...p} />
      </View>
    </View>
  )
})
