import type { ClassName } from '@/rn/core/tw/class-name'
import { useEffect, useState } from 'react'

import { View } from '@/rn/core/components/view'
import noPhoto from '#/assets/no_photo.png'
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
        'overflow-hidden bg-background justify-center items-center',
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
          className='absolute top-0 left-0 w-full h-full overflow-hidden z-100 bg-[#00000030]'
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
          className='overflow-hidden bg-background justify-center items-center object-cover'
          style={{ width: size, height: size }}
          onError={onImageLoadError}
          onLoad={onImageLoad}
        />
      )}
      {statusImageLoading === 2 && isImageUrl && (
        <img
          src={noPhoto}
          className='overflow-hidden bg-background absolute top-0 left-0 z-100 object-cover'
          style={{ width: size, height: size }}
        />
      )}
    </View>
  )
}
