import type { FC } from 'react'
import { useEffect, useState } from 'react'
import type { TouchableOpacityProps } from 'react-native'
import { Dimensions, Platform, ScrollView } from 'react-native'

import { Text } from '@/rn/components/text'
import { View } from '@/rn/core/components/view'
import type { PbxBook } from '#/brekekejs'
import { RnTouchableOpacity } from '#/components/rn-touchable-opacity'
import { v } from '#/components/variables'
import { ctx } from '#/stores/ctx'

const css = {
  viewFlatList: {
    width: Dimensions.get('screen').width - 30,
    ...Platform.select({
      ios: {
        shadowColor: v.borderBg,
        shadowOpacity: 0.45,
        shadowRadius: 5,
        shadowOffset: {
          width: 5,
          height: 10,
        },
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: `${0}px ${0}px ${10}px ${v.borderBg}`,
      },
    }),
  },
}

export const PhonebookAutoComplete: FC<
  Partial<{
    style?: TouchableOpacityProps['style']
    // onCreateBtnPress(): void
    // label: string
    value: string
    layout?: Object
    // textInputStyle?: TextInputProps['style']
    onPressItem(item: PbxBook): void
  }>
> = p0 => {
  const { value, onPressItem } = p0
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
      style={css.viewFlatList}
      className='absolute rounded-[5px] bg-background py-1.25 px-2.5 max-h-75 top-47 z-100000 mx-3.75'
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
