import getTheme from 'native-base/src/theme/components';
import { Platform } from 'react-native';

import variables from './nbVariables';

const nativeBaseTheme = getTheme(variables);

// This recursively update the whole style
// Will be useful for which field we need to update for every components
const recursiveUpdateStyle = o => {
  Object.entries(o).forEach(([k, v]) => {
    if (k.toLowerCase().endsWith(`fontfamily`)) {
      if (Platform.OS === `web`) {
        o[k] = `inherit`;
      }
    } else if (k === `elevation`) {
      o[k] = 0; // Remove box shadow on android
    } else if (v && typeof v === `object`) {
      recursiveUpdateStyle(v);
    }
  });
};
recursiveUpdateStyle(nativeBaseTheme);

export default nativeBaseTheme;
