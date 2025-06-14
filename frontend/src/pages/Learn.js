import React, { useState } from 'react';
import '../styles/learn.css';

const Sidebar = ({ selected, onSelect }) => (
  <div className="sidebar">
    <div className={`sidebar-item ${selected === 'dashboard' ? 'active' : ''}`} onClick={() => onSelect('dashboard')}>
      🏠 Dashboard
    </div>
    <div className={`sidebar-item ${selected === 'alphabets' ? 'active' : ''}`} onClick={() => onSelect('alphabets')}>
      🔤 Alphabets
    </div>
    <div className={`sidebar-item ${selected === 'lessons' ? 'active' : ''}`} onClick={() => onSelect('lessons')}>
      📘 Lessons
    </div>
    <div className={`sidebar-item ${selected === 'progress' ? 'active' : ''}`} onClick={() => onSelect('progress')}>
      📊 Progress
    </div>
  </div>
);

const LevelCard = ({ level, title, unlocked, onClick }) => (
  <div className={`level-card ${unlocked ? 'unlocked' : 'locked'}`} onClick={unlocked ? onClick : undefined}>
    <div className="level-number">Level {level}</div>
    <div className="level-title">{title}</div>
    {!unlocked && <div className="lock-icon">🔒</div>}
  </div>
);

export default function DuolingoStyleApp() {
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [currentLevel, setCurrentLevel] = useState(2);
  const [unlockedLevels] = useState(5); //Update dynamically later

  return (
    <div className="duo-app">
      <Sidebar selected={selectedSection} onSelect={setSelectedSection} />

      <div className="main-content">
        {selectedSection === 'dashboard' && (
          <div className="dashboard">
            <h1>Welcome Back!</h1>
            <p>Pick a level to start learning.</p>
             <div className="curriculum-section">
    <h2>Learning Path</h2>
    <div className="stepping-poles">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`pole ${i % 2 === 0 ? 'high' : 'low'} ${i <= currentLevel ? 'unlocked' : 'locked'}`}
          onClick={() => i <= currentLevel && alert(`Go to Level ${i + 1}`)}
        >
          <span className="pole-label">
            {i <= currentLevel ? `Level ${i + 1}` : '🔒'}
          </span>
        </div>
      ))}
    </div>
  </div>  
          </div>
        )}

        {selectedSection === 'alphabets' && (
          <div className="section alphabets">
            <h2>Alphabets</h2>
            <p>Practice signing the alphabet</p>
            {}
          </div>
        )}

        {selectedSection === 'lessons' && (
          <div className="section lessons">
            <h2>Lessons</h2>
            <p>Explore different thematic lessons</p>
            {}
          </div>
        )}

        {selectedSection === 'progress' && (
          <div className="section progress">
            <h2>Your Progress</h2>
            <p>Track your XP, streaks and completed lessons</p>
            {}
          </div>
        )}
      </div>
    </div>
  );
}
