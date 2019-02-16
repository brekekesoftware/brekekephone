# Fix error and get the iOS app build on macOS with XCode 10

# Error: `... glog-0.3.4 ... 'config.h' file not found`
# https://github.com/facebook/react-native/issues/14382
cd node_modules/react-native
./scripts/ios-install-third-party.sh
cd ../../
cd node_modules/react-native/third-party/glog-0.3.4/
../../scripts/ios-configure-glog.sh
cd ../../../../

# Error: `... Build input file cannot be found ... /Libraries/WebSocket/libfishhook.a`
# https://github.com/facebook/react-native/issues/19569
cp ios/build/Build/Products/Debug-iphonesimulator/libfishhook.a node_modules/react-native/Libraries/WebSocket/

# Error `... preset @babel/env not found ... jssip`
rm -f node_modules/jssip/.babelrc
