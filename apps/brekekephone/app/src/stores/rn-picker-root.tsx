import { observer } from 'mobx-react'
import { useState } from 'react'
import { useWindowDimensions } from 'react-native'

import { View } from '@/rn/core/components/view'
import { mdiClose, mdiRadioboxBlank, mdiRadioboxMarked } from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { AnimatedScrollView, AnimatedView } from '#/components/rn-animated'
import { intl } from '#/stores/intl'
import type { RnPickerOption } from '#/stores/rn-picker'
import { RnPicker } from '#/stores/rn-picker'
import { useAnimationOnDidMount } from '#/utils/animation'

const RnPickerR = (p: RnPickerOption) => {
  const [selectedKey, setSelectedKey] = useState<string | number>(
    p.selectedKey || '',
  )

  const { height } = useWindowDimensions()
  const backdropCss = useAnimationOnDidMount({ opacity: [0, 1] })
  const y = useAnimationOnDidMount({
    translateY: [height, 0],
  })

  const onConfirm = () => {
    p.onConfirm?.(selectedKey)
    RnPicker.dismiss()
  }

  return (
    <View className='absolute inset-0 flex-row items-center justify-center'>
      <AnimatedView
        className='bg-modal-overlay absolute inset-0'
        style={{ opacity: backdropCss.opacity }}
      >
        <RnTouchableOpacity
          onPress={RnPicker.dismiss}
          className='absolute inset-0'
        />
      </AnimatedView>
      <AnimatedScrollView
        className='ios:bottom-5 absolute bottom-3.75 mb-15 max-h-[80%] w-[90%] max-w-95'
        style={{ transform: [y] }}
      >
        <View className='bg-background overflow-hidden rounded-[3px]'>
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
                  'border-border border-b px-3.75 py-3',
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
                  path={
                    o.icon ||
                    (isSelected ? mdiRadioboxMarked : mdiRadioboxBlank)
                  }
                  className={[
                    'text-foreground absolute top-2.5 right-2.5',
                    isSelected && 'text-primary',
                  ]}
                />
              </RnTouchableOpacity>
            )
          })}
        </View>
      </AnimatedScrollView>
      <View className='ios:bottom-5 absolute bottom-3.75 w-[90%] max-w-95 flex-row'>
        <AnimatedView className='max-w-95 flex-1' style={{ transform: [y] }}>
          <RnTouchableOpacity
            onPress={RnPicker.dismiss}
            className={[
              'bg-background mt-3.75 rounded-[3px] px-3.75 py-3',
              p.onConfirm &&
                'bg-error-100 items-center rounded-l-[3px] rounded-r-none',
            ]}
          >
            <RnText bold danger>
              {p.cancelLabel || intl`Cancel`}
            </RnText>
            {!p.onConfirm && (
              <RnIcon
                path={mdiClose}
                className='text-foreground text-error absolute top-2.5 right-2.5'
              />
            )}
          </RnTouchableOpacity>
        </AnimatedView>
        {p.onConfirm && (
          <AnimatedView className='max-w-95 flex-1' style={{ transform: [y] }}>
            <RnTouchableOpacity
              onPress={onConfirm}
              className='bg-primary mt-3.75 items-center rounded-[3px] rounded-l-none rounded-r-[3px] px-3.75 py-3'
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
