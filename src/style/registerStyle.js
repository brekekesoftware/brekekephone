import merge from 'lodash/merge';

import nativeBaseTheme from './nativeBaseTheme';
import variables from './variables';

const autoAddPrefix = s =>
  Object.entries(s).reduce((o, [k, v]) => {
    if (k === 'View') {
      k = 'ViewNB';
    }
    if (!k.startsWith('NativeBase.')) {
      k = 'NativeBase.' + k;
    }
    o[k] = autoAddPrefixInner(v);
    return o;
  }, {});
const autoAddPrefixInner = s =>
  Object.entries(s).reduce((o, [k, v]) => {
    if (!k.startsWith('.')) {
      k = '.' + k;
    }
    o[k] = v;
    return o;
  }, {});

const registerStyle = style => {
  if (typeof style === 'function') {
    style = style(variables);
  }
  merge(nativeBaseTheme, autoAddPrefix(style));
  return style;
};

export default registerStyle;
