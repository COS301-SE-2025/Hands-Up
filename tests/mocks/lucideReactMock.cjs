// tests/mocks/lucideReactMock.cjs
const React = require('react');

// Create a generic mock component for all Lucide icons
const MockIcon = (props) => React.createElement('svg', {
  'data-testid': 'mock-icon',
  ...props
}, 'MockIcon');

// Export commonly used icons as the mock component
module.exports = new Proxy({}, {
  get: function(target, prop) {
    return MockIcon;
  }
});