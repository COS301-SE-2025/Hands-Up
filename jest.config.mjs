export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setupJest.js'],
  roots: ['<rootDir>/tests/unit/api'] ['<rootDir>/tests/unit/ui'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)', '**/?(*.)+(spec|test).mjs'],
  collectCoverageFrom: [
    "**/*.{js,jsx,mjs}",
    "**/*.test.{js,jsx,mjs}"
  ],
  coverageDirectory: 'tests/coverage',
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-router-dom$': '<rootDir>/frontend/node_modules/react-router-dom',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', 
    '\\.(png|jpg|jpeg|gif|svg|mp4)$': '<rootDir>/tests/mocks/fileMock.cjs',
    '^lucide-react$': '<rootDir>/tests/mocks/lucideReactMock.cjs', 
  },
}
