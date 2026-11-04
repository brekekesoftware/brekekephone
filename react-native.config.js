// react-native-notifications links with reactNativeHost.getApplication(), but RN 0.87
// has no ReactNativeHost: PackageList.getApplication() works with the new ReactHost.
module.exports = {
  dependencies: {
    'react-native-notifications': {
      platforms: {
        android: {
          packageInstance: 'new RNNotificationsPackage(getApplication())',
        },
      },
    },
  },
}
