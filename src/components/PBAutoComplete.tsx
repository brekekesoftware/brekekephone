import { FC, useEffect } from 'react'
import {
  FlatList,
  Platform,
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
  list: {
    // flex:1,
  },
  viewFlatList: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    top: 154,
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

export const PBAutoComplete: FC<
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
  console.log('autocomplete', value)

  useEffect(() => {
    contactStore.loadPbxBoook()
  }, [])

  const getData = () => {
    if (!contactStore.pbxBooks.length) {
      return []
    }
    if (!!!value) {
      return contactStore.pbxBooks
    }
    // const regex = new RegExp(`${value.trim()}`, 'i')
    const result = contactStore.pbxBooks.filter(item =>
      item.phonebook.match(value.trim()),
    )
    console.log('dev::result::', result)

    if (result && result.length === 1) {
      if (value === result[0].phonebook) {
        return []
      } else {
        return result
      }
    } else if (!result.length) {
      return contactStore.pbxBooks
    } else {
      return result
    }
  }
  if (!getData().length) {
    return null
  }
  return (
    <View style={[StyleSheet.absoluteFill, css.viewFlatList]}>
      <FlatList
        style={css.list}
        data={getData()}
        renderItem={({ item, index }: { item: PbxBook; index: number }) => (
          <RnTouchableOpacity
            style={{ width: '100%', paddingVertical: 10 }}
            onPress={() => onPressItem && onPressItem(item)}
          >
            <Text
              style={{ width: '100%', textAlign: 'left', marginHorizontal: 10 }}
            >
              {item.phonebook}
            </Text>
          </RnTouchableOpacity>
        )}
        keyExtractor={item => item.phonebook}
        ItemSeparatorComponent={() => (
          <View
            style={{ width: '100%', height: 0.5, backgroundColor: 'grey' }}
          />
        )}
      />
    </View>
  )
}
