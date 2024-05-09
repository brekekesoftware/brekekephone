import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Dimensions, Platform, StyleSheet, View } from 'react-native'

import { uc } from '../api/uc'
import { mdiCloseCircle } from '../assets/icons'
import type { ChatFile } from '../stores/chatStore'
import { intlDebug } from '../stores/intl'
import { RnAlert } from '../stores/RnAlert'
import { formatBytes } from '../utils/formatBytes'
import { RnIcon, RnImageVideoLoader, RnText } from './Rn'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const css = StyleSheet.create({
  vMessage: {
    marginBottom: 5,
    marginLeft: 10,
    ...Platform.select({
      web: {
        width: 'calc(100vw - 119px)' as any,
      },
      default: {
        width: Dimensions.get('screen').width - 119,
      },
    }),
  },
  textFileInfo: {
    color: v.colors.greyTextChat,
    fontSize: 13,
  },
  textFileInfoLineThrough: {
    color: v.colors.greyTextChat,
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  vHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export const ItemImageVideoChat: FC<ChatFile> = observer(p => {
  const displaySendTo =
    p.incoming || !p.target?.user_id ? '' : ` -> ${p.target?.user_id}`
  const isStopped = p.state === 'stopped'
  const isDisableCancel =
    isStopped || p.state === 'success' || p.state === 'failure'
  const styleText = !isStopped ? css.textFileInfo : css.textFileInfoLineThrough

  const onCancelFile = () => {
    uc.rejectFile(p).catch(onRejectFileFailure)
  }
  const onRejectFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject file`,
      err,
    })
  }
  return (
    <View>
      <View style={css.vMessage}>
        <RnText numberOfLines={2} style={styleText}>
          {p.name}
          {displaySendTo}
        </RnText>
        <View style={css.vHorizontal}>
          <RnText style={styleText}>
            {formatBytes(p?.size || 0, 2)}
            {` (${p.transferPercent}%) `}
          </RnText>
          {!isDisableCancel && (
            <RnTouchableOpacity onPress={onCancelFile}>
              <RnIcon path={mdiCloseCircle} color='black' size={13} />
            </RnTouchableOpacity>
          )}
        </View>
        {<RnImageVideoLoader {...p} />}
      </View>
    </View>
  )
})
