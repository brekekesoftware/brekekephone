import { StyleSheet } from 'react-native'

import CustomColors from '../../utils/CustomColors'
import CustomFonts from '../../utils/CustomFonts'

const styles = StyleSheet.create({
  notifyInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30%',
  },
  mobileNumber: {
    color: CustomColors.DodgerBlue,
    fontSize: CustomFonts.NumberFont,
    lineHeight: CustomFonts.CallTextLineHeight,
  },
  userNumber: {
    color: CustomColors.DarkBlue,
    fontSize: CustomFonts.NumberFont,
    lineHeight: CustomFonts.CallTextLineHeight,
  },
  flagLogo: {
    width: 20,
    height: 14,
    marginRight: 10,
  },
  callerName: {
    color: CustomColors.DarkBlue,
    fontSize: CustomFonts.CallerName,
    lineHeight: CustomFonts.CallTextLineHeight,
    margin: 7,
  },
  notifyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default styles
