'use client'

import type { NumberInputProps } from '@/rn/components/input/number-input'
import { NumberInput } from '@/rn/components/input/number-input'
import { Pressable } from '@/rn/core/components/pressable'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { Minus } from '@/rn/svg-icons/minus'
import { Plus } from '@/rn/svg-icons/plus'

type QuantityInputProps = NumberInputProps & {
  step?: number
  min?: number
  max?: number
}

export const QuantityInput = ({
  value,
  defaultValue,
  onChangeText,
  step = 1,
  min = 1,
  max = Infinity,
  ...props
}: QuantityInputProps) => {
  const [state, setState] = useControllableState({
    value,
    defaultValue,
    onChange: onChangeText,
  })

  const clamp = (val: number) => Math.max(min, Math.min(val, max)).toString()

  const onPress = (by: number) => {
    setState(prev => clamp(+prev + by))
  }

  return (
    <NumberInput
      {...props}
      value={state}
      onChangeText={setState}
      onBlur={e => {
        setState(prev => clamp(+prev))
        props.onBlur?.(e)
      }}
      className={[
        'border-gray-200 text-center focus:border-gray-200',
        props.className,
      ]}
      prefix={className => (
        <Pressable
          className={[className, 'border-r border-gray-200']}
          onPress={() => onPress(-step)}
        >
          <Minus className='text-[10px]' />
        </Pressable>
      )}
      suffix={className => (
        <Pressable
          className={[className, 'border-l border-gray-200']}
          onPress={() => onPress(step)}
        >
          <Plus className='text-[10px]' />
        </Pressable>
      )}
    />
  )
}
