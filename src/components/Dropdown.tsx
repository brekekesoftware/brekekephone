import React, { FC } from 'react'
import { Platform, StyleSheet, View, ViewProps } from 'react-native'

import { DropdownPosition } from '../stores/RnDropdownSectionList'
import { DropdownItem, DropdownItemProps } from './DropdownItem'
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
}: DropdownProps) => {
  return (
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
}
