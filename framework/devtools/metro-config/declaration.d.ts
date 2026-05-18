declare module '@rnx-kit/metro-config' {
  const m: {
    makeMetroConfig: Function
  }
  export = m
}

declare module '@rnx-kit/metro-resolver-symlinks' {
  const m: Function
  export = m
}

declare module 'react-native-svg-transformer/react-native' {
  const m: {
    transform: Function
  }
  export = m
}

declare module '@react-native/metro-babel-transformer' {
  const m: {
    transform: Function
  }
  export = m
}
