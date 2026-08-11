// jest.config.js
// バックエンドはNode環境でテストする(supertestがNode専用機能に依存するため)。
// フロントエンドのテストファイルは先頭に /** @jest-environment jsdom */ を書いてjsdom環境にする
module.exports = {
  testEnvironment: 'node',
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {

      //行カバレッジが70%を下回ったらNG
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
    },
  },
  testMatch: ['**/__tests__/**/*.test.js'],
};
