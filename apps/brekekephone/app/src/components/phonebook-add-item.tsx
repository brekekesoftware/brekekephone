import { observer } from 'mobx-react'
import { useRef, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'

import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { isAndroid } from '@/rn/core/utils/platform'
import { RnText, RnTextInput, RnTouchableOpacity } from '#/components/rn'
import { AnimatedView } from '#/components/rn-animated'
import type { ItemPBForm, PickerItemOption } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnKeyboard } from '#/stores/rn-keyboard'
import { useAnimationOnDidMount } from '#/utils/animation'

// BUG-1220: lift modal above IME on android 15+ where window doesn't shrink
const shouldApplyKbPadding = isAndroid && Number(Platform.Version) >= 35

const RNPickerInput = observer(({ onSelect, listOption }: PickerItemOption) => {
  const refInput = useRef(null)
  const [items, updateItems] = useState(listOption)
  const [value, updateValue] = useState('')
  const { height } = useWindowDimensions()
  const backdropCss = useAnimationOnDidMount({ opacity: [0, 1] })
  const y = useAnimationOnDidMount({
    translateY: [height, 0],
  })
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
      className='w-full border-b-[0.5px] border-[grey] py-1.25'
      onPress={() => onPressItem(item)}
    >
      <RnText className='mx-2.5 w-full text-left'>{item.label}</RnText>
    </RnTouchableOpacity>
  )
  return (
    <View className='absolute inset-0 flex-col items-center justify-center'>
      <AnimatedView
        className='bg-modal-overlay absolute inset-0'
        style={{ opacity: backdropCss.opacity }}
      >
        <RnTouchableOpacity
          onPress={ctx.contact.dismissPicker}
          className='absolute inset-0'
        />
      </AnimatedView>
      <AnimatedView
        className='absolute max-h-full w-[90%] max-w-95'
        style={{
          transform: [y],

          // keyboard lift (android 15+ only) uses the live IME height -> runtime
          // arbitrary class; everywhere else it stays the static 15px bottom.
          bottom:
            15 +
            (shouldApplyKbPadding && RnKeyboard.isKeyboardShowing
              ? RnKeyboard.keyboardHeight
              : 0),
        }}
      >
        <View className='bg-background h-[33.333vh] w-full items-center justify-start overflow-hidden rounded-[3px] px-2.5 py-2.5'>
          <RnTextInput
            // blurOnSubmit
            keyboardType='default'
            //  multiline
            onChangeText={onChangeText}
            autoFocus
            //  onSelectionChange={p.selectionChange}
            placeholder={intl`Enter field`}
            ref={refInput}
            className='bg-background border-border web:py-1.25 h-10 w-full overflow-hidden rounded-[3px] border-[0.8px] px-2.5'
            value={value}
          />
          <ScrollView
            className='w-full'
            keyboardShouldPersistTaps='always'
            keyboardDismissMode='on-drag'
          >
            {items?.map(renderItem)}
          </ScrollView>
        </View>
        <View className='flex-row items-center justify-between'>
          <RnTouchableOpacity
            onPress={() => onSelect(value)}
            className='bg-primary mt-3.75 mr-2.5 flex-1 items-center justify-center rounded-[3px] py-2.5'
          >
            <RnText bold white>
              OK
            </RnText>
          </RnTouchableOpacity>
          <RnTouchableOpacity
            onPress={ctx.contact.dismissPicker}
            className='bg-background mt-3.75 ml-2.5 flex-1 items-center justify-center rounded-[3px] py-2.5'
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
