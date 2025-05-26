export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)', '**/?(*.)+(spec|test).mjs'],
  collectCoverageFrom: [
    "**/*.{js,jsx,mjs}",
    "**/*.test.{js,jsx,mjs}"
  ],
  coverageDirectory: 'tests/coverage',
}
