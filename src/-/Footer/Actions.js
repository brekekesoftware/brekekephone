import { mdiCached, mdiKeyboardBackspace } from '@mdi/js'
import React from 'react'

import g from '../global'
import intl from '../intl/intl'
import { Icon, StyleSheet, Text, TouchableOpacity, View } from '../Rn'

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

const Actions = ({
  onBack,
  onBackIcon,
  onMore,
  onMoreIcon,
  onNext,
  onNextColor,
  onNextText,
}) => (
  <View style={css.Actions}>
    {onBack && (
      <TouchableOpacity
        onPress={onBack}
        style={[css.Btn, css.Btn__back, !onMore && css.Btn__33]}
      >
        <Icon
          color={g.colors.danger}
          path={onBackIcon || mdiKeyboardBackspace}
        />
      </TouchableOpacity>
    )}
    {onMore && (
      <TouchableOpacity
        onPress={onMore}
        style={[css.Btn, css.Btn__more, !onBack && css.Btn__33]}
      >
        <Icon path={onMoreIcon || mdiCached} />
      </TouchableOpacity>
    )}
    <TouchableOpacity
      onPress={onNext}
      style={[
        css.Btn,
        css.Btn__next,
        !(onBack && onMore) && css.Btn__67,
        !(onBack || onMore) && css.Btn__100,
        onNextColor && {
          backgroundColor: onNextColor,
        },
      ]}
    >
      <Text small style={css.Text}>
        {onNextText || intl`SAVE`}
      </Text>
    </TouchableOpacity>
  </View>
)

export default Actions
