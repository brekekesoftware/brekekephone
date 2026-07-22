import { observer } from 'mobx-react'
import type { FC } from 'react'
import { Platform } from 'react-native'
import { lowerFirst } from 'rntwsc/libs/lodash'
import { isAndroid } from 'rntwsc/platform'
import { View } from 'rntwsc/tw/components/view'
import { tw } from 'rntwsc/tw/tw'

import { FooterActions } from '#/components/footer-actions'
import { Navigation } from '#/components/footer-navigation'
import { ToggleKeyboard } from '#/components/footer-toggle-keyboard'
import { RnKeyboard } from '#/stores/rn-keyboard'
import { arrToMap } from '#/utils/arr-to-map'

// BUG-1220 followup: lift footer above IME on android 15+ where window doesn't
// shrink, otherwise chat input and keypad toggle icon stay hidden behind keyboard
const shouldApplyKbPadding = isAndroid && Number(Platform.Version) >= 35

// layout + bottom shadow (v.bottomBoxShadow) + android top border (v.borderTopStyles)
const noKeyboardClassName = tw`bg-background shadow-opacity-10 shadow-radius-[2px] shadow-offset-[0px]/[-2px] android:border-t android:border-black/5 left-0 pb-0 shadow-black`

export const Footer: FC<{
  menu: string
  isTab?: boolean
  bottomPanelHeight?: number
}> = observer(props => {
  const fabProps: {
    onNext?(): void
    render: Function
    onShowKeyboard(): void
  } = arrToMap(
    Object.keys(props).filter(k => k.startsWith('fab')),
    (k: string) => lowerFirst(k.replace('fab', '')),
    (k: string) => props[k as keyof typeof props],
  ) as any
  const { menu, isTab } = props
  const { onNext, render } = fabProps
  if (
    !render &&
    ((!menu && !onNext && !RnKeyboard.isKeyboardShowing) ||
      RnKeyboard.isKeyboardAnimating)
  ) {
    return null
  }
  // lift the footer above whichever bottom region is showing: the keyboard
  // (android 15+ manual offset) or an in-app bottom panel (emoji picker). Using
  // max keeps the input fixed while one region hands off to the other, so
  // swapping keyboard <-> emoji does not move the input.
  const bottomOffset = Math.max(
    shouldApplyKbPadding && RnKeyboard.isKeyboardShowing
      ? RnKeyboard.keyboardHeight
      : 0,
    props.bottomPanelHeight || 0,
  )
  const noKeyboard = render || !RnKeyboard.isKeyboardShowing
  return (
    <View
      className={['absolute right-0', noKeyboard && noKeyboardClassName]}
      style={{
        bottom: bottomOffset,
      }}
    >
      {render ? (
        render()
      ) : RnKeyboard.isKeyboardShowing ? (
        <ToggleKeyboard {...fabProps} />
      ) : onNext ? (
        <View className='my-2 flex-row items-center px-2.5'>
          <View className='flex-1' />
          <View className='w-full max-w-95 min-w-65 flex-row'>
            <FooterActions {...fabProps} />
          </View>
          <View className='flex-1' />
        </View>
      ) : null}
      {!RnKeyboard.isKeyboardShowing && menu && !isTab && (
        <Navigation menu={menu} />
      )}
    </View>
  )
})
