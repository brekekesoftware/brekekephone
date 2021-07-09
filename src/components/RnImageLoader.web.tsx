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
    // overflow: 'hidden',
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
  const [blobFile, setBlobFile] = useState<Blob | null>(null)

  const onShowImage = useCallback(() => {
    const image = new Image()
    const objectURL = URL.createObjectURL(blobFile)
    image.src = objectURL || ''
    const w = window.open('')
    w?.document.write(image.outerHTML)
  }, [blobFile])

  const Video = (props: any) => {
    const attrs = {
      src: props.source,
      poster: props.poster,
      controls: 'controls',
    }
    return React.createElement('video', attrs)
  }
  const readImage = async (url: string) => {
    try {
      const urlImage = url.split('/')
      const cache = await caches.open(urlImage[0])
      console.log({ urlImage })
      const request = new Request('/' + urlImage[1], {
        method: 'GET',
        headers: { 'Content-Type': 'video/mp4' },
      })

      console.log({ request: request.url, request1: await request.blob() })

      // const response = await cache.match(request)
      const response = await fetch('/' + urlImage[1])
      console.log({ response: response?.clone() })
      const data = await response?.blob()
      console.log({ data })

      // data && setBlobFile(data)
    } catch (error) {
      // setBlobFile()
    }
  }
  useEffect(() => {
    url && readImage(url)
  }, [url])

  const renderView = () => {
    if (fileType === 'image') {
      return (
        <RnTouchableOpacity onPress={onShowImage}>
          <FastImage
            source={{ uri: URL.createObjectURL(blobFile) }}
            style={css.image}
          />
        </RnTouchableOpacity>
      )
    } else {
      return (
        <Video src={blobFile} poster={'https://www.fillmurray.com/480/300'} />
      )
    }
  }
  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && !!blobFile
  if (state === 'success' && !!!blobFile) {
    return null
  }
  return (
    <View style={css.image}>
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
