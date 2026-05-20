import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'

import { Text } from '@/rn/components/text'
import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import type { PbxBook } from '#/brekekejs'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { isWeb } from '#/config'
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
        'absolute rounded-[5px] bg-background py-1.25 px-2.5 max-h-75 top-47 z-100000 left-3.75 right-3.75',
        'shadow-border android:elevation-10 ios:shadow-opacity-45 ios:shadow-radius-[5px] ios:shadow-offset-[5px]/[10px]',
        isWeb && 'shadow-opacity-100 shadow-radius-[10px] shadow-offset-[0px]/[0px]',
        className,
      ]}
    >
      <ScrollView>
        {result.map((item, index) => (
          <RnTouchableOpacity
            key={index}
            className='w-full py-1.25 border-b-[0.5px] border-[grey]'
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
