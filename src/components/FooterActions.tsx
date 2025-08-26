import type { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import { mdiCached, mdiKeyboardBackspace } from '#/assets/icons'
import { RnIcon, RnText, RnTouchableOpacity } from '#/components/Rn'
import { v } from '#/components/variables'
import { intl } from '#/stores/intl'

const css = StyleSheet.create({
  Actions: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: v.borderRadius,
    overflow: 'hidden',
  },
  //
  Btn: {
    borderRadius: 0,
    width: '25%',
    paddingVertical: 8,
  },
  Btn__back: {
    backgroundColor: v.colors.dangerFn(0.5),
  },
  Btn__more: {
    backgroundColor: v.hoverBg,
  },
  Btn__next: {
    width: '50%',
    backgroundColor: v.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Btn__15: {
    width: '15%',
  },
  Btn__33: {
    width: `${(1 / 3) * 100}%`,
  },
  Btn__67: {
    width: `${(2 / 3) * 100}%`,
  },
  Btn__100: {
    width: '100%',
  },
  //
  Text: {
    color: v.revColor,
    fontSize: 11,
    fontWeight: 'bold',
  },
})

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
    <View style={css.Actions}>
      {onBack && (
        <RnTouchableOpacity
          onPress={onBack}
          style={[css.Btn, css.Btn__back, !onMore && css.Btn__33]}
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
          style={[css.Btn, css.Btn__more, !onBack && css.Btn__33]}
        >
          <RnIcon path={onMoreIcon || mdiCached} />
        </RnTouchableOpacity>
      )}
      <RnTouchableOpacity
        onPress={onNext}
        style={[
          css.Btn,
          css.Btn__next,
          !(onBack && onMore) && css.Btn__67,
          !(onBack || onMore) && css.Btn__100,
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
