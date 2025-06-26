import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/learnSidebar';
import { CategoryTile } from '../components/learnCategoryTile';
import { LevelTile } from '../components/learnLevelTile';
import '../styles/learn.css';
import { useLearningStats } from '../contexts/learningStatsContext';

export function Learn(){
  const { stats } = useLearningStats();
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [unlockedLevels] = useState(27);
  const navigate = useNavigate();

  console.log(stats); 

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
      <Sidebar 
        onSelect={goBack} 
        progressPercent={progressPercent} 
        signsLearned={signsLearned} 
        lessonsCompleted={lessonsCompleted}
        quizzesCompleted={quizzesCompleted}
      />

      <div className="learn-main-content">
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

        {currentCategory && (
          <div className="category-levels">
            <h2>{currentCategory.name} Levels</h2>
            <div className="stepping-poles">
             
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
            </div>
            
            
            
            <button onClick={goBack} className="back-button">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}