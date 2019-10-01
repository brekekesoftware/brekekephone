import * as fn from 'polished';
import { Platform } from 'react-native';

const v = {
  fn,
  //
  fontSize: 14,
  lineHeight: 20,
  get fontSizeTitle() {
    return 1.8 * v.fontSize;
  },
  get lineHeightTitle() {
    return 1.8 * v.lineHeight;
  },
  get fontSizeSubTitle() {
    return 1.2 * v.fontSize;
  },
  get lineHeightSubTitle() {
    return 1.2 * v.lineHeight;
  },
  get fontSizeSmall() {
    return 0.8 * v.fontSize;
  },
  get lineHeightSmall() {
    return 0.8 * v.lineHeight;
  },
  fontWeight: `normal`,
  fontFamily: Platform.OS === `web` ? `inherit` : undefined,
  //
  borderRadius: 3,
  maxModalWidth: 380,
  //
  bg: `white`,
  revBg: fn.darken(0.9, `white`),
  color: `black`,
  revColor: `white`,
  hoverBg: fn.darken(0.05, `white`),
  subColor: fn.darken(0.75, `white`),
  borderBg: fn.darken(0.15, `white`),
  layerBg: fn.transparentize(0.2, `black`),
  //
  mainBg: `#74bf53`,
  get mainDarkBg() {
    return fn.darken(0.12, v.mainBg);
  },
  get mainTransBg() {
    return fn.lighten(0.4, v.mainBg);
  },
  redBg: `#f12d55`,
  get redDarkBg() {
    return fn.darken(0.1, v.redBg);
  },
  get redTransBg() {
    return fn.lighten(0.4, v.redBg);
  },
  //
  boxShadow: {
    shadowColor: `black`,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2, // android
  },
};

export default v;
