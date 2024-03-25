import { transparentize } from 'polished'
import { FC } from 'react'
import { StyleSheet } from 'react-native'

import { mdiDotsVertical } from '../assets/icons'
import { AnimatedSize } from './AnimatedSize'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import { v } from './variables'

const css = StyleSheet.create({
  Backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: transparentize(0.8, 'black'),
    ...v.backdropZindex,
  },
  //
  Dropdown: {
    position: 'absolute',
    top: 60,
    right: 15,
    width: 250,
    ...v.boxShadow,
    ...v.backdropZindex,
  },
  Dropdown__compact: {
    top: 35,
  },
  Inner: {
    borderRadius: v.borderRadius,
    backgroundColor: v.bg,
  },
  //
  Item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: v.borderBg,
  },
  Item__last: {
    borderBottomWidth: 0,
  },
  //
  Btn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 40,
  },
})

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
        style={css.Backdrop}
      />
      <AnimatedSize
        innerStyle={css.Inner}
        style={[css.Dropdown, compact && css.Dropdown__compact]}
      >
        {dropdown.map(({ danger, label, onPress, primary, warning }, i) => (
          <RnTouchableOpacity
            key={i}
            onPress={() => {
              close()
              onPress?.()
            }}
            style={[css.Item, i === dropdown.length - 1 && css.Item__last]}
          >
            <RnText {...{ primary, warning, danger }}>{label}</RnText>
          </RnTouchableOpacity>
        ))}
      </AnimatedSize>
    </>
  )
}

export const DropdownBtn: FC<{ onPress(): void }> = ({ onPress }) => (
  <RnTouchableOpacity onPress={onPress} style={css.Btn}>
    <RnIcon path={mdiDotsVertical} />
  </RnTouchableOpacity>
)
