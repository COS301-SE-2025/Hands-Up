import React,  { useEffect, useState, Suspense } from 'react';
import { Canvas} from '@react-three/fiber';
import { Loader } from '@react-three/drei';

import { RunnerPosProvider } from '../contexts/game/runnerPosition';
import { VehicleSpawner } from '../components/game/cars';
import Road from '../components/game/road';
import Runner from '../components/game/runner';
import LifeLostSign from '../components/game/lives';
import StartScreen from '../components/game/start';

export function Game() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const [lives, setLives] = useState(3);
    const [lifeLost, setLifeLost] = useState(false);
    const [distance, setDistance] = useState(0);

    const handleCollision = () => {
      setLives(l => {
        const newLives = Math.max(l - 1, 0);
        if (newLives === 0) {
          setGameStarted(false); 
          setDistance(0);
          setLives(3);  
        }
        else {
          setLifeLost(true);
          setTimeout(() => setLifeLost(false), 2000);
        }

        return newLives;
      });
    };

    useEffect(() => {
      if (!gameStarted || gamePaused) return;

      const interval = setInterval(() => {
        setDistance(d => d + 10);
      }, 1000);

      return () => clearInterval(interval);
    }, [gameStarted]);

    return (
      <div style={{ position: 'relative', height: '100vh' }}>   
        <div style={{ height: '100%', filter: gameStarted ? 'none' : 'blur(5px)', transition: 'filter 0.5s',
                      background: `linear-gradient(to bottom, lightblue 0%, deepskyblue 40%, #4CAF50 54%, #2E7D32 100%)`}}> 

          {lifeLost && <LifeLostSign />}

          <div style={{ position: 'absolute', left: '1%', color: '#ffcc00', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 0px', fontSize: '28px', fontWeight: 'bold' }}>
              Distance: {distance} m
            </div>
            <div style={{ padding: '0px 20px', fontSize: '28px', fontWeight: 'bold' }}>
              Lives: {lives}
            </div>
          </div>

          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', right: '1.5%'}} > 
            <svg width="80" height="80" viewBox="0 0 120 104" style={{ cursor: 'pointer' }} onClick={() => { console.log("clicked stop")}}>
              <polygon points="60,0 115,30 115,74 60,104 5,74 5,30" fill="red" transform="translate(60 52) scale(0.85) translate(-60 -52)" stroke='white' strokeWidth={12} />
              <text x="60" y="54" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="22" fontWeight="bold" pointerEvents="none">
                STOP
              </text>
            </svg>
            <svg width="80" height="80" style={{ cursor: 'pointer' }} viewBox="0 0 80 80" >
              <polygon points="10,15 70,15 40,65" fill="white" stroke='red' strokeWidth={8} />
            </svg>
          </div>
          
          <RunnerPosProvider>
          <Canvas camera={{ position: [0, 3, 58], fov: 55 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[0, 10, 5]} intensity={1} />

              <Road />
              <Runner gameStarted={gameStarted}/>
              <VehicleSpawner onCollision={handleCollision} />

            </Suspense>
          </Canvas>
          </RunnerPosProvider>
        </div>
        <Loader />

        {!gameStarted && <StartScreen onStart={() => setGameStarted(true)} />}

      </div>
    );
}