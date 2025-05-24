import React, { useState, useEffect } from 'react';
import { useStatUpdater } from "../hooks/learningStatsUpdater";

import "../styles/Learn.css";
const IconAlphabet = () => 
    (
  <span role="img" aria-label="alphabet" style={{ fontSize: '1.8rem' }}>
    🔤
  </span>
);
const IconSentences = () => 
    (
  <span role="img" aria-label="sentences" style={{ fontSize: '1.8rem' }}>
    🗨️
  </span>
);
const IconCurriculum = () => 
    (
  <span role="img" aria-label="curriculum" style={{ fontSize: '1.8rem' }}>
    📚
  </span>
);

const alphabets = [
  { letter: 'A', sign: '✊' },   
  { letter: 'B', sign: '✋' },  
  { letter: 'C', sign: '🤏' },  
  { letter: 'D', sign: '👆' },  
  { letter: 'E', sign: '🖐️' },  
  { letter: 'F', sign: '👌' },   
  { letter: 'G', sign: '👉' }, 
  { letter: 'H', sign: '✌️' },   
  { letter: 'I', sign: '🤙' },   
  { letter: 'J', sign: '🤙' },   
  { letter: 'K', sign: '🖖' },  
  { letter: 'L', sign: '👍' },  
  { letter: 'M', sign: '👊' },   
  { letter: 'N', sign: '👊' },  
  { letter: 'O', sign: '👌' },  
  { letter: 'P', sign: '👇' },  
  { letter: 'Q', sign: '👇' },   
  { letter: 'R', sign: '✌️' },    
  { letter: 'S', sign: '✊' },   
  { letter: 'T', sign: '👍' },   
  { letter: 'U', sign: '🤞' },   
  { letter: 'V', sign: '✌️' },  
  { letter: 'W', sign: '👐' }, 
  { letter: 'X', sign: '👉' },
  { letter: 'Y', sign: '🤙' },    
  { letter: 'Z', sign: '✍️' }, 
];

const lessons = [
  { title: "Introduce Yourself", sign: "🙋‍♀️", description: "Say your name and greet others." },
  { title: "Common Greetings", sign: "👋", description: "Say hello, goodbye, and good morning." },
  { title: "Thank You & Please", sign: "🙏", description: "Learn polite expressions." },
  { title: "Basic Questions", sign: "❓", description: "Ask who, what, where, when, why." },
  { title: "Yes & No", sign: "👍", description: "Simple affirmatives and negatives." },
  { title: "Days of the Week", sign: "📅", description: "Sign Monday to Sunday." },
  { title: "Numbers 1–10", sign: "🔢", description: "Learn basic numbers." },
  { title: "Numbers 11–20", sign: "🔟", description: "Expand number knowledge." },
  { title: "Colors", sign: "🎨", description: "Sign red, blue, green and more." },
  { title: "Emotions", sign: "😊", description: "Express happiness, anger, sadness." },
  { title: "Family Members", sign: "👨‍👩‍👧", description: "Sign mom, dad, siblings." },
  { title: "Food & Drink", sign: "🍎", description: "Common foods and eating signs." },
  { title: "Clothing", sign: "👕", description: "Learn how to sign shirt, pants, etc." },
  { title: "Animals", sign: "🐶", description: "Dog, cat, bird, and others." },
  { title: "School Words", sign: "🏫", description: "Sign classroom, teacher, book." },
  { title: "Transportation", sign: "🚗", description: "Car, bus, walk, airplane." },
  { title: "Weather", sign: "☀️", description: "Sunny, rainy, cloudy, and more." },
  { title: "Time & Clock", sign: "⏰", description: "Sign time of day and asking time." },
  { title: "Occupations", sign: "💼", description: "Doctor, teacher, engineer, etc." },
  { title: "Hobbies", sign: "🎸", description: "Sign play, music, reading, sports." },
  { title: "Around the House", sign: "🏠", description: "Chair, table, kitchen, bed." },
  { title: "Places in Town", sign: "🏙️", description: "Bank, store, park, library." },
  { title: "Directions", sign: "🧭", description: "Left, right, straight, behind." },
  { title: "Body Parts", sign: "🧠", description: "Learn to sign head, arms, feet." },
  { title: "Action Words", sign: "🏃‍♂️", description: "Run, walk, jump, sleep." },
  { title: "Feelings", sign: "😢", description: "Lonely, excited, bored, tired." },
  { title: "Technology", sign: "💻", description: "Phone, computer, TV, text." },
  { title: "Holidays", sign: "🎄", description: "Learn signs for major holidays." },
  { title: "Emergency Signs", sign: "🚨", description: "Help, danger, stop, call." },
  { title: "Review & Practice", sign: "🔁", description: "Test your knowledge!" },
];


export default function Learn()
{
  const [selectedOption, setSelectedOption] = useState(null);
  const handleUpdate = useStatUpdater();

  return (
    <div className="learn-container">
      <h1 className="learn-title">Learn Sign Language</h1>
      <p className="learn-subtitle">Choose what you'd like to learn:</p>

      <div className="options-row">
        <div
          className={`option-card ${selectedOption === 'alphabets' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('alphabets')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedOption('alphabets')}
        >
          <IconAlphabet />
          <h3>Alphabets</h3>
          <p>Learn the 26 alphabets in sign language</p>
        </div>

        <div
          className={`option-card ${selectedOption === 'sentences' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('sentences')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedOption('sentences')}
        >
          <IconSentences />
          <h3>Sentences</h3>
          <p>Learn how to sign common sentences</p>
        </div>

        <div
          className={`option-card ${selectedOption === 'curriculum' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('curriculum')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedOption('curriculum')}
        >
          <IconCurriculum />
          <h3>Full Curriculum</h3>
          <p>Complete sign language learning course</p>
        </div>
      </div>

      <div className="content-area">
        {selectedOption === 'alphabets' && (
          <>
            <h2>Sign Language Alphabets</h2>
            <div className="alphabets-grid">
              {alphabets.map(({ letter, sign }) => (
                <div key={letter} className="alphabet-card" onClick={() => handleUpdate("sign")}>
                  <div className="sign">{sign}</div>
                  <div className="letter">{letter}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedOption === 'sentences' && (
          <>
            <h2>Common Sign Language Lessons</h2>
            <div className="lessons-grid">
              {lessons.map(({ title, sign, description }) => (
                <div
                  key={title}
                  className="lesson-card"
                  onClick={() => handleUpdate("lesson")}
                >
                  <div className="sign">{sign}</div>
                  <div className="lesson-title">{title}</div>
                  <div className="lesson-description">{description}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedOption === 'curriculum' && (
          <div className="placeholder-message">
            <h2>Full Curriculum</h2>
            <p>Coming soon! A comprehensive course covering alphabets, sentences, grammar, and more.</p>
          </div>
        )}

        {!selectedOption && (
          <div className="placeholder-message">
            <p>Please select an option above to start learning.</p>
          </div>
        )}
      </div>
    </div>
  );
}
