import { mdiImageBrokenVariant } from '@mdi/js'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View, ViewProps } from 'react-native'
import FastImage from 'react-native-fast-image'
import Svg, { Path } from 'react-native-svg'

import { ChatFile } from '../stores/chatStore'
import RnTouchableOpacity from './RnTouchableOpacity'
import g from './variables'

const size = 200
const css = StyleSheet.create({
  image: {
    width: size,
    height: size,
    borderRadius: 5,
    overflow: 'hidden',
  },
  video: {
    width: size,
    height: size,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: g.layerBgVideo,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: g.layerBg,
    width: size,
    height: size,
    borderRadius: 5,
    overflow: 'hidden',
  },
  loadingVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: g.layerBg,
    width: size,
    height: size,
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
    height: size,
  },
})

const RnImageVideoLoader: FC<ViewProps & ChatFile> = ({
  url,
  state,
  fileType,
}) => {
  const [objectURL, setObjectUrl] = useState<string>('')

  const onShowImage = useCallback(() => {
    const image = new Image()
    image.src = objectURL || ''
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }, [objectURL])

  const readImage = async (_: string) => {
    try {
      const urlImage = _.split('/')
      const cache = await caches.open(urlImage[0])
      const request = new Request(urlImage[1])
      const response = await cache.match(request)
      const blobFile = await response?.blob()
      blobFile && setObjectUrl(URL.createObjectURL(blobFile))
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
            width={size}
            height={size}
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
  const cssLoading = fileType === 'image' ? css.loading : css.loadingVideo
  return (
    <View style={[css.image]}>
      {isLoading && (
        <ActivityIndicator size='small' color='white' style={cssLoading} />
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

export default RnImageVideoLoader
