import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { Dimensions, Platform, StyleSheet, View } from 'react-native'

import { ChatFile } from '../stores/chatStore'
import { formatBytes } from '../utils/formatBytes'
import { RnImageLoader, RnText } from './Rn'
import g from './variables'

const css = StyleSheet.create({
  vMessage: {
    marginBottom: 5,
    marginLeft: 10,
    ...Platform.select({
      web: {
        width: 'calc(100vw - 119px)',
      },
      default: {
        width: Dimensions.get('screen').width - 119,
      },
    }),
  },
  textFileInfo: {
    color: g.colors.greyTextChat,
    fontSize: 13,
  },
  textFileInfoLineThrough: {
    color: g.colors.greyTextChat,
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
})

const ItemImageChat: FC<ChatFile> = observer(p => {
  const displaySendTo = p.incoming ? '' : ` -> ${p.target?.user_id}`
  const isStopped = p.state === 'stopped'
  const styleText = !isStopped ? css.textFileInfo : css.textFileInfoLineThrough
  return (
    <View>
      <View style={css.vMessage}>
        <RnText numberOfLines={2} style={styleText}>
          {p.name}
          {displaySendTo}
        </RnText>
        <RnText style={styleText}>
          {formatBytes(p?.size || 0, 2)}
          {` (${p.transferPercent}%)`}
        </RnText>
        {<RnImageLoader {...p} />}
      </View>
    </View>
  )
})

export default ItemImageChat
