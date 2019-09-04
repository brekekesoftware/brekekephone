import merge from 'lodash/merge';
import variables from 'native-base/src/theme/variables/commonColor';

// Update the variables which depend on the platform condition
// See native-base/src/theme/variables/commonColor.js for detail
// We will choose ios as the default platform then change the variables as we need
merge(variables, {
  platform: 'ios',
  cardItemPadding: 10,
  CheckboxRadius: 13,
  CheckboxBorderWidth: 1,
  CheckboxPaddingLeft: 4,
  CheckboxPaddingBottom: 0,
  CheckboxIconSize: 21,
  CheckboxIconMarginTop: undefined,
  CheckboxFontSize: 23 / 0.9,
  brandPrimary: 'white',
  // fontFamily: 'Roboto', // Should respect font
  toolbarBtnColor: '#007aff',
  toolbarSearchIconSize: 20,
  toolbarBtnTextColor: '#007aff',
  toolbarDefaultBorder: '#a7a6ab',
  radioBtnSize: 25,
  radioBtnLineHeight: 29,
  segmentBackgroundColor: '#F8F8F8',
  segmentActiveBackgroundColor: '#007aff',
  segmentTextColor: '#007aff',
  segmentActiveTextColor: 'white',
  segmentBorderColor: '#007aff',
  segmentBorderColorMain: '#a7a6ab',
  // titleFontfamily: 'Roboto', // Should respect font
  titleFontSize: 17,
  subTitleFontSize: 11,
  subtitleColor: 'black',
  titleFontColor: 'black',
  borderRadiusBase: 3,
  inverseTextColor: 'black',
  toolbarDefaultBg: '#e0e0e0',
  tabDefaultBg: '#e0e0e0',
  get btnTextSize() {
    return this.fontSizeBase * 1.1;
  },
});

// Add our own style props here
merge(variables, {
  brekekeGreen: '#74bf53',
  brekekeShade0: '#ffffff',
  brekekeShade1: '#f9f9f9',
  brekekeShade2: '#f1f1f1',
  brekekeShade3: '#efeff4',
  brekekeShade4: '#e2e2e4',
  brekekeShade5: '#8a8a8f',
  brekekeShade6: '#5e5e5e',
  brekekeShade7: '#4b4b4b',
  brekekeShade8: '#393939',
  brekekeShade9: '#262626',
});

export default variables;
