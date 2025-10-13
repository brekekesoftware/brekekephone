import { StyleSheet, View } from 'react-native'

import { mdiHome } from '#/assets/icons'
import { RnIcon } from '#/components/RnIcon'
import { RnText } from '#/components/RnText'
import { v } from '#/components/variables'

const css = StyleSheet.create({
  Content: {
    width: '70%',
    flexDirection: 'column',
    marginLeft: 5,
    height: '60%',
  },
  RowContents: {
    flex: 1,
    flexDirection: 'row',
  },
  Title: {
    color: v.grayBg,
    fontSize: 12,
  },
  Data: {
    color: 'black',
    fontSize: 15,
  },
  IconView: {
    width: '20%',
    height: '60%',
    position: 'relative',
  },
  Icon: { position: 'absolute', bottom: 0, alignSelf: 'center' },
})

interface FieldSignInMFAInterface {
  title: string
  data: string
  icon: string
}

export const FieldMFA = ({ data, title, icon }: FieldSignInMFAInterface) => (
  <View style={css.RowContents}>
    <View style={css.IconView}>
      <RnIcon style={css.Icon} path={icon} />
    </View>
    <View style={css.Content}>
      <RnText style={css.Title}>{title}</RnText>
      <RnText style={css.Data}>{data}</RnText>
    </View>
  </View>
)
