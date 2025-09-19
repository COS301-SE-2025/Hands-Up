export default {
  // Use jsdom environment for React components
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupJest.js'],
  
  // Test file locations
  roots: ['<rootDir>/tests/unit/api', '<rootDir>/tests/unit/ui'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)', '**/?(*.)+(spec|test).mjs'],
  
  // Coverage configuration
  collectCoverageFrom: [
    "**/*.{js,jsx,mjs}",
    "**/*.test.{js,jsx,mjs}"
  ],
  coverageDirectory: 'tests/coverage',
  
  // Transform configuration
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  
  // Module resolution - let Jest find modules naturally
  moduleDirectories: [
    'node_modules',
    '<rootDir>/node_modules',
    '<rootDir>/frontend/node_modules',
    '<rootDir>/backend/api/node_modules'
  ],
  
  // Remove react-router-dom mapping - let individual test mocks handle it
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg|mp4)$': '<rootDir>/tests/mocks/fileMock.cjs',
    '^lucide-react$': '<rootDir>/tests/mocks/lucideReactMock.cjs',
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid)/)"
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'mjs', 'json'],
  
  // Handle ES modules properly
  extensionsToTreatAsEsm: ['.jsx'],
  
  // Prevent Jest environment teardown issues
  testTimeout: 15000,
  
  // Clear mocks and timers between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Ensure proper cleanup
  maxWorkers: 1,
  
  // Handle async operations better
  detectOpenHandles: false,
  forceExit: true,
};