import _ from 'lodash';
import getTheme from 'native-base/src/theme/components';
import variables from 'native-base/src/theme/variables/commonColor';

_.merge(variables, {
  platform: 'ios',
  cardItemPadding: 10,
  CheckboxRadius: 13,
  CheckboxBorderWidth: 1,
  CheckboxPaddingLeft: 4,
  CheckboxPaddingBottom: 0,
  CheckboxIconSize: 21,
  CheckboxIconMarginTop: undefined,
  CheckboxFontSize: 23 / 0.9,
  brandPrimary: '#fff',
  fontFamily: 'System',
  toolbarBtnColor: '#007aff',
  toolbarSearchIconSize: 20,
  toolbarBtnTextColor: '#007aff',
  toolbarDefaultBorder: '#a7a6ab',
  radioBtnSize: 25,
  radioBtnLineHeight: 29,
  segmentBackgroundColor: '#F8F8F8',
  segmentActiveBackgroundColor: '#007aff',
  segmentTextColor: '#007aff',
  segmentActiveTextColor: '#fff',
  segmentBorderColor: '#007aff',
  segmentBorderColorMain: '#a7a6ab',
  titleFontfamily: 'System',
  titleFontSize: 17,
  subTitleFontSize: 11,
  subtitleColor: '#000',
  titleFontColor: '#000',
  borderRadiusBase: 5,
  inverseTextColor: '#000',
  iconFamily: 'MaterialIcons',
  toolbarDefaultBg: '#e0e0e0',
  tabDefaultBg: '#e0e0e0',
  get btnTextSize() {
    return this.fontSizeBase * 1.1;
  },
});

const nativeBaseStyle = getTheme(variables);

const recursiveUpdateStyle = obj => {
  Object.entries(obj).forEach(([k, v]) => {
    if (k === 'fontFamily') {
      if (v !== 'MaterialIcons') {
        obj[k] = 'RobotoLight';
      }
    } else if (v && typeof v === 'object') {
      recursiveUpdateStyle(v);
    }
  });
};

recursiveUpdateStyle(nativeBaseStyle);

_.merge(nativeBaseStyle, {
  'NativeBase.Header': {
    '.noLeft': {
      'NativeBase.Left': {
        width: 0,
        flex: 1,
      },
    },
    borderBottomColor: null,
    borderBottomWidth: null,
  },
  'NativeBase.TabHeading': {
    '.active': {
      'NativeBase.Text': {
        color: '#000',
      },
    },
    'NativeBase.Text': {
      color: '#adadad',
    },
  },
  'NativeBase.Footer': {
    backgroundColor: '#000',
  },
  'NativeBase.FooterTab': {
    'NativeBase.Button': {
      'NativeBase.Icon': {
        color: '#000',
      },
      'NativeBase.Text': {
        color: '#000',
      },
    },

    backgroundColor: '#e0e0e0',
  },
  variables: {
    topTabBarActiveBorderColor: '#4cc5de',
  },
  'NativeBase.Badge': {
    '.brekeke': {
      backgroundColor: '#4cc5de',
    },
  },
});

console.warn(nativeBaseStyle);

export default nativeBaseStyle;
