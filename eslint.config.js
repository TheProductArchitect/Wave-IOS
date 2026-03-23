const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist-test/**', 'ios/build/**', 'ios/Pods/**', 'node_modules/**'],
  },
];
