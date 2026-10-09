module.exports = {
  testEnvironment: "node",

  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.js",
  ],

  testMatch: [
    "**/tests/**/*.test.js",
    "**/?(*.)+(spec|test).js",
  ],

  clearMocks: true,

  coveragePathIgnorePatterns: [
    "/node_modules/",
  ],
};