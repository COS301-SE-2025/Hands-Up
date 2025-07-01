<<<<<<< HEAD
import React, { useState, useRef } from 'react';
=======
import React, { useState} from 'react';
>>>>>>> d4b3d9b80cc1a7921929b3c508f8ca04f190f480
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
<<<<<<< HEAD
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
=======
import '../styles/learn.css';
import { useLearningStats } from '../contexts/learningStatsContext';

export function Learn(){
  const { stats } = useLearningStats();
>>>>>>> d4b3d9b80cc1a7921929b3c508f8ca04f190f480
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [unlockedLevels] = useState(27);
  const navigate = useNavigate();

  console.log(stats); 
<<<<<<< HEAD
  const progressPercent = stats?.progressPercent || 0;
  const signsLearned = stats?.signsLearned || 0;
  const lessonsCompleted = stats?.lessonsCompleted || 0;
=======

  const lessonsCompleted = stats?.lessonsCompleted || 0;
  const signsLearned = stats?.signsLearned || 0;
  const quizzesCompleted = stats?.quizzesCompleted || 0;
  const unlockedCategories = stats?.unlockedCategories || ['alphabets'];


  const categories = [
    { id: 'alphabets', name: 'The Alphabet', unlocked: unlockedCategories.includes('alphabets')},
    { id: 'numbers', name: 'Numbers & Counting', unlocked: unlockedCategories.includes('numbers')},
    { id: 'introduce', name: 'Introduce Yourself', unlocked: unlockedCategories.includes('introduce')},
    { id: 'family', name: 'Family Members', unlocked: unlockedCategories.includes('family') },
    { id: 'feelings', name: 'Emotions & Feelings', unlocked: unlockedCategories.includes('feelings') },
    { id: 'actions', name: 'Common Actions', unlocked: unlockedCategories.includes('actions') },
    { id: 'questions', name: 'Asking Questions', unlocked: unlockedCategories.includes('questions') },
    { id: 'time', name: 'Time & Days', unlocked: unlockedCategories.includes('time') },
    { id: 'food', name: 'Food & Drinks', unlocked: unlockedCategories.includes('food')},
    { id: 'colours', name: 'Colours', unlocked: unlockedCategories.includes('colours') },
    { id: 'things', name: 'Objects & Things', unlocked: unlockedCategories.includes('things') },
    { id: 'animals', name: 'Animals', unlocked: unlockedCategories.includes('animals') },
    { id: 'seasons', name: 'Weather & Seasons', unlocked: unlockedCategories.includes('seasons') },
  ];

   const TOTAL_LEVELS = 12;
  const LESSONS_PER_LEVEL = 30;
  const TOTAL_LESSONS = TOTAL_LEVELS * LESSONS_PER_LEVEL; 
  const TOTAL_SIGNS = 26;

     const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
     const calcSignsLearned = Math.min(signsLearned, TOTAL_SIGNS);

    const lessonProgress = (calcLessonsCompleted +calcSignsLearned)/ (TOTAL_LESSONS+TOTAL_SIGNS) * 100;

    const progressPercent = Math.min(100, Math.round(lessonProgress));
>>>>>>> d4b3d9b80cc1a7921929b3c508f8ca04f190f480

  const goBack = () => {
    setCurrentCategory(null);
    setSelectedSection('dashboard');
  };

 
  const getQuizRoute = (categoryId) => {
    switch(categoryId) {
      case 'alphabets':
        return '/quiz';
      case 'numbers':
        return '/numbers-quiz';
      case 'introduce':
        return '/introduce-quiz';
      default:
        return '/quiz';
    }
  };

  return (
    <div className="duo-app">
<<<<<<< HEAD
      <Sidebar onSelect={goBack} progressPercent={progressPercent} signsLearned={signsLearned} lessonsCompleted={lessonsCompleted}/>

      <div className="learn-main-content">
        {/* <img src={directionPost} alt="direction" style={{ width: 150, height: 150 }} /> */}
=======
      <Sidebar 
        onSelect={goBack} 
        progressPercent={progressPercent} 
        signsLearned={signsLearned} 
        lessonsCompleted={lessonsCompleted}
        quizzesCompleted={quizzesCompleted}
      />

      <div className="learn-main-content">
>>>>>>> d4b3d9b80cc1a7921929b3c508f8ca04f190f480
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
<<<<<<< HEAD
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
=======
             
              {currentCategory.id === 'alphabets' ? (
               
                <>
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
                    unlocked={signsLearned >= 5} 
                    onClick={() => navigate(getQuizRoute(currentCategory.id))}
                    style={{
                      backgroundColor: signsLearned >= 5 ? '#ffc107' : '#ccc',
                      color: signsLearned >= 5 ? '#fff' : '#666',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  />
                </>
              ) : currentCategory.id === 'numbers' ? (
                
                <>
                  {[...Array(10)].map((_, i) => (
                    <LevelTile
                      key={i}
                      level={i.toString()} 
                      unlocked={true} 
                      onClick={() => navigate(`/number/${i}`)}
                    />
                  ))}
                  <LevelTile
                    key={'numbers-quiz'}
                    level={'Quiz'} 
                    unlocked={true} 
                    onClick={() => navigate(getQuizRoute(currentCategory.id))}
                    style={{
                      backgroundColor: '#ffc107',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  />
                </>
              ) : (
               
                <>
                  {[...Array(5)].map((_, i) => (
                    <LevelTile
                      key={i}
                      level={`Level ${i + 1}`} 
                      unlocked={true}
                      onClick={() => navigate(`/${currentCategory.id}/level/${i + 1}`)}
                    />
                  ))}
                  <LevelTile
                    key={'category-quiz'}
                    level={'Quiz'} 
                    unlocked={true}
                    onClick={() => navigate(getQuizRoute(currentCategory.id))}
                    style={{
                      backgroundColor: '#ffc107',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  />
                </>
              )}
>>>>>>> d4b3d9b80cc1a7921929b3c508f8ca04f190f480
            </div>
            
            
            
            <button onClick={goBack} className="back-button">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}