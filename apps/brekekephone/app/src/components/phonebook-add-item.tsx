import { observer } from 'mobx-react'
import { useRef, useState } from 'react'
import { Animated, Dimensions, Platform, ScrollView } from 'react-native'

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

const css = {
  itemPb: {
    width: '100%',
    paddingVertical: 5,
    borderBottomColor: 'grey',
    borderBottomWidth: 0.5,
  },
  RnPicker_Options: {
    borderRadius: v.borderRadius,
    backgroundColor: v.bg,
    overflow: 'hidden',
    height: Dimensions.get('screen').height / 3,
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  RnPicker_Option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: v.hoverBg,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  RnPicker_Option__cancel: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderRadius: v.borderRadius,
    backgroundColor: v.bg,
    marginLeft: 10,
  },
  RnPicker_Option__OK: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderRadius: v.borderRadius,
    marginRight: 10,
    backgroundColor: v.colors.primary,
  },
  RnPicker_Text__Ok: {
    fontWeight: 'bold',
    color: 'white',
  },
  RnPicker_Text__cancel: {
    fontWeight: 'bold',
    color: v.layerBg,
  },
  inputFieldName: {
    backgroundColor: 'white',
    height: 40,
    width: '100%',
    borderRadius: v.borderRadius,
    borderWidth: 0.8,
    borderColor: v.borderBg,
    paddingHorizontal: 10,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        paddingVertical: 5,
      },
    }),
  },
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
      style={css.itemPb}
      onPress={() => onPressItem(item)}
    >
      <RnText className='mx-2.5 w-full text-left'>{item.label}</RnText>
    </RnTouchableOpacity>
  )
  return (
    <View className='absolute inset-0 flex-col items-center justify-center'>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: v.layerBg,
          opacity: backdropCss.opacity,
        }}
      >
        <RnTouchableOpacity
          onPress={ctx.contact.dismissPicker}
          className='absolute inset-0'
        />
      </Animated.View>
      <Animated.View
        style={{
          position: 'absolute',
          bottom: innerBottom,
          width: '90%',
          maxWidth: v.maxModalWidth,
          maxHeight: '100%',
          transform: [y],
        }}
      >
        <View style={css.RnPicker_Options}>
          <RnTextInput
            // blurOnSubmit
            keyboardType='default'
            //  multiline
            onChangeText={onChangeText}
            autoFocus
            //  onSelectionChange={p.selectionChange}
            placeholder={intl`Enter field`}
            ref={refInput}
            style={css.inputFieldName}
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
            style={[css.RnPicker_Option, css.RnPicker_Option__OK]}
          >
            <RnText style={css.RnPicker_Text__Ok}>OK</RnText>
          </RnTouchableOpacity>
          <RnTouchableOpacity
            onPress={ctx.contact.dismissPicker}
            style={[css.RnPicker_Option, css.RnPicker_Option__cancel]}
          >
            <RnText style={css.RnPicker_Text__cancel}>{intl`Cancel`}</RnText>
          </RnTouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
})
export const PhonebookAddItem = observer(
  () =>
    ctx.contact.showPickerItem && (
      <RNPickerInput {...ctx.contact.showPickerItem} />
    ),
)
