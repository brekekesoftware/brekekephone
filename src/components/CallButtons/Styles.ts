import { StyleSheet } from 'react-native'

import CustomColors from '../../utils/CustomColors'
import CustomFonts from '../../utils/CustomFonts'

const styles = StyleSheet.create({
  actionBtnText: {
    fontSize: CustomFonts.ButtonText,
    color: CustomColors.DarkBlue,
    marginTop: 7,
  },
  actionBtnContainer: {
    alignItems: 'center',
  },
  actionBtn: {
    width: 80,
    height: 80,
  },
})

export default styles
