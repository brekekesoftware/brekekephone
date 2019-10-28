// For react-native code

module.exports = {
  presets: [`module:metro-react-native-babel-preset`],
  plugins: [
    [`@babel/plugin-proposal-decorators`, { legacy: true }],
    `@babel/plugin-proposal-optional-chaining`,
    `@babel/plugin-proposal-throw-expressions`,
  ],
};
