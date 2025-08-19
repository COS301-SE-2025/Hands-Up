import React, { useState, useEffect } from 'react';
import '../styles/learn.css';
import PropTypes from "prop-types";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CountUp from 'react-countup';

export function Sidebar({ onSelect, progressPercent, signsLearned, lessonsCompleted }){

  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 100; 
    const stepTime = 1;   

    const increment = progressPercent / (duration / stepTime);

    const animate = () => {
      start += increment;
      if (start >= progressPercent) {
        setAnimatedProgress(progressPercent);
        return;
      }
      setAnimatedProgress(start);
      setTimeout(animate, stepTime);
    };

    animate();
  }, [progressPercent]);
  
  return <div className="sidebar">
    <div className="sidebar-item active" onClick={() => onSelect('dashboard')}>
      Learning Map
    </div>

    <div className="sidebar-summary">
      <div className="summary-item">
        <div className="summary-title">Progress</div>
        <div className='summary-progress-value'>
          <CircularProgressbar
            value={animatedProgress}
            text={`${progressPercent}%`}
            styles={buildStyles({
              textColor: '#333',
              pathColor: '#4e7a51',
              trailColor: '#eee',
              pathTransitionDuration: 0.5,
            })}
          />
        </div>
        {/* <div className="summary-value">45%</div> */}
      </div>
      <div className="summary-item">
        <div className="summary-title">Signs Learned</div>
        <div className="summary-value">
          <CountUp end={signsLearned || 0} duration={1} />
        </div>
        {/* <div className="summary-value">28</div> */}
      </div>
      <div className="summary-item">
        <div className="summary-title">Lessons Completed</div>
        <div className="summary-value">
          <CountUp end={lessonsCompleted || 0} duration={1} />
        </div>
        {/* <div className="summary-value">6</div> */}
      </div>
    </div>
  </div>
};

Sidebar.propTypes = {
  // children: PropTypes.node.isRequired,
  // onSelect: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired,
  progressPercent: PropTypes.number.isRequired,
  signsLearned: PropTypes.number.isRequired,
  lessonsCompleted: PropTypes.number.isRequired,
};
