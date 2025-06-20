import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/learn.css';

const Sidebar = ({ onSelect }) => (
  <div className="sidebar">
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
);

export default Sidebar;