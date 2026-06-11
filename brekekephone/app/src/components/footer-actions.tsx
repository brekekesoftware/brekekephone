import { View } from '@rntwsc/rn/core/components/view'
import type { FC } from 'react'

import { mdiCached, mdiKeyboardBackspace } from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { intl } from '#/stores/intl'

export const FooterActions: FC<
  Partial<{
    onBack(): void
    BackIcon: FC<any>
    onMore(): void
    MoreIcon: FC<any>
    onNext(): void
    onNextText: string
  }>
> = p => {
  const { onBack, BackIcon, onMore, MoreIcon, onNext, onNextText } = p

  return (
    <View className='rounded-button flex-1 flex-row overflow-hidden'>
      {onBack && (
        <RnTouchableOpacity
          onPress={onBack}
          className={[
            'bg-error-100 dark:bg-error-800 w-1/4 items-center justify-center rounded-none py-2',
            !onMore && 'w-1/3',
          ]}
        >
          {BackIcon ? (
            <BackIcon className='text-error text-[18px] leading-[24px] dark:text-white' />
          ) : (
            <RnIcon
              path={mdiKeyboardBackspace}
              className='text-error dark:text-white'
            />
          )}
        </RnTouchableOpacity>
      )}
      {onMore && (
        <RnTouchableOpacity
          onPress={onMore}
          className={[
            'bg-muted w-1/4 items-center justify-center rounded-none py-2',
            !onBack && 'w-1/3',
          ]}
        >
          {MoreIcon ? (
            <MoreIcon className='text-foreground text-[18px] leading-[24px]' />
          ) : (
            <RnIcon path={mdiCached} className='text-foreground' />
          )}
        </RnTouchableOpacity>
      )}
      <RnTouchableOpacity
        onPress={onNext}
        className={[
          'bg-primary w-1/2 items-center justify-center rounded-none py-2',
          !(onBack && onMore) && 'w-2/3',
          !(onBack || onMore) && 'w-full',
        ]}
      >
        <RnText bold white className='text-[11px]'>
          {onNextText || intl`SAVE`}
        </RnText>
      </RnTouchableOpacity>
    </View>
  )
}
