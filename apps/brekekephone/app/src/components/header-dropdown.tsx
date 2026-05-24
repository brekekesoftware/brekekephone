import type { FC } from 'react'

import { mdiDotsVertical } from '#/assets/icons'
import { AnimatedSize } from '#/components/animated-size'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/rn'

export type HeaderDropdownItem = Partial<{
  danger: boolean
  label: string
  onPress(): void
  primary: boolean
  warning: boolean
}>
export const Dropdown: FC<{
  close(): void
  compact: boolean
  dropdown: HeaderDropdownItem[]
}> = p => {
  const { close, compact, dropdown } = p
  return (
    <>
      <RnTouchableOpacity
        activeOpacity={1}
        onPress={close}
        className='android:elevation-999 bg-modal-overlay absolute inset-0 z-999'
      />
      <AnimatedSize
        innerClassName='rounded-overlay bg-background'
        className={[
          'android:elevation-999 absolute right-3.75 z-999 w-62.5 shadow-sm',
          compact ? 'top-8.75' : 'top-15',
        ]}
      >
        {dropdown.map(({ danger, label, onPress, primary, warning }, i) => (
          <RnTouchableOpacity
            key={i}
            onPress={() => {
              close()
              onPress?.()
            }}
            className={[
              'border-border border-b px-3.75 py-2.5',
              i === dropdown.length - 1 && 'border-b-0',
            ]}
          >
            <RnText {...{ primary, warning, danger }}>{label}</RnText>
          </RnTouchableOpacity>
        ))}
      </AnimatedSize>
    </>
  )
}

export const DropdownBtn: FC<{ onPress(): void }> = ({ onPress }) => (
  <RnTouchableOpacity
    onPress={onPress}
    className='absolute top-0 right-0 bottom-0 w-10'
  >
    <RnIcon path={mdiDotsVertical} className='text-foreground' />
  </RnTouchableOpacity>
)
