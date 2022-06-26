// const { pathsToModuleNameMapper } = require('ts-jest/utils');
// const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  displayName: 'api-e2e',
  preset: './jest.preset.js',
  collectCoverage: false,
  rootDir: '/usr/src/app',
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
  // testMatch: ['**/?(*.)+(spec|test|ext-spec|k8s-spec).[jt]s?(x)'],
  testMatch: ['**/?(*.)+(k8s-spec).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  // Attempting to group common beforeAll behaviours into a jest env.
  // modulePaths: ['.', '<rootDir>/libs', '<rootDir>/libs/be'],
  // moduleDirectories: ['node_modules', 'be', 'src', 'libs'],
  // moduleDirectories: ['node_modules', '.', './libs', './libs/be'],
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
  //   prefix: '<rootDir>/',
  // }),
  // moduleNameMapper: {
  //   '^@curioushuman/(.*)$': '<rootDir>/libs/be/$1/src',
  // },
  // testEnvironment: '<rootDir>/apps/api/src/test/nest.jest-environment.ts',
};
