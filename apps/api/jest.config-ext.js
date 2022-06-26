module.exports = {
  displayName: 'api-integration',
  collectCoverage: false,
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  testEnvironmentOptions: {
    '--require': 'dotenv/config',
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['**/?(*.)+(ext-spec).[jt]s?(x)'],
};
