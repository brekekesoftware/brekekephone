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
  RnPicker_Icon: {
    position: 'absolute',
    top: 10,
    right: 10,
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
                className={[
                  'py-3 px-3.75 border-b border-border',
                  i + 1 === p.options.length && 'border-b-0',
                  isSelected && 'bg-muted',
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
            className={[
              'py-3 px-3.75 mt-3.75 rounded-[3px] bg-background',
              p.onConfirm && 'items-center bg-error-100 rounded-l-[3px] rounded-r-none',
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
              className='py-3 px-3.75 mt-3.75 rounded-[3px] items-center bg-primary rounded-l-none rounded-r-[3px]'
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
