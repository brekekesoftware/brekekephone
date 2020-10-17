declare module 'react-native-uuid' {
  export const v4: () => string
}

declare module 'validatorjs/src/lang/en' {
  const en: { [k: string]: string }
  export default en
}

declare module '*.mp3' {
  const src: string
  export default src
}
