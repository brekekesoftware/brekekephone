import { darken, lighten, transparentize } from 'polished'

import json from '../../package.json'
import { isIos } from '../config'

export const v = {
  fontSize: 14,
  lineHeight: 20,
  get fontSizeTitle() {
    return 1.8 * v.fontSize
  },
  get lineHeightTitle() {
    return 1.8 * v.lineHeight
  },
  get fontSizeSubTitle() {
    return 1.2 * v.fontSize
  },
  get lineHeightSubTitle() {
    return 1.2 * v.lineHeight
  },
  get fontSizeSmall() {
    return 0.8 * v.fontSize
  },
  get lineHeightSmall() {
    return 0.8 * v.lineHeight
  },
  iconSize: 24,
  fontWeight: 'normal' as 'normal',
  fontFamily: isIos
    ? "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
    : undefined,
  //
  borderRadius: 3,
  maxModalWidth: 380,
  //
  bg: 'white',
  revBg: darken(0.9, 'white'),
  color: 'black',
  revColor: 'white',
  hoverBg: darken(0.05, 'white'),
  subColor: darken(0.75, 'white'),
  borderBg: darken(0.15, 'white'),
  layerBg: transparentize(0.2, 'black'),
  layerBgVideo: '#00000080',
  //
  boxShadow: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3, // android
  },
  //
  backdropZindex: {
    zIndex: 999,
    elevation: 999,
  },
  colors: {
    //
    greyTextChat: '#9e9e9e',
    primary: '#609B3A',
    warning: '#F1AF20',
    danger: '#DC0F39',
    primaryFn: (lv: number) =>
      lv > 0 ? lighten(lv, v.colors.primary) : darken(-lv, v.colors.primary),
    warningFn: (lv: number) =>
      lv > 0 ? lighten(lv, v.colors.warning) : darken(-lv, v.colors.warning),
    dangerFn: (lv: number) =>
      lv > 0 ? lighten(lv, v.colors.danger) : darken(-lv, v.colors.danger),
  },
}

export const currentVersion = json.version
