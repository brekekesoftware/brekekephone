import React, { FC, useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'

// import ImageView from 'react-native-image-viewing'
import { RnImage } from './Rn'
import RnText from './RnText'

const css = StyleSheet.create({
  Image: {
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  Loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#00000090',
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  Message_File_Preview_Info: {
    marginLeft: 5,
    ...Platform.select({
      web: {
        width: 'calc(100vw - 119px)',
      },
      default: {
        width: Dimensions.get('screen').width - 119,
      },
    }),
  },
  Message_File_Preview_Info_Size: {
    color: '#b5b5b5',
    fontSize: 13,
  },
})

const RnImageLoader: FC<
  ViewProps &
    Partial<{
      fileType: string
      url: string
      name: string
      size: string
      state: string
      incoming: boolean
      createdByMe: boolean
    }>
> = ({ fileType, url, name, size, state, incoming, createdByMe, ...p }) => {
  console.log({ state, url })
  const isWeb = Platform.OS === 'web'
  const [visible, setIsVisible] = useState(false)
  const images = [{ uri: url }]

  const onShowImage = useCallback(() => {
    setIsVisible(true)
  }, [])

  return (
    <View style={css.Image}>
      {state !== 'success' && (
        <ActivityIndicator size='small' color='white' style={css.Loading} />
      )}
      <View style={css.Message_File_Preview_Info}>
        <RnText numberOfLines={1}>{name}</RnText>
        <RnText style={css.Message_File_Preview_Info_Size}>{size} KB</RnText>
      </View>
      <Pressable onPress={onShowImage}>
        <RnImage source={{ uri: url }} style={css.Image} />
      </Pressable>
      {/* {!isWeb && <ImageView
      images={images}
      imageIndex={0}
      visible={visible}
      onRequestClose={() => setIsVisible(false)}
    />} */}
    </View>
  )
}

export default RnImageLoader
