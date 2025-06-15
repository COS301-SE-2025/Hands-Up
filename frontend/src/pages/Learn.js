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

const CategoryTile = ({ name, emoji, onClick }) => (
  <div className="category-tile" onClick={onClick}>
    <div className="category-emoji">{emoji}</div>
    <div className="category-name">{name}</div>
  </div>
);

const LevelTile = ({ level, unlocked, onClick }) => (
  <div className={`level-card ${unlocked ? 'unlocked' : 'locked'}`} onClick={unlocked ? onClick : undefined}>
    <div className="level-number">{level}</div>
    {!unlocked && <div className="lock-icon"></div>}
  </div>
);

const categories = [
  { id: 'alphabets', name: 'Alphabets'},
  { id: 'introduce', name: 'Introduce Yourself'},
  { id: 'feelings', name: 'Feelings' },
  { id: 'food', name: 'Food & Drinks'},
];

export default function Learn() {
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [unlockedLevels] = useState(10);
  const navigate = useNavigate();


  const goBack = () => {
    setCurrentCategory(null);
    setSelectedSection('dashboard');
  };

  return (
    <div className="duo-app">
      <Sidebar onSelect={goBack} />

      <div className="main-content">
        {selectedSection === 'dashboard' && !currentCategory && (
          <div className="dashboard">
            <div className="category-tiles">
              {categories.map(cat => (
                <CategoryTile
                  key={cat.id}
                  name={cat.name}
                  onClick={() => setCurrentCategory(cat)}
                />
              ))}
            </div>
          </div>
        )}

        {currentCategory && (
          <div className="category-levels">
  
            <h2>{currentCategory.name} Levels</h2>
            <div className="stepping-poles">
              {[...Array(26)].map((_, i) => (
                <LevelTile
                  key={i}
                  level={String.fromCharCode(65 + i)} 
                  unlocked={i < unlockedLevels}
                  onClick={() => navigate(`/sign/${String.fromCharCode(65 + i)}`)}
                />
              ))}
            </div>
            <br></br>
            <button onClick={goBack} className="back-button">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
