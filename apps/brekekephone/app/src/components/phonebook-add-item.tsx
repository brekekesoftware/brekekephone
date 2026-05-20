import { observer } from 'mobx-react'
import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { RnText, RnTextInput, RnTouchableOpacity } from '#/components/rn'
import { AnimatedView } from '#/components/rn-animated'
import { isAndroid, isWeb } from '#/config'
import type { ItemPBForm, PickerItemOption } from '#/stores/contact-store'
import { ctx } from '#/stores/ctx'
import { intl } from '#/stores/intl'
import { RnKeyboard } from '#/stores/rn-keyboard'

// BUG-1220: lift modal above IME on android 15+ where window doesn't shrink
const shouldApplyKbPadding = isAndroid && Number(Platform.Version) >= 35

const inputFieldNameClassName = [
  'bg-background h-10 w-full rounded-[3px] border-[0.8px] border-border px-2.5 overflow-hidden',
  isWeb && 'py-1.25',
]

const RNPickerInput = observer(({ onSelect, listOption }: PickerItemOption) => {
  const refInput = useRef(null)
  const [items, updateItems] = useState(listOption)
  const [value, updateValue] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // keyboard lift (android 15+ only) uses the live IME height → runtime
  // arbitrary class; everywhere else it stays the static 15px bottom.
  const bottomCls =
    shouldApplyKbPadding && RnKeyboard.isKeyboardShowing
      ? `bottom-[${15 + RnKeyboard.keyboardHeight}px]`
      : 'bottom-3.75'
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
        className={[
          'absolute inset-0 bg-modal-overlay transition-opacity duration-150',
          mounted ? 'opacity-100' : 'opacity-0',
        ]}
      >
        <RnTouchableOpacity
          onPress={ctx.contact.dismissPicker}
          className='absolute inset-0'
        />
      </AnimatedView>
      <AnimatedView
        className={[
          'absolute w-[90%] max-w-95 max-h-full transition-transform duration-150',
          bottomCls,
          // slide-up only animates on web (native anim disabled); '100%' stays
          // web-side so it never reaches native transform (Android crash).
          isWeb && !mounted ? 'translate-y-full' : 'translate-y-0',
        ]}
      >
        <View className='rounded-[3px] bg-background overflow-hidden w-full px-2.5 py-2.5 items-center justify-start h-[33.333vh]'>
          <RnTextInput
            // blurOnSubmit
            keyboardType='default'
            //  multiline
            onChangeText={onChangeText}
            autoFocus
            //  onSelectionChange={p.selectionChange}
            placeholder={intl`Enter field`}
            ref={refInput}
            className={inputFieldNameClassName}
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
