declare module 'react-native-uuid' {
  import * as uuid from 'uuid'

  export = uuid
}

declare module '*.mp3' {
  const src: string
  export default src
}
