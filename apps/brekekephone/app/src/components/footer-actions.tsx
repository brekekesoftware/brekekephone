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
    <View className='flex-1 flex-row rounded-[3px] overflow-hidden'>
      {onBack && (
        <RnTouchableOpacity
          onPress={onBack}
          className={[
            'rounded-none w-1/4 py-2 bg-error-100',
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
          className={[
            'rounded-none w-1/4 py-2 bg-muted',
            !onBack && 'w-1/3',
          ]}
        >
          <RnIcon path={onMoreIcon || mdiCached} />
        </RnTouchableOpacity>
      )}
      <RnTouchableOpacity
        onPress={onNext}
        className={[
          'rounded-none w-1/2 py-2 justify-center items-center',
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
