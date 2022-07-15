import { FC, useEffect } from 'react'
import {
  Dimensions,
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
  viewFlatList: {
    position: 'absolute',
    borderRadius: 5,
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: Dimensions.get('screen').width - 30,
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

  useEffect(() => {
    contactStore.loadPbxBoook()
  }, [])

  const getData = () => {
    if (!contactStore.pbxBooks.length) {
      return []
    }
    if (!!!value) {
      return [...contactStore.pbxBooks]
    }
    const result = contactStore.pbxBooks.filter(item =>
      item.phonebook.match(value.trim()),
    )
    if (
      !result.length ||
      (result.length === 1 && value === result[0].phonebook)
    ) {
      return []
    }
    return result
  }
  const result = [...getData()]
  console.error('dev::', result)
  console.error('dev::pbxBooks::', contactStore.pbxBooks)
  if (!result.length) {
    return null
  }
  return (
    <View style={[css.viewFlatList]}>
      {result.map(item => (
        <RnTouchableOpacity
          style={{
            width: '100%',
            paddingVertical: 10,
            borderBottomColor: 'grey',
            borderBottomWidth: 0.5,
          }}
          onPress={() => onPressItem && onPressItem(item)}
        >
          <Text
            style={{ width: '100%', textAlign: 'left', marginHorizontal: 10 }}
          >
            {item.phonebook}
          </Text>
        </RnTouchableOpacity>
      ))}
      {/* <FlatList
        style={css.list}
        data={result}
        renderItem={({ item, index }: { item: PbxBook; index: number }) => (
          
        )}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => (
          <View
            style={{ width: '100%', height: 0.5, backgroundColor: 'grey' }}
          />
        )}
      /> */}
    </View>
  )
}
