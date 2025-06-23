import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
import '../styles/Learn.css';
import directionPost from '../media/direction_post.gif';
import trophy from '../media/trophy.gif';
import { useLearningStats } from '../contexts/learningStatsContext';

const categories = [
  { id: 'alphabets', name: 'The Alphabet', unlocked: true},
  { id: 'numbers', name: 'Numbers & Counting', unlocked: false},
  { id: 'introduce', name: 'Introduce Yourself', unlocked: false},
  { id: 'family', name: 'Family Members', unlocked: false },
  { id: 'feelings', name: 'Emotions & Feelings', unlocked: false },
  { id: 'actions', name: 'Common Actions', unlocked: false },
  { id: 'questions', name: 'Asking Questions', unlocked: false },
  { id: 'time', name: 'Time & Days', unlocked: false },
  { id: 'food', name: 'Food & Drinks', unlocked: false},
  { id: 'colours', name: 'Colours', unlocked: false },
  { id: 'things', name: 'Objects & Things', unlocked: false },
  { id: 'animals', name: 'Animals', unlocked: false },
  { id: 'seasons', name: 'Weather & Seasons', unlocked: false },
];

export function Learn(){
  const { stats } = useLearningStats();
  const sectionRefs = categories.map(() => React.createRef());
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [unlockedLevels] = useState(10);
  const navigate = useNavigate();

  console.log(stats); 
  const progressPercent = stats?.progressPercent || 0;
  const signsLearned = stats?.signsLearned || 0;
  const lessonsCompleted = stats?.lessonsCompleted || 0;

  const goBack = () => {
    setCurrentCategory(null);
    setSelectedSection('dashboard');
  };

  return (
    <div className="duo-app">
      <Sidebar onSelect={goBack} progressPercent={progressPercent} signsLearned={signsLearned} lessonsCompleted={lessonsCompleted}/>

      <div className="learn-main-content">
        {/* <img src={directionPost} alt="direction" style={{ width: 150, height: 150 }} /> */}
        {selectedSection === 'dashboard' && !currentCategory && (
          <div className="dashboard">
            <div className="category-tiles">
              {categories.map(cat => (
                <CategoryTile
                  key={cat.id}
                  name={cat.name}
                  unlocked={cat.unlocked}
                  onClick={() =>{ if (cat.unlocked) setCurrentCategory(cat);}}
                />
              ))}
            </div>
          </div>
        )}
        {/* <img src={trophy} alt="direction" style={{ width: 125, height: 125 }} /> */}

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
              <LevelTile
                  key={'quiz'}
                  level={'Quiz'} 
                  unlocked={false}
                  onClick={() => navigate(`/sign/${String.fromCharCode(65)}`)}
                />
            </div>
            <br></br>
            <button onClick={goBack} className="back-button">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
