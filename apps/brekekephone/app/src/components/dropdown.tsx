import type { FC } from 'react'
import type { ViewProps } from 'react-native'

import { View } from '@/rn/core/components/view'
import type { DropdownItemProps } from '#/components/dropdown-item'
import { DropdownItem } from '#/components/dropdown-item'
import type { DropdownPosition } from '#/stores/rn-dropdown'

type DropdownProps = {
  items?: DropdownItemProps[]
  position: DropdownPosition
}

export const Dropdown: FC<ViewProps & DropdownProps> = ({
  items = [],
  position = {},
}: DropdownProps) => (
  <View
    className='absolute rounded-[5px] bg-white py-1.25 px-2.5 shadow-border shadow-opacity-45 shadow-radius-[5px] shadow-offset-[5px]/[10px] android:elevation-10'
    style={position}
  >
    {items.map((item, index) => (
      <DropdownItem
        key={`DropdownItem - ${index}`}
        title={item.title}
        onPress={item.onPress}
        disabled={item.disabled}
      />
    ))}
  </View>
)
