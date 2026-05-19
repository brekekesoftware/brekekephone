import { observer } from 'mobx-react'
import { useState } from 'react'
import { Dimensions } from 'react-native'

import { AnimatedScrollView, AnimatedView } from '@/rn/core/components/animated'
import { View } from '@/rn/core/components/view'
import { mdiClose, mdiRadioboxBlank, mdiRadioboxMarked } from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { isIos } from '#/config'
import { intl } from '#/stores/intl'
import type { RnPickerOption } from '#/stores/rn-picker'
import { RnPicker } from '#/stores/rn-picker'
import { useAnimationOnDidMount } from '#/utils/animation'

const defaultBottomPosition = isIos ? 20 : 15

const css = {
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
  Confirm_label: {
    color: 'white',
  },
  RnPicker_Label: {
    width: '95%',
  },
} as const

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
    <View className='absolute inset-0 flex-row items-center justify-center'>
      <AnimatedView
        className='absolute inset-0 bg-modal-overlay'
        style={{ opacity: backdropCss.opacity }}
      >
        <RnTouchableOpacity
          onPress={RnPicker.dismiss}
          className='absolute inset-0'
        />
      </AnimatedView>
      <AnimatedScrollView
        className='absolute w-[90%] max-w-95 max-h-[80%] mb-15'
        style={{
          bottom: defaultBottomPosition,
          transform: [y],
        }}
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
                <RnText
                  className='line-clamp-1 w-[95%]'
                  bold={isSelected}
                  primary={isSelected}
                >
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
      </AnimatedScrollView>
      <View
        style={{
          flexDirection: 'row',
          bottom: defaultBottomPosition,
          position: 'absolute',
          width: '90%',
          maxWidth: v.maxModalWidth,
        }}
      >
        <AnimatedView className='flex-1 max-w-95' style={{ transform: [y] }}>
          <RnTouchableOpacity
            onPress={RnPicker.dismiss}
            style={[
              css.RnPicker_Option,
              css.RnPicker_Option__general,
              p.onConfirm && css.RnPicker_Button_cancel,
            ]}
          >
            <RnText bold danger>
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
        </AnimatedView>
        {p.onConfirm && (
          <AnimatedView className='flex-1 max-w-95' style={{ transform: [y] }}>
            <RnTouchableOpacity
              onPress={onConfirm}
              style={[
                css.RnPicker_Option,
                css.RnPicker_Option__general,
                p.onConfirm && css.RnPicker_Button_confirm,
              ]}
            >
              <RnText bold white>
                {p.confirmLabel || intl`SAVE`}
              </RnText>
            </RnTouchableOpacity>
          </AnimatedView>
        )}
      </View>
    </View>
  )
}

export const RnPickerRoot = observer(
  () => RnPicker.currentRnPicker && <RnPickerR {...RnPicker.currentRnPicker} />,
)
