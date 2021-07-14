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
  video: {
    width: 320,
    height: 240,
    borderRadius: 5,
    backgroundColor: g.borderBg,
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
  const [objectURL, setObjectUrl] = useState<string>('')

  const onShowImage = useCallback(() => {
    const image = new Image()
    image.src = objectURL || ''
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }, [objectURL])

  const readImage = async (url: string) => {
    try {
      const urlImage = url.split('/')
      const cache = await caches.open(urlImage[0])
      const request = new Request(urlImage[1])
      const response = await cache.match(request)
      const blobFile = await response?.blob()
      const objectURL = URL.createObjectURL(blobFile)
      // console.log({ response: newBlob?.size})
      objectURL && setObjectUrl(objectURL)
    } catch (error) {
      setObjectUrl('')
    }
  }
  useEffect(() => {
    url && readImage(url)
  }, [url])

  const renderView = () => {
    if (fileType === 'image') {
      return (
        <RnTouchableOpacity onPress={onShowImage}>
          <FastImage source={{ uri: objectURL }} style={css.image} />
        </RnTouchableOpacity>
      )
    } else {
      return (
        <View style={css.video}>
          <video
            controls
            src={objectURL}
            playsInline
            width='320'
            height='240'
          />
        </View>
      )
    }
  }
  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && !!objectURL
  if (state === 'success' && !!!objectURL) {
    return null
  }
  const cssView = fileType === 'image' ? css.image : {}
  return (
    <View style={[cssView]}>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={css.loading} />
      )}
      {isLoadSuccess && renderView()}
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
