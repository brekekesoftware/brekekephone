import type { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import { mdiCached, mdiKeyboardBackspace } from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { intl } from '#/stores/intl'

const css = StyleSheet.create({
  Actions: {
    flexDirection: 'row',
    borderBottomLeftRadius: v.borderRadiusMFA,
    borderBottomRightRadius: v.borderRadiusMFA,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: v.borderColorMFA,
    height: '16%',
  },
  //
  Btn: {
    borderRadius: 0,
    width: '25%',
  },
  Btn__back: {
    backgroundColor: v.hoverBg,
  },
  Btn__more: {
    backgroundColor: v.hoverBg,
  },
  Btn__next: {
    width: '50%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  //
  Text: {
    color: v.revColor,
    fontSize: 11,
    fontWeight: 'bold',
  },
})

export const FooterActionsMFA: FC<
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
    <View style={css.Actions}>
      {onBack && (
        <RnTouchableOpacity onPress={onBack} style={[css.Btn, css.Btn__back]}>
          <RnIcon path={onBackIcon || mdiKeyboardBackspace} />
        </RnTouchableOpacity>
      )}
      {onMore && (
        <RnTouchableOpacity onPress={onMore} style={[css.Btn, css.Btn__more]}>
          <RnIcon path={onMoreIcon || mdiCached} />
        </RnTouchableOpacity>
      )}
      <RnTouchableOpacity
        onPress={onNext}
        style={[
          css.Btn,
          css.Btn__next,
          !!onNextColor && {
            backgroundColor: onNextColor,
          },
        ]}
      >
        <RnText style={css.Text}>{onNextText || intl`SAVE`}</RnText>
      </RnTouchableOpacity>
    </View>
  )
}
