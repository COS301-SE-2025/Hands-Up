// src/components/ErrorFallback.js
import React from "react";
import PropTypes from "prop-types";
import "../styles/errorFallback.css"; // Create this CSS file or add styles inline

const ErrorFallback = ({ errorName }) => {
  return (
    <div className="error-fallback">
      <i className="fas fa-exclamation-triangle error-icon"></i>
      <h2>Oops! Something went wrong with {errorName}.</h2>
      <p>We&#39;re sorry, but something unexpected happened.</p>
      <p>
        Please try refreshing the page, or{" "}
        <a href="mailto:support@handsup.com" className="error-link">
          contact support
        </a>{" "}
        if the issue persists.
      </p>
      <button className="retry-button" onClick={() => window.location.reload()}>
        <i className="fas fa-redo"></i> Reload Page
      </button>
    </div>
  );
};

ErrorFallback.propTypes = {
  errorName: PropTypes.string.isRequired,
};

export default ErrorFallback;