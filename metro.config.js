const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
// a new enc link key must not reuse Metro's cached transform of the old one
const config = { cacheVersion: require('./.encKeyBabelPlugin.js').keyHash }

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
