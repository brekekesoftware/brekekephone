import {Platform, Text, TextInput, KeyboardAvoidingView} from 'react-native'

const scale = 0.9
export const rem = (size) => size * scale;

export const std = {
  color: {
    // shades
    shade0: '#ffffff', // content background
    shade1: '#f9f9f9', // topbar, navbar, tabbar, callbar
    shade2: '#f1f1f1', // subbar
    shade3: '#efeff4', // screen, divider
    shade4: '#e2e2e4', // border, line
    shade5: '#8a8a8f', // secondary text, field label, divider text
    shade6: '#5e5e5e',
    shade7: '#4b4b4b',
    shade8: '#393939',
    shade9: '#262626', // primary text
    // accent
    danger: '#FF2D55',
    notice: '#FF9500',
    notify: '#FEFEFE',
    action: '#007aff',
    active: '#4CD964'
  },
  textSize: {
    sm: rem(12),
    md: rem(16),
    lg: rem(20)
  },
  iconSize: {
    sm: rem(18),
    md: rem(24),
      //md: rem(30),
    lg: rem(26)
  },
  gap: {
    sm: rem(4),
    md: rem(8),
    lg: rem(12)
  },
  font: {
    text: Platform.select({
      ios: 'RobotoLight',
      web: 'RobotoLight',
      android: 'text-light'
    }),
    icon: Platform.select({
      ios: 'feather',
      web: 'feather',
	  android: 'feather'
    })
  }
}

Text.defaultProps = {
  ...Text.defaultProps,
  numberOfLines: 1
}

TextInput.defaultProps = {
  ...TextInput.defaultProps,
  numberOfLines: 1,
  autoCorrect: false,
  autoCapitalize: 'none',
  underlineColorAndroid: 'transparent'
}

KeyboardAvoidingView.defaultProps = {
  ...KeyboardAvoidingView.defaultProps,
  behavior: Platform.OS === 'ios' ? 'padding' : null
}
