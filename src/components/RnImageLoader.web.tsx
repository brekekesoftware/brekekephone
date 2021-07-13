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
  const [blobFile, setBlobFile] = useState<string>('')

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
      // const openRequest = window.indexedDB.open('testDB', 3)

      // openRequest.onupgradeneeded = e => {
      //   console.log('onupgradeneeded')
      //   const thisdb = openRequest.result
      //   if (!thisdb.objectStoreNames.contains('nam')) {
      //     thisdb.createObjectStore('nam')
      //   }
      // }

      // openRequest.onsuccess = e => {
      //   console.log('onsuccess')
      //   const db = openRequest.result
      //   // db.createObjectStore('stash')
      //   const transaction = db.transaction(['nam'], 'readwrite')
      //   const store = transaction.objectStore('nam')
      //   const request = store.get(url)
      //   request.onsuccess = e => {
      //     const imgFile = request.result as Blob
      //     const fr = new FileReader()
      //     fr.onloadend = async event => {
      //       const r = event.target?.result as ArrayBuffer
      //       console.log({ r: r.byteLength })
      //       const videoBlob = new Blob([r], { type: 'video/mp4' })
      //       const objectURL = URL.createObjectURL(videoBlob)
      //       console.log({ response: videoBlob.size })
      //       objectURL && setBlobFile(objectURL)
      //     }
      //     fr.onerror = err => {
      //       console.error('saveBlob', err)
      //     }
      // //     blobFile && fr.readAsArrayBuffer(imgFile)
      //     // console.log("Got elephant!" + imgFile.size)

      //     // // Get window.URL object
      //     // const URL = window.URL || window.webkitURL

      //     // // Create and revoke ObjectURL
      //     // const  imgURL = URL.createObjectURL(new Blob([imgFile]))
      //     // console.log({imgURL})

      //     // imgURL && setBlobFile(imgURL)
      //   }
      //   request.onerror = e => {}
      // }

      // openRequest.onerror = e => {
      //   console.log('onerror', { e })
      // }

      const urlImage = url.split('/')
      const cache = await caches.open(urlImage[0])
      console.log({ urlImage })
      const request = new Request(urlImage[1])

      const response = await cache.match(request)
      const blobFile = await response?.blob()
      // const buf = await blobFile?.arrayBuffer()

      // const newBlob =  blobFile && new Blob( [ blobFile ])
      // const URL = window.URL || window.webkitURL
      const objectURL = URL.createObjectURL(blobFile)
      // console.log({ response: newBlob?.size})
      objectURL && setBlobFile(objectURL)

      // console.log({ response: blobFile?.size})
      // const fr = new FileReader()
      // fr.onloadend = async event => {
      //   const r = event.target?.result as ArrayBuffer
      //   console.log({ r: r.byteLength })
      //   const videoBlob = new Blob([r], { type: 'video/mp4' })
      //   const objectURL = URL.createObjectURL(videoBlob)
      //   console.log({ response:videoBlob.size})
      //   objectURL && setBlobFile(objectURL)
      // }
      // fr.onerror = err => {
      //   console.error('saveBlob', err)
      // }
      // blobFile && fr.readAsArrayBuffer(blobFile)
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
          <FastImage source={{ uri: blobFile }} style={css.image} />
        </RnTouchableOpacity>
      )
    } else {
      return <video src={blobFile} autoPlay playsInline />
    }
  }
  const isLoading =
    state !== 'success' && state !== 'failure' && state !== 'stopped'
  const isLoadFailed = state === 'failure' || state === 'stopped'
  const isLoadSuccess = state === 'success' && !!blobFile
  // if (state === 'success' && !!!blobFile) {
  //   return null
  // }
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
