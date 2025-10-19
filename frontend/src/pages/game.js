/* eslint-disable react/no-unknown-property */
import React,  { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas} from '@react-three/fiber';
import LoadingSpinner from '../components/loadingSpinner';

import { RunnerPosProvider } from '../contexts/game/runnerPosition';
import { VehicleSpawner } from '../components/game/spawnCars';
import { CoinSpawner } from '../components/game/letterCoins';
import { CameraInput } from '../components/game/cameraInput';
import CameraPOV from '../components/game/cameraPOV';
import Road from '../components/game/road';
import Runner from '../components/game/runner';
import LifeLostSign from '../components/game/removeLife';
import StartScreen from '../components/game/gameStart';
import GameOverScreen from '../components/game/gameOver';
import PauseScreen from '../components/game/gamePaused';
import StopScreen from '../components/game/gameStopped';

const wordList = ["ALBERTON", "BALLITO", "BENONI", "BLOEMFONTEIN", "BOKSBURG", "BRAAI",
  "CAPE TOWN", "DUMELA", "DURBAN", "EAST LONDON", "FOURWAYS", "GEORGE", "GQEBERHA", "HOWZIT", 
  "IZIKO", "JOHANNESBURG", "KIMBERLEY", "KNYSNA","KOTA", "LEKKER", "MAHIKENG", "MAKHANDA", 
  "MBOMBELA", "MOSSEL BAY", "NEWCASTLE", "PIETERMARITZBURG", "POLOKWANE", "PRETORIA", 
  "RICHARDS BAY", "ROBOT", "RUSTENBURG", "SOSHANGUVE", "SOWETO", "STELLENBOSCH", 
  "THEMBISA", "UPINGTON", "VEREENIGING", "ZULU LAND",];

export function Game() {
    const [loading, setLoading] = useState(true);

    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const [gameStopped, setGameStopped] = useState(false);

    const [lives, setLives] = useState(3);
    const [lifeLost, setLifeLost] = useState(false);
    const [distance, setDistance] = useState(0);
    const [carSpeed, setCarSpeed] = useState(10);
    const maxSpeed = 20;

    const initialWord = wordList[Math.floor(Math.random() * wordList.length)];
    const [usedWords, setUsedWords] = useState(new Set([initialWord]));
    const [currentWord, setCurrentWord] = useState(initialWord);
    const [letterIndex, setLetterIndex] = useState(0);
    const [wordsCollected, setWordsCollected] = useState(0);

    const [showCamera, setShowCamera] = useState(false);
    const [progress, setProgress] = useState(0);
    const [userInput, setUserInput] = useState(true);
    const [inputIndex, setInputIndex] = useState(2);
    const [receivedLetter, setReceivedLetter] = useState(false);
    const [letterReceived, setLetterReceived] = useState('');

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!gameStarted) return;

      let intervalTimer;
      let timeoutTimer;

      if (userInput && letterIndex === inputIndex) {
        setShowCamera(true);
        setProgress(0);

        const duration = 30000; 
        const interval = 100; 
        let elapsed = 0;

        intervalTimer = setInterval(() => {
          elapsed += interval;
          setProgress(Math.min((elapsed / duration) * 100, 100));
        }, interval);

        timeoutTimer = setTimeout(() => {
          setShowCamera(false);
          setUserInput(false);
          clearInterval(intervalTimer);
        }, duration);
      }

      return () => {
        clearInterval(intervalTimer);
        clearTimeout(timeoutTimer);
      };
    }, [letterIndex, inputIndex, userInput, gameStarted]);

    const pickedNewWord = useRef(false);
    function pickNewWord() {
      if (pickedNewWord.current) return;
      pickedNewWord.current = true;

      let remainingWords = wordList.filter(w => !usedWords.has(w));
      if (remainingWords.length === 0) {
        setUsedWords(new Set());
        remainingWords = [...wordList];
      }

      const newWord = remainingWords[Math.floor(Math.random() * remainingWords.length)];
      setCurrentWord(newWord);
      setLetterIndex(0);
      setWordsCollected(w => w + 1);
      setUsedWords(prev => new Set(prev).add(newWord));

      const shouldShowCamera = Math.random() < 0.5;
      setUserInput(shouldShowCamera);
      if (shouldShowCamera) {
        let idx;
        do {
          idx = Math.floor(Math.random() * newWord.length);
        } while (newWord[idx] === ' ');
        setInputIndex(idx);
        //console.log("New word:", newWord, " Camera?", shouldShowCamera, " At index:", idx);    
      } 
      else {
        setInputIndex(-1); 
        //console.log("New word:", newWord, " Camera?", shouldShowCamera);    
      }

      setTimeout(() => pickedNewWord.current = false, 1000);
    }

    const handleCollision = () => {
      setLives(l => {
        const newLives = Math.max(l - 1, 0);
        if (newLives === 0) {
          setGameStarted(false); 
          setGameOver(true); 
          setShowCamera(false); 
        }
        else {
          setLifeLost(true);
          setTimeout(() => setLifeLost(false), 2500);
        }

        return newLives;
      });
    };

    const handleReplay = () => {
      setLives(3);
      setDistance(0);
      setCarSpeed(10);
      setWordsCollected(0);
      setGameOver(false); 
      setGamePaused(false);
      setGameStopped(false); 
      setGameStarted(true);
      setLetterIndex(0);
      const initialWord = wordList[Math.floor(Math.random() * wordList.length)];
      setCurrentWord(initialWord);
      setUsedWords(new Set([initialWord]));
      setShowCamera(false); 
      setUserInput(false);
      setInputIndex(-1);
    };

    // increase distance travelled
    useEffect(() => {
      if (!gameStarted || gamePaused || gameStopped) return;

      const interval = setInterval(() => {
        setDistance(d => d + carSpeed);
      }, 1000);

      return () => clearInterval(interval);
    }, [gameStarted, gamePaused, gameStopped, carSpeed]);

    // increase speed
    useEffect(() => {
        const newSpeed = Math.min(10 + Math.floor(distance / 1000), maxSpeed);
        setCarSpeed(newSpeed); 
    }, [distance]);

    return (
      <div style={{ position: 'relative', height: '100vh' }}>  
        {loading && <LoadingSpinner />} 
        <div style={{ height: '100%', filter: gameStarted ? 'none' : 'blur(4px)', transition: 'filter 0.5s',
                      background: `linear-gradient(to bottom, lightblue 0%, deepskyblue 40%, #4CAF50 54%, #2E7D32 100%)`}}> 

          {lifeLost && <LifeLostSign />}

          <div style={{ position: 'absolute', left: '1%', color: 'yellow', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 0px', fontSize: '2vw', fontWeight: 'bold' }}>
              Distance: {distance} m
            </div>
            <div style={{ padding: '0px 20px', fontSize: '2vw', fontWeight: 'bold' }}>
              Lives: {lives}
            </div>
          </div>

          <div style={{
            position: 'absolute',
            top: '2%',
            left: '10%',
            width: '80%',
            textAlign: 'center',
            fontSize: '6vw',
            fontFamily: 'Lilita One, sans-serif',            
            color: 'white',
            zIndex: 10,
          }}>
            {currentWord?.split("").map((l, i) => (
              <span key={i} style={{ 
                color: i < letterIndex ? 'yellow' : i === letterIndex ? 'white' : 'grey',
                fontSize: i === letterIndex ? '7vw' : '6vw',
                transition: 'color 0.2s ease',
              }}>
                {l}
              </span>
            ))}

            {receivedLetter && ( 
              <div style={{
                color: 'red',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textAlign: 'center',
                minHeight: '1.5rem'
              }}>
                {letterReceived}
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', top: 0, right: '1.5%', display: 'flex', flexDirection: 'column', zIndex: 11 }}>
            <svg width="80" height="80" viewBox="0 0 120 104" style={{ cursor: 'pointer' }} onClick={() => { if (!gameStarted) return; setGameStarted(false); setGameStopped(true); }} >
              <polygon points="60,0 115,30 115,74 60,104 5,74 5,30" fill="red" transform="translate(60 52) scale(0.85) translate(-60 -52)" stroke='white' strokeWidth={12} />
              <text x="60" y="54" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="22" fontWeight="bold" pointerEvents="none">
                STOP
              </text>
            </svg>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ cursor: 'pointer' }} onClick={() => { if (!gameStarted) return; setGameStarted(false); setGamePaused(true); }}>
              <polygon points="10,15 70,15 40,65" fill="white" stroke='red' strokeWidth={8} />
            </svg>
          </div>
          
          {showCamera && (
            <CameraInput 
              progress={progress} 
              show={showCamera} 
              onSkip={() => {setShowCamera(false);}} 
              onLetterDetected={(letter) => {
                const targetLetter = currentWord[letterIndex].toUpperCase();

                if (letter === '') setLetterReceived('NO LETTER DETECTED');
                else setLetterReceived("DETECTED " + letter);
                setReceivedLetter(true);

                if (letter === targetLetter) {
                  // correct letter 
                  setLetterIndex(idx => {
                    let nextIndex = idx + 1;
                    while (currentWord[nextIndex] === ' ') nextIndex++;

                    if (nextIndex >= currentWord.length) {
                      pickNewWord();
                      return 0;
                    }
                    return nextIndex;
                  });
                  setShowCamera(false);
                } 
                else {
                  handleCollision();
                }
                setTimeout(() => setReceivedLetter(false), 2000);
              }}    
            /> 
          )}

          <RunnerPosProvider>
            <Canvas>
              <CameraPOV />
              <Suspense fallback={null}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[0, 10, 5]} intensity={1} />

                <Road />
                <Runner gameStarted={gameStarted}/>
                {!gamePaused && !gameStopped && !showCamera && (
                  <>
                    <VehicleSpawner onCollision={handleCollision} speed={carSpeed} />
                    <CoinSpawner onWrongLetter={handleCollision} currentWord={currentWord} letterIndex={letterIndex} setLetterIndex={setLetterIndex} pickNewWord={pickNewWord}/>
                  </>
                )}

              </Suspense>
            </Canvas>
          </RunnerPosProvider>
        </div>

        {!gameStarted && !gameOver && !gamePaused && !gameStopped && !showCamera && <StartScreen onStart={() => setGameStarted(true)} />}
        {!gameStarted && gameOver && <GameOverScreen distance={distance} wordsCollected={wordsCollected} onReplay={handleReplay}/>}
        {!gameStarted && gamePaused && <PauseScreen onResume={() => {setGameStarted(true); setGamePaused(false); setShowCamera(false);}} />}
        {!gameStarted && gameStopped && <StopScreen onResume={() => {setGameStarted(true); setGameStopped(false); setShowCamera(false);}} onQuit={() => { setGameStopped(false); setGameOver(true);}} />}

      </div>
    );
}