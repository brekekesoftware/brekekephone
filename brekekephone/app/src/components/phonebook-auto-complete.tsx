import { ScrollView } from '@rntwsc/rn/core/components/scroll-view'
import { View } from '@rntwsc/rn/core/components/view'
import type { ClassName } from '@rntwsc/rn/core/tw/class-name'
import { isWeb } from '@rntwsc/rn/core/utils/platform'
import type { FC } from 'react'
import { useEffect, useState } from 'react'

import type { PbxBook } from '#/brekekejs'
import { RnText } from '#/components/rn-text'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { ctx } from '#/stores/ctx'

export const PhonebookAutoComplete: FC<
  Partial<{
    className?: ClassName
    // onCreateBtnPress(): void
    // label: string
    value: string
    layout?: Object
    // textInputStyle?: TextInputProps['style']
    onPressItem(item: PbxBook): void
  }>
> = p0 => {
  const { value, onPressItem, className } = p0
  const [isChoose, setChoose] = useState(false)

  useEffect(() => {
    ctx.contact.loadPbxBoook()
    setChoose(false)
  }, [value])

  const getData = () => {
    if (!ctx.contact.pbxBooks.length) {
      return []
    }
    if (!value) {
      return [...ctx.contact.pbxBooks]
    }
    const result = ctx.contact.pbxBooks.filter(item =>
      // make same web search
      item.phonebook.toLowerCase().startsWith(value.toLowerCase()),
    )
    if (
      !result.length ||
      (result.length === 1 && value === result[0].phonebook)
    ) {
      return []
    }
    return result
  }
  const result = [...getData()]

  if (!result.length || isChoose === true) {
    return null
  }
  return (
    <View
      className={[
        'bg-muted border-border shadow-border android:elevation-10 ios:shadow-opacity-45 ios:shadow-radius-[5px] ios:shadow-offset-[5px]/[10px] rounded-b-card absolute top-47 right-3.75 left-3.75 z-100000 overflow-hidden border',
        isWeb &&
          'shadow-opacity-100 shadow-radius-[10px] shadow-offset-[0px]/[0px]',
        className,
      ]}
    >
      <ScrollView
        className='max-h-75'
        keyboardShouldPersistTaps='always'
        nestedScrollEnabled
      >
        {result.map((item, index) => (
          <RnTouchableOpacity
            key={index}
            className={[
              'border-border w-full border-b px-3.75 py-2.5',
              index + 1 === result.length && 'border-b-0',
            ]}
            onPress={() => {
              setChoose(true)
              onPressItem?.(item)
            }}
          >
            <RnText singleLine>{item.phonebook}</RnText>
          </RnTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
