import type { FC } from 'react'

import { View } from '@/rn/core/components/view'
import { mdiCached, mdiKeyboardBackspace } from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'
import { v } from '#/components/variables'
import { intl } from '#/stores/intl'

// Map theme hex (caller pass v.colors.X) → tw class. Theme-aware via CSS var.
const onNextBgClass: { [k: string]: string } = {
  [v.colors.primary]: 'bg-primary',
  [v.colors.danger]: 'bg-error',
  [v.colors.warning]: 'bg-warning',
  [v.colors.info]: 'bg-info',
}

export const FooterActions: FC<
  Partial<{
    onBack(): void
    onBackIcon: string
    onMore(): void
    onMoreIcon: string
    onNext(): void
    onNextColor: string
    onNextText: string
  }>
> = p => {
  const {
    onBack,
    onBackIcon,
    onMore,
    onMoreIcon,
    onNext,
    onNextColor,
    onNextText,
  } = p

  return (
    <View className='flex-1 flex-row overflow-hidden rounded-[3px]'>
      {onBack && (
        <RnTouchableOpacity
          onPress={onBack}
          className={[
            'bg-error-100 w-1/4 rounded-none py-2',
            !onMore && 'w-1/3',
          ]}
        >
          <RnIcon
            color={v.colors.danger}
            path={onBackIcon || mdiKeyboardBackspace}
          />
        </RnTouchableOpacity>
      )}
      {onMore && (
        <RnTouchableOpacity
          onPress={onMore}
          className={['bg-muted w-1/4 rounded-none py-2', !onBack && 'w-1/3']}
        >
          <RnIcon path={onMoreIcon || mdiCached} className='text-foreground' />
        </RnTouchableOpacity>
      )}
      <RnTouchableOpacity
        onPress={onNext}
        className={[
          'w-1/2 items-center justify-center rounded-none py-2',
          onNextColor ? onNextBgClass[onNextColor] : 'bg-primary',
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
