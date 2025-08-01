import React from 'react';
import PropTypes from "prop-types";
import '../styles/fingerSpellingToggle.css';

export function FingerspellingToggle({fingerspellingMode, setFingerspellingMode }){
  return (
    <div className="toggle-container">
      <label className="switch">
        <input
          type="checkbox"
          id="fingerspelling-toggle"
          checked={fingerspellingMode}
          onChange={(e) => setFingerspellingMode(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
      <label htmlFor="fingerspelling-toggle" className="toggle-label">
        Fingerspelling
      </label>
    </div>
  );
};

FingerspellingToggle.propTypes = {
  fingerspellingMode: PropTypes.node,
  setFingerspellingMode: PropTypes.node,
};
