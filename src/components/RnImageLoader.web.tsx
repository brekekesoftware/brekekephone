import { mdiImageBrokenVariant } from '@mdi/js'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View, ViewProps } from 'react-native'
import FastImage from 'react-native-fast-image'
import Svg, { Path } from 'react-native-svg'

import { ChatFile } from '../stores/chatStore'
import RnTouchableOpacity from './RnTouchableOpacity'
import g from './variables'

const css = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: g.layerBg,
    width: 150,
    height: 150,
    borderRadius: 5,
    overflow: 'hidden',
  },
  imageBroken: {
    marginLeft: 0,
    marginTop: 0,
    backgroundColor: 'blue',
    aspectRatio: 1,
    alignItems: 'center',
    width: '100%',
    height: 150,
  },
})
const size = '100%'

const RnImageLoader: FC<ViewProps & ChatFile> = ({ url, state, fileType }) => {
  const [imageBase64, setImageBase64] = useState('')

  const onShowImage = useCallback(() => {
    const image = new Image()
    image.src = imageBase64 || ''
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }, [imageBase64])

  const readImage = async (url: string) => {
    try {
      const urlImage = url.split('/')
      const cache = await caches.open(urlImage[0])
      const request = new Request(urlImage[1], {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      })
      const response = await cache.match(request)
      const dataBase64 = await response?.text()
      dataBase64 && setImageBase64(dataBase64)
    } catch (error) {
      setImageBase64('')
    }
  }
  useEffect(() => {
    url && readImage(url)
  }, [url])

  const renderView = () => {
    if (fileType === 'image') {
      return (
        <RnTouchableOpacity onPress={onShowImage}>
          <FastImage source={{ uri: imageBase64 }} style={css.image} />
        </RnTouchableOpacity>
      )
    } else {
      return (
        <video src={imageBase64} width='200' height='150'>
          Your browser does not support HTML5 video.
        </video>
      )
    }
  }
  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && !!imageBase64
  if (state === 'success' && !!!imageBase64) {
    return null
  }
  return (
    <View style={css.image}>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={css.loading} />
      )}
      {isLoadSuccess && (
        <RnTouchableOpacity onPress={onShowImage}>
          <FastImage source={{ uri: imageBase64 }} style={css.image} />
        </RnTouchableOpacity>
      )}
      {isLoadFailed && (
        <Svg
          preserveAspectRatio='xMinYMin slice'
          height={size}
          viewBox='3 3  18 18'
          width={size}
        >
          <Path d={mdiImageBrokenVariant} fill={g.colors.greyTextChat} />
        </Svg>
      )}
    </View>
  )
}

export default RnImageLoader
