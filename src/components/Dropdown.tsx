import type { FC } from 'react'
import type { ViewProps } from 'react-native'
import { Platform, StyleSheet, View } from 'react-native'

import type { DropdownPosition } from '../stores/RnDropdown'
import type { DropdownItemProps } from './DropdownItem'
import { DropdownItem } from './DropdownItem'
import { v } from './variables'

type DropdownProps = {
  items?: DropdownItemProps[]
  position: DropdownPosition
}

const css = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: v.borderBg,
        shadowOpacity: 0.45,
        shadowRadius: 5,
        shadowOffset: {
          width: 5,
          height: 10,
        },
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: `${0}px ${0}px ${10}px ${v.borderBg}`,
      },
    }),
  },
})

export const Dropdown: FC<ViewProps & DropdownProps> = ({
  items = [],
  position = {},
}: DropdownProps) => (
  <View style={[css.container, { ...position }]}>
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
