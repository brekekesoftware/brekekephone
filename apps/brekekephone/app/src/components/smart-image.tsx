import { useEffect, useState } from 'react'

import noPhoto from '#/assets/no_photo.png'

import { View } from '@/rn/core/components/view'
import type { ClassName } from '@/rn/core/tw/class-name'
import { RnActivityIndicator } from '#/components/rn-activity-indicator'
import { ctx } from '#/stores/ctx'
import { checkImageUrl } from '#/utils/check-image-url'

export const SmartImage = (p: {
  uri: string
  className?: ClassName
  incoming: boolean
}) => {
  const [statusImageLoading, setStatusImageLoading] = useState(0)
  const [size, setSize] = useState(0)
  useEffect(() => {
    setStatusImageLoading(0)
  }, [p.uri])

  const onLoaded = () => {
    setStatusImageLoading(1)
  }
  const onImageLoadError = () => {
    setStatusImageLoading(2)
  }
  const onImageLoad = () => {
    setStatusImageLoading(1)
  }

  const isImageUrl =
    (ctx.auth.phoneappliEnabled() && !p.incoming) || checkImageUrl(p.uri)

  return (
    <View
      className={[
        'bg-background items-center justify-center overflow-hidden',
        p.className,
      ]}
      onLayout={event => {
        const { height } = event.nativeEvent.layout
        setSize(height)
      }}
    >
      {!statusImageLoading && (
        <RnActivityIndicator
          size='small'
          color='white'
          className='absolute z-100 h-9 w-9 self-center overflow-hidden bg-transparent'
        />
      )}
      {!isImageUrl ? (
        <div>
          <iframe
            title='Load Image'
            src={p.uri}
            height={size}
            width={size}
            onLoad={onLoaded}
            frameBorder='0'
          />
        </div>
      ) : (
        <img
          src={p.uri}
          className='bg-background items-center justify-center overflow-hidden object-cover'
          style={{ width: size, height: size }}
          onError={onImageLoadError}
          onLoad={onImageLoad}
        />
      )}
      {statusImageLoading === 2 && isImageUrl && (
        <img
          src={noPhoto}
          className='bg-background absolute top-0 left-0 z-100 overflow-hidden object-cover'
          style={{ width: size, height: size }}
        />
      )}
    </View>
  )
}
