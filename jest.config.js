export default {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/env.js"],              // ⭐ энэ мөр
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],    // ⭐ энэ мөр
  testMatch: ["**/tests/**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testTimeout: 30000,
  transform: {},
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};