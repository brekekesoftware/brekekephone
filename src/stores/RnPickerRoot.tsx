import { observer } from 'mobx-react'
import { useState } from 'react'
import { Animated, Dimensions, StyleSheet, View } from 'react-native'

import {
  mdiCheck,
  mdiClose,
  mdiRadioboxBlank,
  mdiRadioboxMarked,
} from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { isAndroid, isIos } from '#/config'
import { intl } from '#/stores/intl'
import type { RnPickerOption } from '#/stores/RnPicker'
import { RnPicker } from '#/stores/RnPicker'
import { useAnimationOnDidMount } from '#/utils/animation'

const defaultBottomPosition = isIos ? 20 : 15

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
    width: '90%',
    maxWidth: v.maxModalWidth,
    maxHeight: '80%',
    marginBottom: 60,
    bottom: defaultBottomPosition,
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
  RnPicker_Option__general: {
    marginTop: 15,
    borderBottomWidth: 0,
    borderRadius: v.borderRadius,
    backgroundColor: v.bg,
  },
  RnPicker_Button: {
    flex: 1,
    maxWidth: v.maxModalWidth,
  },
  RnPicker_Button_confirm: {
    alignItems: 'center',
    backgroundColor: v.colors.primary,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    color: 'white',
  },
  RnPicker_Button_cancel: {
    alignItems: 'center',
    backgroundColor: v.colors.dangerFn(0.5),
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
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
  RnPicker_footer: {
    flexDirection: 'row',
    bottom: defaultBottomPosition,
    position: 'absolute',
    width: '90%',
    maxWidth: v.maxModalWidth,
  },
  Confirm_label: {
    color: 'white',
  },
})

const RnPickerR = (p: RnPickerOption) => {
  const [selectedKey, setSelectedKey] = useState<string | number>(
    p.selectedKey || '',
  )

  const backdropCss = useAnimationOnDidMount({
    opacity: [0, 1],
  })
  const y = useAnimationOnDidMount({
    translateY: [Dimensions.get('screen').height, 0],
  })

  const onConfirm = () => {
    p.onConfirm?.(selectedKey)
    RnPicker.dismiss()
  }

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
      <Animated.ScrollView
        style={[
          css.RnPicker_Inner,
          {
            transform: [y],
          },
        ]}
      >
        <View style={css.RnPicker_Options}>
          {p.options.map((o, i) => {
            const isSelected = `${selectedKey}` === `${o.key}`
            return (
              <RnTouchableOpacity
                key={i}
                onPress={() => {
                  p.onSelect(o.key)
                  setSelectedKey(o.key)
                  !p.onConfirm && RnPicker.dismiss()
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
      </Animated.ScrollView>
      <View style={css.RnPicker_footer}>
        <Animated.View style={[{ transform: [y] }, css.RnPicker_Button]}>
          <RnTouchableOpacity
            onPress={RnPicker.dismiss}
            style={[
              css.RnPicker_Option,
              css.RnPicker_Option__general,
              p.onConfirm && css.RnPicker_Button_cancel,
            ]}
          >
            <RnText style={css.RnPicker_Text__cancel}>
              {p.cancelLabel || intl`Cancel`}
            </RnText>
            {!p.onConfirm && (
              <RnIcon
                color={v.colors.danger}
                path={mdiClose}
                style={css.RnPicker_Icon}
              />
            )}
          </RnTouchableOpacity>
        </Animated.View>
        {p.onConfirm && (
          <Animated.View style={[{ transform: [y] }, css.RnPicker_Button]}>
            <RnTouchableOpacity
              onPress={onConfirm}
              style={[
                css.RnPicker_Option,
                css.RnPicker_Option__general,
                p.onConfirm && css.RnPicker_Button_confirm,
              ]}
            >
              <RnText style={[css.RnPicker_Text__selected, css.Confirm_label]}>
                {p.confirmLabel || intl`SAVE`}
              </RnText>
            </RnTouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  )
}

export const RnPickerRoot = observer(
  () => RnPicker.currentRnPicker && <RnPickerR {...RnPicker.currentRnPicker} />,
)
