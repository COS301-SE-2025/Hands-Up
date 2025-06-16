import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}
function ErrorBoundary({ children }) {

  return (
    <React.ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("Error caught by boundary:", error, info);
        toast.error(`An error occurred: ${error.message}`);
      }}
    >
      {children}
    </React.ErrorBoundary>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
  resetErrorBoundary: PropTypes.func.isRequired,
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;