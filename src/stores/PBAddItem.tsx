import { observer } from 'mobx-react'
import { useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { RnText, RnTextInput, RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'
import { useAnimationOnDidMount } from '../utils/animation'
import { contactStore, ItemPBForm, PickerItemOption } from './contactStore'
import { intl } from './intl'

const css = StyleSheet.create({
  vBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItem: {
    width: '100%',
  },
  txtPb: {
    width: '100%',
    textAlign: 'left',
    marginHorizontal: 10,
  },
  itemPb: {
    width: '100%',
    paddingVertical: 5,
    borderBottomColor: 'grey',
    borderBottomWidth: 0.5,
  },
  RnPicker: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  RnPicker_Backdrop: {
    backgroundColor: v.layerBg,
  },
  RnPicker_Inner: {
    position: 'absolute',
    bottom: 15,
    width: '90%',
    maxWidth: v.maxModalWidth,
    maxHeight: '100%',
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
  RnPicker_Option__last: {
    borderBottomWidth: 0,
  },
  RnPicker_Option__selected: {
    backgroundColor: v.hoverBg,
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
  RnPicker_Text__selected: {
    fontWeight: 'bold',
    color: v.colors.primary,
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
})

const RNPickerInput = ({ onSelect, listOption }: PickerItemOption) => {
  const refInput = useRef(null)
  const [items, updateItems] = useState(listOption)
  const [value, updateValue] = useState('')
  const backdropCss = useAnimationOnDidMount({
    opacity: [0, 1],
  })
  const y = useAnimationOnDidMount({
    translateY: [Dimensions.get('screen').height, 0],
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
  const renderItem = (item: ItemPBForm, index: number) => {
    return (
      <RnTouchableOpacity
        key={index}
        style={css.itemPb}
        onPress={() => onPressItem(item)}
      >
        <RnText style={css.txtPb}>{item.label}</RnText>
      </RnTouchableOpacity>
    )
  }
  return (
    <View style={[StyleSheet.absoluteFill, css.RnPicker]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, css.RnPicker_Backdrop, backdropCss]}
      >
        <RnTouchableOpacity
          onPress={contactStore.dismissPicker}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[css.RnPicker_Inner, { transform: [y] }]}>
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
            style={css.listItem}
            keyboardShouldPersistTaps='always'
            keyboardDismissMode='on-drag'
          >
            {items?.map(renderItem)}
          </ScrollView>
        </View>
        <View style={css.vBottom}>
          <RnTouchableOpacity
            onPress={() => onSelect(value)}
            style={[css.RnPicker_Option, css.RnPicker_Option__OK]}
          >
            <RnText style={css.RnPicker_Text__Ok}>{intl`Ok`}</RnText>
          </RnTouchableOpacity>
          <RnTouchableOpacity
            onPress={contactStore.dismissPicker}
            style={[css.RnPicker_Option, css.RnPicker_Option__cancel]}
          >
            <RnText style={css.RnPicker_Text__cancel}>{intl`Cancel`}</RnText>
          </RnTouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}
export const PBAddItem = observer(
  () =>
    contactStore.showPickerItem && (
      <RNPickerInput {...contactStore.showPickerItem} />
    ),
)
