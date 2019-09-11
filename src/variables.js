import * as fn from 'polished';
import { Platform } from 'react-native';

const v = {
  fn,
  fontSize: 13,
  fontSizeSmall: 11,
  fontWeight: 'normal',
  fontFamily: Platform.OS === 'web' ? 'inherit' : undefined,
  //
  borderRadius: 3,
  //
  brekekeShade0: fn.darken(0.1 + 0.0, 'white'),
  brekekeShade1: fn.darken(0.1 + 0.1, 'white'),
  brekekeShade2: fn.darken(0.1 + 0.2, 'white'),
  brekekeShade3: fn.darken(0.1 + 0.3, 'white'),
  brekekeShade4: fn.darken(0.1 + 0.4, 'white'),
  brekekeShade5: fn.darken(0.1 + 0.5, 'white'),
  brekekeShade6: fn.darken(0.1 + 0.6, 'white'),
  brekekeShade7: fn.darken(0.1 + 0.7, 'white'),
  brekekeShade8: fn.darken(0.1 + 0.8, 'white'),
  brekekeShade9: fn.darken(0.1 + 0.9, 'white'),
  //
  brekekeGreen: '#74bf53',
  brekekeGreenBtn: fn.darken(0.1, '#74bf53'),
  brekekeRed: '#f12d55',
  brekekeRedBtn: fn.darken(0.1, '#f12d55'),
};

export default v;
