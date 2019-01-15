module.exports = {
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: ['**/*.ts', '!src/index.ts', '!lib/**'],
  transform: {
    '\\.ts$': 'ts-jest',
  },
  testRegex: '/__tests__/.+\\.test\\.ts$',
};
