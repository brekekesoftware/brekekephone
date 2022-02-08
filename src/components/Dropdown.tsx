import React, { FC } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import { DropdownPosition } from '../stores/RnDropdownSectionList'
import { DropdownItem, DropdownItemProps } from './DropdownItem'

type DropdownProps = {
  items?: DropdownItemProps[]
  position: DropdownPosition
}

const css = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#333',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    elevation: 15,
    padding: 10,
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
        />
      ))}
    </View>
  )
}
