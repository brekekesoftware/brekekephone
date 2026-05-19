import { observer } from 'mobx-react'
import { useRef, useState } from 'react'
import { Dimensions, Platform, ScrollView } from 'react-native'

import { AnimatedView } from '@/rn/core/components/animated'
import { View } from '@/rn/core/components/view'
import { RnText, RnTextInput, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { isAndroid } from '#/config'
import type { ItemPBForm, PickerItemOption } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnKeyboard } from '#/stores/rn-keyboard'
import { useAnimationOnDidMount } from '#/utils/animation'

// BUG-1220: lift modal above IME on android 15+ where window doesn't shrink
const shouldApplyKbPadding = isAndroid && Number(Platform.Version) >= 35

const rnPickerOptionsStyle = {
  height: Dimensions.get('screen').height / 3,
} as const
const inputFieldNameStyle = {
  backgroundColor: 'white',
  height: 40,
  width: '100%' as const,
  borderRadius: v.borderRadius,
  borderWidth: 0.8,
  borderColor: v.borderBg,
  paddingHorizontal: 10,
  overflow: 'hidden' as const,
  ...Platform.select({
    web: {
      paddingVertical: 5,
    },
  }),
} as const

const RNPickerInput = observer(({ onSelect, listOption }: PickerItemOption) => {
  const refInput = useRef(null)
  const [items, updateItems] = useState(listOption)
  const [value, updateValue] = useState('')
  const backdropCss = useAnimationOnDidMount({
    opacity: [0, 1],
  })
  const y = useAnimationOnDidMount({
    translateY: [Dimensions.get('screen').height, 0],
  })
  const innerBottom =
    shouldApplyKbPadding && RnKeyboard.isKeyboardShowing
      ? 15 + RnKeyboard.keyboardHeight
      : 15
  const onChangeText = (txt: string) => {
    if (!txt) {
      updateItems(listOption)
      updateValue(txt.trim())
      return
    }
    const newList = listOption.filter(item =>
      item.label.toLowerCase().startsWith(txt.toLowerCase()),
    )
    updateItems(newList)
    updateValue(txt)
  }
  const onPressItem = (item: ItemPBForm) => {
    updateValue(item.label.trim())
    updateItems([])
  }
  const renderItem = (item: ItemPBForm, index: number) => (
    <RnTouchableOpacity
      key={index}
      className='w-full py-1.25 border-b-[0.5px] border-[grey]'
      onPress={() => onPressItem(item)}
    >
      <RnText className='mx-2.5 w-full text-left'>{item.label}</RnText>
    </RnTouchableOpacity>
  )
  return (
    <View className='absolute inset-0 flex-col items-center justify-center'>
      <AnimatedView
        className='absolute inset-0 bg-modal-overlay'
        style={{ opacity: backdropCss.opacity }}
      >
        <RnTouchableOpacity
          onPress={ctx.contact.dismissPicker}
          className='absolute inset-0'
        />
      </AnimatedView>
      <AnimatedView
        className='absolute w-[90%] max-w-95 max-h-full'
        style={{
          bottom: innerBottom,
          transform: [y],
        }}
      >
        <View
          className='rounded-[3px] bg-background overflow-hidden w-full px-2.5 py-2.5 items-center justify-start'
          style={rnPickerOptionsStyle}
        >
          <RnTextInput
            // blurOnSubmit
            keyboardType='default'
            //  multiline
            onChangeText={onChangeText}
            autoFocus
            //  onSelectionChange={p.selectionChange}
            placeholder={intl`Enter field`}
            ref={refInput}
            style={inputFieldNameStyle}
            value={value}
          />
          <ScrollView
            style={{ width: '100%' }}
            keyboardShouldPersistTaps='always'
            keyboardDismissMode='on-drag'
          >
            {items?.map(renderItem)}
          </ScrollView>
        </View>
        <View className='flex-row items-center justify-between'>
          <RnTouchableOpacity
            onPress={() => onSelect(value)}
            className='py-2.5 flex-1 items-center justify-center mt-3.75 rounded-[3px] mr-2.5 bg-primary'
          >
            <RnText bold white>OK</RnText>
          </RnTouchableOpacity>
          <RnTouchableOpacity
            onPress={ctx.contact.dismissPicker}
            className='py-2.5 flex-1 items-center justify-center mt-3.75 rounded-[3px] bg-background ml-2.5'
          >
            <RnText bold className='text-foreground/80'>{intl`Cancel`}</RnText>
          </RnTouchableOpacity>
        </View>
      </AnimatedView>
    </View>
  )
})
export const PhonebookAddItem = observer(
  () =>
    ctx.contact.showPickerItem && (
      <RNPickerInput {...ctx.contact.showPickerItem} />
    ),
)
