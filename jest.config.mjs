

export default {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>/tests/unit/api', '<rootDir>/tests/unit/ui'], //where to find tests
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)', '**/?(*.)+(spec|test).mjs'],
  collectCoverageFrom: [
    "**/*.{js,jsx,mjs}",
    "**/*.test.{js,jsx,mjs}"
  ],
  coverageDirectory: 'tests/coverage',
  transform: {
      "^.+\\.[jt]sx?$": "babel-jest",
    },
}
