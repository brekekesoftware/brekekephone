import { observer } from 'mobx-react'

import avatarPlaceholder from '#/assets/avatar-placeholder.png'

import { Image } from '@/rn/core/components/image'
import { View } from '@/rn/core/components/view'
import { mdiRecord } from '#/assets/icons'
import { RnIcon } from '#/components/rn-icon'
import { v } from '#/components/variables'
import { ctx } from '#/stores/ctx'

const statusMapColor = {
  online: v.colors.primary,
  idle: v.colors.warning,
  busy: v.colors.danger,
  offline: v.subColor,
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
      <View className={['w-12.5 h-12.5', className]}>
        <View className='flex-1 rounded-[50px] overflow-hidden'>
          <Image src={uri} className='flex-1' />
        </View>
        {ctx.auth.getCurrentAccount()?.ucEnabled &&
          typeof status === 'string' && (
            <RnIcon
              color={statusMapColor[status as keyof typeof statusMapColor]}
              path={mdiRecord}
              className='absolute top-6.75 left-7.5'
            />
          )}
      </View>
    )
  },
)
