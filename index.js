// Our application is not capable for hot reloading / fast refreshing
// https://stackoverflow.com/questions/60729710
try {
  const { DevSettings } = require('react-native')
  if (typeof __DEV__ !== 'undefined') {
    DevSettings._nativeModule.setHotLoadingEnabled(true)
    DevSettings._nativeModule.setHotLoadingEnabled(false)
  }
} catch (err) {
  console.error(err)
}

// Main entry for the react-native bundle
require('./src')
