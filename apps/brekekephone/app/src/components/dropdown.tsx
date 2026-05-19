import type { FC } from 'react'
import type { ViewProps } from 'react-native'
import { Platform } from 'react-native'

import { View } from '@/rn/core/components/view'
import type { DropdownItemProps } from '#/components/dropdown-item'
import { DropdownItem } from '#/components/dropdown-item'
import { v } from '#/components/variables'
import type { DropdownPosition } from '#/stores/rn-dropdown'

type DropdownProps = {
  items?: DropdownItemProps[]
  position: DropdownPosition
}

// Platform-specific shadow — kept inline (RN-only properties)
const shadowStyle = Platform.select({
  ios: {
    shadowColor: v.borderBg,
    shadowOpacity: 0.45,
    shadowRadius: 5,
    shadowOffset: { width: 5, height: 10 },
  },
  android: { elevation: 10 },
  web: { boxShadow: `0px 0px 10px ${v.borderBg}` },
})

export const Dropdown: FC<ViewProps & DropdownProps> = ({
  items = [],
  position = {},
}: DropdownProps) => (
  <View
    className='absolute rounded-[5px] bg-white py-1.25 px-2.5'
    style={[shadowStyle, position]}
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
