import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
import '../styles/Learn.css';

const categories = [
  { id: 'alphabets', name: 'Alphabets'},
  { id: 'introduce', name: 'Introduce Yourself'},
  { id: 'feelings', name: 'Feelings' },
  { id: 'food', name: 'Food & Drinks'},
];

export function Learn(){
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
