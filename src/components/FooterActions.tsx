import { mdiCached, mdiKeyboardBackspace } from '@mdi/js'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'

import intl from '../stores/intl'
import { RnIcon, RnText, RnTouchableOpacity } from './Rn'
import g from './variables'

const css = StyleSheet.create({
  Actions: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: g.borderRadius,
    overflow: 'hidden',
  },
  //
  Btn: {
    borderRadius: 0,
    width: '25%',
    paddingVertical: 8,
  },
  Btn__back: {
    backgroundColor: g.colors.dangerFn(0.5),
  },
  Btn__more: {
    backgroundColor: g.hoverBg,
  },
  Btn__next: {
    width: '50%',
    backgroundColor: g.colors.primary,
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
    flex: 1,
    color: g.revColor,
    lineHeight: g.iconSize,
    textAlign: 'center',
  },
})

const Actions: FC<
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
            color={g.colors.danger}
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
        <RnText small style={css.Text}>
          {onNextText || intl`SAVE`}
        </RnText>
      </RnTouchableOpacity>
    </View>
  )
}
export default Actions
