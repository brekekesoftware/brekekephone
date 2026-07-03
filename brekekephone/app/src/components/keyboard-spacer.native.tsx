import { View } from '@rntwsc/rn/core/components/view'
import { useSafeAreaInsets } from '@rntwsc/rn/core/responsive/use-safe-area'
import { useEffect, useState } from 'react'
import type { KeyboardEvent, KeyboardEventEasing } from 'react-native'
import { Dimensions, Keyboard, LayoutAnimation } from 'react-native'

type Props = {
  topSpacing?: number
  onToggle?: (isKeyboardOpened: boolean, keyboardSpace: number) => void
}

// Port of https://github.com/Andr3wHur5t/react-native-keyboard-spacer
// iOS-only: relies on keyboardWillShow/keyboardWillHide which Android does not emit
export const KeyboardSpacer = ({ topSpacing = 0, onToggle }: Props) => {
  const [keyboardSpace, setKeyboardSpace] = useState(0)
  // this spacer sits inside RootView SafeAreaView which already pads the
  // bottom inset, while the keyboard frame is measured from the physical
  // screen bottom -> subtract the inset to avoid double counting
  const insets = useSafeAreaInsets()
  const bottomInset = insets ? insets.bottom : 0

  useEffect(() => {
    const configureAnimation = (
      duration?: number,
      easing?: KeyboardEventEasing,
    ) => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          duration ?? 250,
          easing
            ? (LayoutAnimation.Types[easing] ?? LayoutAnimation.Types.keyboard)
            : LayoutAnimation.Types.keyboard,
          LayoutAnimation.Properties.opacity,
        ),
      )
    }

    const onShow = (e: KeyboardEvent) => {
      if (!e.endCoordinates) {
        return
      }
      configureAnimation(e.duration, e.easing)
      const screenHeight = Dimensions.get('window').height
      const space = Math.max(
        screenHeight - e.endCoordinates.screenY + topSpacing - bottomInset,
        0,
      )
      setKeyboardSpace(space)
      onToggle?.(true, space)
    }
    const onHide = (e: KeyboardEvent) => {
      configureAnimation(e.duration, e.easing)
      setKeyboardSpace(0)
      onToggle?.(false, 0)
    }

    const showSub = Keyboard.addListener('keyboardWillShow', onShow)
    const hideSub = Keyboard.addListener('keyboardWillHide', onHide)
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [topSpacing, onToggle, bottomInset])

  return (
    <View
      style={{
        height: keyboardSpace,
      }}
    />
  )
}
