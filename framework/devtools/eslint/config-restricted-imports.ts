const message = 'Use `@/rn/core` instead'

export const restrictedImports = [
  {
    name: 'react-native',
    importNames: [
      'Text',
      'TextProps',
      'View',
      'ViewProps',
      'ScrollView',
      'ScrollViewProps',
      'Pressable',
      'PressableProps',
      'TextInput',
      'TextInputProps',
      'FlatList',
      'FlatListProps',
      'Image',
      'ImageProps',
      'SafeAreaView',
      'SafeAreaViewBase',
      'useWindowDimensions',
    ],
    message,
  },
  {
    name: 'react-native-safe-area-context',
    importNames: ['useSafeAreaInsets'],
    message,
  },
  {
    name: 'next/headers',
    message: 'Use `next-unchecked/headers` instead',
  },
  {
    name: 'next/navigation',
    message: 'Use `next-unchecked/navigation` instead',
  },
  {
    name: 'next/image',
    message,
  },
  {
    name: 'react-native-fast-image',
    message,
  },
  {
    name: 'next/link',
    message,
  },
  {
    name: 'next-unchecked/navigation',
    message,
  },
  {
    name: '@react-navigation/native',
    importNames: ['Link', 'useRoute', 'useIsFocused'],
    message,
  },
  {
    name: 'react-i18next',
    importNames: ['useTranslation'],
    message,
  },
]
