import { observer } from 'mobx-react'

import avatarPlaceholder from '#/assets/avatar-placeholder.png'

import { Image } from '@/rn/core/components/image'
import { View } from '@/rn/core/components/view'
import { tw } from '@/rn/core/tw/tw'
import { mdiRecord } from '#/assets/icons'
import { RnIcon } from '#/components/rn-icon'
import { ctx } from '#/stores/ctx'

const statusMapClassName = {
  online: tw`text-primary`,
  idle: tw`text-warning`,
  busy: tw`text-error`,
  offline: tw`text-foreground-muted`,
}

export const Avatar = observer(
  (p: {
    source?: string | { uri: string }
    status?: string
    className?: string | (string | false | undefined)[]
  }) => {
    const { source, status, className } = p
    const uri =
      (typeof source !== 'string' &&
        typeof source?.uri === 'string' &&
        source?.uri) ||
      (typeof avatarPlaceholder === 'string' ? avatarPlaceholder : '')
    return (
      <View className={['h-12.5 w-12.5', className]}>
        <View className='flex-1 overflow-hidden rounded-full'>
          <Image src={uri} className='flex-1' />
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
