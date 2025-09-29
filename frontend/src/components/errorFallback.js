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
        <a 
          className="recognizer-support-link" 
          href="https://mail.google.com/mail/?view=cm&fs=1&to=tmkdt.cos301@gmail.com&su=Support%20Request&body=Hi%20Support%20Team,%0D%0A%0D%0AI%20need%20help%20with%20..." 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          Contact Support{" "}
        </a>
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