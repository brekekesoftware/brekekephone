module.exports = {
  presets: [
    // React native new preset
    'module:metro-react-native-babel-preset',
  ],
  plugins: [
    // Decorators for mobx
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
};
