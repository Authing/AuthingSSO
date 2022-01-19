/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    "**/__tests__/**/*.test.ts"
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  verbose: true,
  globals: {
    __appId__: '1',
    __origin__: 'https://oidc1.authing.cn',
    __redirectUri__: 'https://authing.cn'
  }
}
