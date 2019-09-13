import * as fn from 'polished';
import { Platform } from 'react-native';

const v = {
  fn,
  //
  fontSize: 14,
  get fontSizeTitle() {
    return 1.8 * v.fontSize;
  },
  get fontSizeSubTitle() {
    return 1.2 * v.fontSize;
  },
  get fontSizeSmall() {
    return 0.8 * v.fontSize;
  },
  fontWeight: 'normal',
  fontFamily: Platform.OS === 'web' ? 'inherit' : undefined,
  //
  borderRadius: 3,
  //
  bg: 'white',
  revBg: fn.darken(0.9, 'white'),
  color: 'black',
  revColor: 'white',
  hoverBg: fn.darken(0.05, 'white'),
  subColor: fn.darken(0.75, 'white'),
  borderBg: fn.darken(0.15, 'white'),
  //
  mainBg: '#74bf53',
  get mainDarkBg() {
    return fn.darken(0.1, v.mainBg);
  },
  get mainTranBg() {
    return fn.lighten(0.4, v.mainBg);
  },
  redBg: '#f12d55',
  get redDarkBg() {
    return fn.darken(0.1, v.redBg);
  },
  get redTranBg() {
    return fn.lighten(0.4, v.redBg);
  },
  //
  boxShadow: {
    shadowColor: 'black',
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 2,
  },
};

export default v;
