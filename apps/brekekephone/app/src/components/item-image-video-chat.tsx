import { observer } from 'mobx-react'
import type { FC } from 'react'

import { View } from '@/rn/core/components/view'
import { tw } from '@/rn/core/tw/tw'
import { mdiCloseCircle } from '#/assets/icons'
import { RnIcon, RnImageVideoLoader, RnText } from '#/components/rn'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import type { ChatFile } from '#/stores/chat-store'
import { ctx } from '#/stores/ctx'
import { intlDebug } from '#/stores/intl'
import { RnAlert } from '#/stores/rn-alert'
import { formatBytes } from '#/utils/format-bytes'

// calc(100vw-…) resolves on native too via the framework's runtime vw support.
const vMessageWidthClassName = tw`w-[calc(100vw-119px)]`

export const ItemImageVideoChat: FC<ChatFile> = observer(p => {
  const displaySendTo =
    p.incoming || !p.target?.user_id ? '' : ` -> ${p.target?.user_id}`
  const isStopped = p.state === 'stopped'
  const isDisableCancel =
    isStopped || p.state === 'success' || p.state === 'failure'
  const textClass = isStopped
    ? 'text-foreground-subtle text-[13px] line-through'
    : 'text-foreground text-[13px]'

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
