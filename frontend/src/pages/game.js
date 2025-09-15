/* eslint-disable react/no-unknown-property */
import React,  { useEffect, useState, Suspense } from 'react';
import { Canvas} from '@react-three/fiber';
import { Loader } from '@react-three/drei';

import { RunnerPosProvider } from '../contexts/game/runnerPosition';
import { VehicleSpawner } from '../components/game/spawnCars';
import { CoinSpawner } from '../components/game/letterCoins';
import Road from '../components/game/road';
import Runner from '../components/game/runner';
import LifeLostSign from '../components/game/removeLife';
import StartScreen from '../components/game/gameStart';
import GameOverScreen from '../components/game/gameOver';
import PauseScreen from '../components/game/gamePaused';
import StopScreen from '../components/game/gameStopped';

const wordList = ["ALBERTON", "BALLITO", "BENONI", "BLOEMFONTEIN", "BOKSBURG", 
  "CAPE TOWN", "DURBAN", "EAST LONDON", "FOURWAYS", "GEORGE", "GQEBERHA", "HOWZIT", 
  "IZIKO", "JOHANNESBURG", "KIMBERLEY", "KNYSNA", "LEKKER", "MAHIKENG", "MAKHANDA", 
  "MBOMBELA", "MOSSEL BAY", "NEWCASTLE", "PIETERMARITZBURG", "POLOKWANE", "PRETORIA", 
  "RICHARDS BAY", "ROBOT", "RUSTENBURG", "SOSHANGUVE", "SOWETO", "STELLENBOSCH", 
  "THEMBISA", "UPINGTON", "VEREENIGING", "ZULU LAND"];

export function Game() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const [gameStopped, setGameStopped] = useState(false);

    const [lives, setLives] = useState(3);
    const [lifeLost, setLifeLost] = useState(false);
    const [distance, setDistance] = useState(0);
    const [carSpeed, setCarSpeed] = useState(10);
    const maxSpeed = 20;

    const [currentWord, setCurrentWord] = useState(wordList[Math.floor(Math.random() * wordList.length)]);
    const [letterIndex, setLetterIndex] = useState(0);
    const [wordsCollected, setWordsCollected] = useState(0);

    function pickNewWord(prevWord) {
      let newWord;
      do {
        newWord = wordList[Math.floor(Math.random() * wordList.length)];
      } while (newWord === prevWord);
      setCurrentWord(newWord);
      setLetterIndex(0);
      setWordsCollected(w => w + 1);
    }

    const handleCollision = () => {
      setLives(l => {
        const newLives = Math.max(l - 1, 0);
        if (newLives === 0) {
          setGameStarted(false); 
          setGameOver(true);  
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
      setCurrentWord(wordList[Math.floor(Math.random() * wordList.length)]);
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
        <div style={{ height: '100%', filter: gameStarted ? 'none' : 'blur(4px)', transition: 'filter 0.5s',
                      background: `linear-gradient(to bottom, lightblue 0%, deepskyblue 40%, #4CAF50 54%, #2E7D32 100%)`}}> 

          {lifeLost && <LifeLostSign />}

          <div style={{ position: 'absolute', left: '1%', color: 'yellow', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 0px', fontSize: '28px', fontWeight: 'bold' }}>
              Distance: {distance} m
            </div>
            <div style={{ padding: '0px 20px', fontSize: '28px', fontWeight: 'bold' }}>
              Lives: {lives}
            </div>
          </div>

          <div style={{
            position: 'absolute',
            top: '5%',
            left: '10%',
            width: '80%',
            textAlign: 'center',
            fontSize: '6vw',
            fontFamily: 'Lilita One, sans-serif',            
            color: 'white',
            zIndex: 100,
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
          </div>

          <div style={{ position: 'absolute', top: 0, right: '1.5%', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
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
          
          <RunnerPosProvider>
            <Canvas camera={{ position: [0, 2, 54], fov: 60 }}>
              <Suspense fallback={null}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[0, 10, 5]} intensity={1} />

                <Road />
                <Runner gameStarted={gameStarted}/>
                {!gamePaused && !gameStopped && (
                  <>
                    <VehicleSpawner onCollision={handleCollision} speed={carSpeed} />
                    <CoinSpawner onWrongLetter={handleCollision} currentWord={currentWord} letterIndex={letterIndex} setLetterIndex={setLetterIndex} pickNewWord={pickNewWord}/>
                  </>
                )}

              </Suspense>
            </Canvas>
          </RunnerPosProvider>
        </div>
        <Loader />

        {!gameStarted && !gameOver && !gamePaused && !gameStopped && <StartScreen onStart={() => setGameStarted(true)} />}
        {!gameStarted && gameOver && <GameOverScreen distance={distance} wordsCollected={wordsCollected} onReplay={handleReplay}/>}
        {!gameStarted && gamePaused && <PauseScreen onResume={() => {setGameStarted(true); setGamePaused(false);}} />}
        {!gameStarted && gameStopped && <StopScreen onResume={() => {setGameStarted(true); setGameStopped(false);}} onQuit={() => { setGameStopped(false); setGameOver(true);}} />}

      </div>
    );
}