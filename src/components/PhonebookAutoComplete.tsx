import { FC, useEffect, useState } from 'react'
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacityProps,
  View,
} from 'react-native'

import { PbxBook } from '../api/brekekejs'
import { contactStore } from '../stores/contactStore'
import { RnTouchableOpacity } from './RnTouchableOpacity'
import { v } from './variables'

const css = StyleSheet.create({
  txtPb: {
    width: '100%',
    textAlign: 'left',
    marginHorizontal: 10,
  },
  itemPb: {
    width: '100%',
    paddingVertical: 5,
    borderBottomColor: 'grey',
    borderBottomWidth: 0.5,
  },
  autocompleteContainer: {
    // Hack required to make the autocomplete
    // work on Andrdoid
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    padding: 5,
    backgroundColor: 'blue',
    ...Platform.select({
      web: {
        marginTop: 0,
      },
      default: {
        marginTop: 25,
      },
    }),
  },
  viewFlatList: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: Dimensions.get('screen').width - 30,
    maxHeight: 300,
    top: 188,
    zIndex: 100000,
    marginHorizontal: 15,
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

export const PhonebookAutoComplete: FC<
  Partial<{
    style?: TouchableOpacityProps['style']
    // onCreateBtnPress(): void
    // label: string
    value: string
    layout?: Object
    // textInputStyle?: TextInputProps['style']
    onPressItem(item: PbxBook): void
  }>
> = p0 => {
  const { value, onPressItem } = p0
  const [isChoose, setChoose] = useState(false)

  useEffect(() => {
    contactStore.loadPbxBoook()
    setChoose(false)
  }, [value])

  const getData = () => {
    if (!contactStore.pbxBooks.length) {
      return []
    }
    if (!value) {
      return [...contactStore.pbxBooks]
    }
    const result = contactStore.pbxBooks.filter(item => {
      // make same web search
      return item.phonebook.toLowerCase().startsWith(value.toLowerCase())
    })
    if (
      !result.length ||
      (result.length === 1 && value === result[0].phonebook)
    ) {
      return []
    }
    return result
  }
  const result = [...getData()]

  if (!result.length || isChoose === true) {
    return null
  }
  return (
    <View style={css.viewFlatList}>
      <ScrollView>
        {result.map((item, index) => (
          <RnTouchableOpacity
            key={index}
            style={css.itemPb}
            onPress={() => {
              setChoose(true)
              onPressItem?.(item)
            }}
          >
            <Text style={css.txtPb}>{item.phonebook}</Text>
          </RnTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
