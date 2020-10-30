import { mdiClose, mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js'
import { observer } from 'mobx-react'
import React from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import g from '../global'
import Picker, { PickerOption } from '../global/Picker'
import intl from '../intl/intl'
import { RnIcon, RnText, RnTouchableOpacity } from '../Rn'
import { useAnimationOnDidMount } from '../utils/animation'

const css = StyleSheet.create({
  Picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Picker_Backdrop: {
    backgroundColor: g.layerBg,
  },
  Picker_Inner: {
    position: 'absolute',
    bottom: 15,
    width: '90%',
    maxWidth: g.maxModalWidth,
    maxHeight: '100%',
  },
  Picker_Options: {
    borderRadius: g.borderRadius,
    backgroundColor: g.bg,
    overflow: 'hidden',
  },
  Picker_Option: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: g.hoverBg,
  },
  Picker_Option__last: {
    borderBottomWidth: 0,
  },
  Picker_Option__selected: {
    backgroundColor: g.hoverBg,
  },
  Picker_Option__cancel: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderRadius: g.borderRadius,
    backgroundColor: g.bg,
  },
  Picker_Text__selected: {
    fontWeight: 'bold',
    color: g.colors.primary,
  },
  Picker_Text__cancel: {
    fontWeight: 'bold',
    color: g.colors.danger,
  },
  Picker_Icon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
})

const PickerR = (p: PickerOption) => {
  const backdropCss = useAnimationOnDidMount({
    opacity: [0, 1],
  })
  const y = useAnimationOnDidMount({
    translateY: [Dimensions.get('screen').height, 0],
  })
  return (
    <View style={[StyleSheet.absoluteFill, css.Picker]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, css.Picker_Backdrop, backdropCss]}
      >
        <RnTouchableOpacity
          onPress={Picker.dismiss}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.ScrollView style={[css.Picker_Inner, { transform: [y] }]}>
        <View style={css.Picker_Options}>
          {p.options.map((o, i) => {
            const isSelected = `${p.selectedKey}` === `${o.key}`
            return (
              <RnTouchableOpacity
                key={i}
                onPress={() => {
                  p.onSelect(o.key)
                  Picker.dismiss()
                }}
                style={[
                  css.Picker_Option,
                  i + 1 === p.options.length && css.Picker_Option__last,
                  isSelected && css.Picker_Option__selected,
                ]}
              >
                <RnText style={isSelected && css.Picker_Text__selected}>
                  {o.label}
                </RnText>
                <RnIcon
                  color={isSelected ? g.colors.primary : null}
                  path={
                    o.icon ||
                    (isSelected ? mdiRadioboxMarked : mdiRadioboxBlank)
                  }
                  style={css.Picker_Icon}
                />
              </RnTouchableOpacity>
            )
          })}
        </View>
        <RnTouchableOpacity
          onPress={Picker.dismiss}
          style={[css.Picker_Option, css.Picker_Option__cancel]}
        >
          <RnText style={css.Picker_Text__cancel}>
            {p.cancelLabel || intl`Cancel`}
          </RnText>
          <RnIcon
            color={g.colors.danger}
            path={mdiClose}
            style={css.Picker_Icon}
          />
        </RnTouchableOpacity>
      </Animated.ScrollView>
    </View>
  )
}

const RootPicker = observer(
  () => Picker.currentPicker && <PickerR {...Picker.currentPicker} />,
)

export default RootPicker
