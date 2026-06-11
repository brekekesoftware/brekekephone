import { Image } from '@rntwsc/rn/core/components/image'
import { View } from '@rntwsc/rn/core/components/view'
import { tw } from '@rntwsc/rn/core/tw/tw'
import { isWeb } from '@rntwsc/rn/core/utils/platform'
import { observer } from 'mobx-react'

import avatarPlaceholder from '#/assets/avatar-placeholder.png'

import { mdiRecord } from '#/assets/icons'
import { RnImage } from '#/components/rn'
import { RnIcon } from '#/components/rn-icon'
import { ctx } from '#/stores/ctx'

type AvatarSource = string | number | { uri?: string }
type NativeAvatarSource = number | { uri: string }

const fallbackSource = avatarPlaceholder as AvatarSource

const getSourceUri = (source?: AvatarSource) =>
  typeof source === 'string'
    ? source
    : typeof source === 'number'
      ? ''
      : source?.uri || ''

const getNativeImageSource = (
  source?: AvatarSource,
): NativeAvatarSource | undefined => {
  const uri = getSourceUri(source)
  if (uri) {
    return {
      uri,
    }
  }
  if (typeof source === 'number') {
    return source
  }
  return undefined
}

const statusMapClassName = {
  online: tw`text-primary`,
  idle: tw`text-warning`,
  busy: tw`text-error`,
  offline: tw`text-foreground-muted`,
}

export const Avatar = observer(
  (p: {
    source?: AvatarSource
    status?: string
    className?: string | (string | false | undefined)[]
  }) => {
    const { source, status, className } = p
    const webSrc = getSourceUri(source) || getSourceUri(fallbackSource)
    const imageSource =
      getNativeImageSource(source) || getNativeImageSource(fallbackSource)
    return (
      <View className={['h-12.5 w-12.5', className]}>
        <View className='flex-1 overflow-hidden rounded-full'>
          {isWeb ? (
            <Image src={webSrc} className='flex-1' />
          ) : (
            <RnImage source={imageSource} className='flex-1' />
          )}
        </View>
        {ctx.auth.getCurrentAccount()?.ucEnabled &&
          typeof status === 'string' && (
            <RnIcon
              path={mdiRecord}
              className={[
                'absolute top-6.75 left-7.5',
                statusMapClassName[status as keyof typeof statusMapClassName],
              ]}
            />
          )}
      </View>
    )
  },
)
