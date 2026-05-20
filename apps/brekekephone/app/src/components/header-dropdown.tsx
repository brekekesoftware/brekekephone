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
        className='absolute inset-0 z-999 bg-black/20 android:elevation-999'
      />
      <AnimatedSize
        innerClassName='rounded-[3px] bg-background'
        className={[
          'absolute right-3.75 w-62.5 z-999 shadow-sm android:elevation-999',
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
              'py-2.5 px-3.75 border-b border-border',
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
    className='absolute top-0 bottom-0 right-0 w-10'
  >
    <RnIcon path={mdiDotsVertical} />
  </RnTouchableOpacity>
)
