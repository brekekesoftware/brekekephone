import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'

import { Text } from '@/rn/components/text'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { isWeb } from '@/rn/core/utils/platform'
import type { PbxBook } from '#/brekekejs'
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
        'bg-background shadow-border android:elevation-10 ios:shadow-opacity-45 ios:shadow-radius-[5px] ios:shadow-offset-[5px]/[10px] absolute top-47 right-3.75 left-3.75 z-100000 max-h-75 rounded-[5px] px-2.5 py-1.25',
        isWeb &&
          'shadow-opacity-100 shadow-radius-[10px] shadow-offset-[0px]/[0px]',
        className,
      ]}
    >
      <ScrollView>
        {result.map((item, index) => (
          <RnTouchableOpacity
            key={index}
            className='w-full border-b-[0.5px] border-[grey] py-1.25'
            onPress={() => {
              setChoose(true)
              onPressItem?.(item)
            }}
          >
            <Text className='mx-2.5 w-full text-left'>{item.phonebook}</Text>
          </RnTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
