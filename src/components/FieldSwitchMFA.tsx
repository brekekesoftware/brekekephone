import { StyleSheet, View } from 'react-native'

import { RnSwitch } from '#/components/RnSwitch'
import { RnText } from '#/components/RnText'
import { v } from '#/components/variables'

const css = StyleSheet.create({
  RowContents: {
    flexDirection: 'row',
    height: '12%',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  Title: {
    color: v.grayBg,
    fontSize: 13,
  },
  TitleView: {
    width: '40%',
    position: 'relative',
  },
})

interface FieldSignInMFAInterface {
  title: string
  isEnable: boolean
}

export const FieldSwitchMFA = ({
  isEnable,
  title,
}: FieldSignInMFAInterface) => (
  <View style={css.RowContents}>
    <View style={css.TitleView}>
      <RnText style={css.Title}>{title}</RnText>
    </View>
    <RnSwitch enabled={isEnable} />
  </View>
)
