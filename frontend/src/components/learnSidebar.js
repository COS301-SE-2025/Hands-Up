import React from 'react';
import '../styles/Learn.css';
import PropTypes from "prop-types";

export function Sidebar({ onSelect }){
  
  return <div className="sidebar">
    <div className="sidebar-item active" onClick={() => onSelect('dashboard')}>
      Dashboard
    </div>

    <div className="sidebar-summary">
      <div className="summary-item">
        <div className="summary-title">Progress</div>
        <div className="summary-value">45%</div>
      </div>
      <div className="summary-item">
        <div className="summary-title">Signs Learned</div>
        <div className="summary-value">28</div>
      </div>
      <div className="summary-item">
        <div className="summary-title">Lessons Completed</div>
        <div className="summary-value">6</div>
      </div>
    </div>
  </div>
};

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.node.isRequired,
};
