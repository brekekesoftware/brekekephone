import { observer } from 'mobx-react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import { mdiClose, mdiRadioboxBlank, mdiRadioboxMarked } from '../assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '../components/Rn'
import { v } from '../components/variables'
import { useAnimationOnDidMount } from '../utils/animation'
import { intl } from './intl'
import { RnPicker, RnPickerOption } from './RnPicker'

const css = StyleSheet.create({
  RnPicker: {
    flexDirection: 'row',
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
  },
  RnPicker_Option: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: v.hoverBg,
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
  },
  RnPicker_Text__selected: {
    fontWeight: 'bold',
    color: v.colors.primary,
  },
  RnPicker_Text__cancel: {
    fontWeight: 'bold',
    color: v.colors.danger,
  },
  RnPicker_Icon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
})

const RnPickerR = (p: RnPickerOption) => {
  const backdropCss = useAnimationOnDidMount({
    opacity: [0, 1],
  })
  const y = useAnimationOnDidMount({
    translateY: [Dimensions.get('screen').height, 0],
  })
  return (
    <View style={[StyleSheet.absoluteFill, css.RnPicker]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, css.RnPicker_Backdrop, backdropCss]}
      >
        <RnTouchableOpacity
          onPress={RnPicker.dismiss}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.ScrollView style={[css.RnPicker_Inner, { transform: [y] }]}>
        <View style={css.RnPicker_Options}>
          {p.options.map((o, i) => {
            const isSelected = `${p.selectedKey}` === `${o.key}`
            return (
              <RnTouchableOpacity
                key={i}
                onPress={() => {
                  p.onSelect(o.key)
                  RnPicker.dismiss()
                }}
                style={[
                  css.RnPicker_Option,
                  i + 1 === p.options.length && css.RnPicker_Option__last,
                  isSelected && css.RnPicker_Option__selected,
                ]}
              >
                <RnText style={isSelected && css.RnPicker_Text__selected}>
                  {o.label}
                </RnText>
                <RnIcon
                  color={isSelected ? v.colors.primary : undefined}
                  path={
                    o.icon ||
                    (isSelected ? mdiRadioboxMarked : mdiRadioboxBlank)
                  }
                  style={css.RnPicker_Icon}
                />
              </RnTouchableOpacity>
            )
          })}
        </View>
        <RnTouchableOpacity
          onPress={RnPicker.dismiss}
          style={[css.RnPicker_Option, css.RnPicker_Option__cancel]}
        >
          <RnText style={css.RnPicker_Text__cancel}>
            {p.cancelLabel || intl`Cancel`}
          </RnText>
          <RnIcon
            color={v.colors.danger}
            path={mdiClose}
            style={css.RnPicker_Icon}
          />
        </RnTouchableOpacity>
      </Animated.ScrollView>
    </View>
  )
}

export const RnPickerRoot = observer(
  () => RnPicker.currentRnPicker && <RnPickerR {...RnPicker.currentRnPicker} />,
)
