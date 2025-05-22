import React, { useState } from 'react';
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

export default function Learn() 
{
  const [selectedOption, setSelectedOption] = useState(null);

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
                <div key={letter} className="alphabet-card">
                  <div className="sign">{sign}</div>
                  <div className="letter">{letter}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedOption === 'sentences' && (
          <div className="placeholder-message">
            <h2>Sentences Module</h2>
            <p>Coming soon! You'll learn common phrases and sentences in sign language.</p>
          </div>
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
