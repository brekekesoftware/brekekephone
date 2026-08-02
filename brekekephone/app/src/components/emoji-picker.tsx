import type { FC } from 'react'
import { useState } from 'react'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { emojiGroups, toEmoji } from '@/components/emoji-data'
import { RnText, RnTouchableOpacity } from '@/components/rn'

export const EmojiPicker: FC<{ onSelect(emoji: string): void }> = ({
  onSelect,
}) => {
  const [activeKey, setActiveKey] = useState(emojiGroups[0].key)
  const activeGroup =
    emojiGroups.find(g => g.key === activeKey) || emojiGroups[0]
  return (
    <View className='bg-background border-border h-full border-t'>
      <View className='border-border h-11 flex-row border-b'>
        {emojiGroups.map(g => (
          <RnTouchableOpacity
            key={g.key}
            onPress={() => setActiveKey(g.key)}
            className={[
              'flex-1 items-center justify-center',
              g.key === activeKey && 'bg-muted',
            ]}
          >
            <RnText className='text-xl'>{toEmoji(g.tabCodePoint)}</RnText>
          </RnTouchableOpacity>
        ))}
      </View>
      <ScrollView
        className='flex-1'
        contentContainerClassName='flex-row flex-wrap py-1'
        keyboardShouldPersistTaps='always'
      >
        {activeGroup.codePoints.map((cp, i) => (
          <RnTouchableOpacity
            key={`${cp}-${i}`}
            onPress={() => onSelect(toEmoji(cp))}
            className='w-[12.5%] items-center justify-center py-1.5'
          >
            <RnText className='text-2xl'>{toEmoji(cp)}</RnText>
          </RnTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
