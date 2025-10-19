/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from 'react-router-dom';
import { Canvas } from "@react-three/fiber";
import { RunnerPosProvider } from "../../contexts/game/runnerPosition";
import { VehicleSpawner } from "./spawnCars";
import { CoinSpawner } from "./letterCoins";
import { CameraInput } from './cameraInput';
import CameraPOV from './cameraPOV';
import LifeLostSign from './removeLife';
import Runner from "./runner";
import Road from "./road";

export default function GameGuide() {
    const navigate = useNavigate();
    
    const [step, setStep] = useState(0); 
    const [letterIndex, setLetterIndex] = useState(0);
    const [lifeLost, setLifeLost] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [progress, setProgress] = useState(0);
    const [receivedLetter, setReceivedLetter] = useState(false);
    const [letterReceived, setLetterReceived] = useState('');
    const currentWord = "ASL";

    const steps = [
        "Let’s learn how to play Sign Surfers!",
        "JUMP",
        "MOVE LEFT",
        "MOVE RIGHT",
        "Now try collecting letters while avoiding cars.",
        "Now sign the correct letter.",
        "Well Done!"
    ];

    const subSteps = [
        "Tutorial will start soon... ", 
        "Press ↑ (Up Arrow), W or Swipe Up",
        "Press ← (Left Arrow), A or Swipe Left",
        "Press → (Right Arrow), D or Swipe Right",
        "If you hit a car or collect an incorrect letter, you will lose a life.", 
        "If sign an incorrect letter, you will lose a life.", 
        "Now you're ready to play Sign Surfers."
    ]

    useEffect(() => {
        if (step === 0) setTimeout(() => setStep(1), 3000);

        const handleAction = (action) => {
            if (step === 1 && action === "jump") setStep(2);
            else if (step === 2 && action === "left") setStep(3);
            else if (step === 3 && action === "right") setStep(4);
        };

        // keyboard input
        const handleKeyDown = (e) => {
            if (e.key === "ArrowUp" || e.key === "w") setTimeout(() => handleAction("jump"), 500);
            if (e.key === "ArrowLeft" || e.key === "a") setTimeout(() => handleAction("left"), 500);
            if (e.key === "ArrowRight" || e.key === "d") setTimeout(() => handleAction("right"), 500);
        };

        // touch input
        let startX = 0;
        let startY = 0;
        const THRESHOLD = 50;

        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        };

        const handleTouchEnd = (e) => {
            const touch = e.changedTouches[0];
            const diffX = touch.clientX - startX;
            const diffY = touch.clientY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // horizontal swipe
                if (diffX > THRESHOLD) setTimeout(() => handleAction("right"), 500);
                else if (diffX < -THRESHOLD) setTimeout(() => handleAction("left"), 500);
            } 
            else {
                // vertical swipe
                if (diffY < -THRESHOLD) setTimeout(() => handleAction("jump"), 500);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);

        // camera input 
        let intervalTimer, timeoutTimer;
        if (letterIndex === 2) {
            setStep(5); 
            setShowCamera(true);
            setProgress(0);

            const duration = 30000; 
            let elapsed = 0;
            intervalTimer = setInterval(() => {
                elapsed += 100;
                setProgress(Math.min((elapsed / duration) * 100, 100));
            }, 100);

            timeoutTimer = setTimeout(() => {
                setShowCamera(false);
                clearInterval(intervalTimer);
            }, duration);
        }

        if (step === 6) {
            setShowCamera(false); 
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
            clearInterval(intervalTimer);
            clearTimeout(timeoutTimer);
        };
    }, [step, letterIndex]);

    return (
        <div style={{ position: "relative", height: "100vh",
                      background: `linear-gradient(to bottom, lightblue 0%, deepskyblue 40%, #4CAF50 54%, #2E7D32 100%)`}}>
        <div
            style={{
            position: "absolute",
            top: "2vh",
            width: "100%",
            textAlign: "center",
            fontSize: "3vw",
            fontFamily: "Lilita One, sans-serif",
            color: "white",
            zIndex: 100,
            }}
        >
            {steps[step]}
        </div>
        <div
            style={{
            whiteSpace: "pre-line",
            position: "absolute",
            top: "10vh",
            width: "100%",
            textAlign: "center",
            fontSize: "2vw",
            fontFamily: "Lilita One, sans-serif",
            color: "white",
            zIndex: 100,
            }}
        >
            {subSteps[step]}
        </div>

        {step === 1 && (
            <div style={{
                position: 'absolute',
                top: '18vh',
                left: '10%',
                width: '80%',
                textAlign: 'center',
                fontSize: '1.2vw',
                fontFamily: 'Lilita One, sans-serif',            
                color: 'white',
                zIndex: 100,
                fontStyle: 'italic',
            }}>
                Hint: Jump twice to avoid a bus
            </div>
        )}

        {(step === 4 || step === 5) && (
            <div style={{
                position: 'absolute',
                top: '12vh',
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
        )}

        {showCamera && (
            <CameraInput
                progress={progress}
                show={showCamera}
                onSkip={() => setShowCamera(false)}
                onLetterDetected={(letter) => {
                const targetLetter = 'L';
                setLetterReceived(letter ? `DETECTED ${letter}` : 'NO LETTER DETECTED');
                setReceivedLetter(true);

                if (letter === targetLetter) {
                    setLetterIndex(idx => {let nextIndex = idx + 1; return nextIndex;});
                    setShowCamera(false);
                    setStep(6); 
                    setTimeout(() => navigate('/game'), 2500);
                } else {
                    setLifeLost(true); 
                    setTimeout(() => setLifeLost(false), 2500);
                }

                setTimeout(() => setReceivedLetter(false), 2000);
                }}
            />
        )}
        {receivedLetter && (
            <div style={{ 
                position: 'absolute',
                top: '35vh',
                width: '100%',
                textAlign: 'center',
                fontSize: '1vw',
                color: 'red',
                zIndex: 100
            }}>
                {letterReceived}
            </div>
        )}

        <div style={{ position: 'absolute', top: '1%', right: '1.5%', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
            <svg width="80" height="80" viewBox="0 0 120 104" style={{ cursor: 'pointer', pointerEvents: 'auto' }} onClick={() => { navigate('/game'); }} >
                <polygon points="60,0 115,30 115,74 60,104 5,74 5,30" fill="red" transform="translate(60 52) scale(0.85) translate(-60 -52)" stroke='white' strokeWidth={12} />
                <text x="60" y="54" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="22" fontWeight="bold" pointerEvents="none">
                    STOP
                </text>
            </svg>
        </div>

        {lifeLost && <LifeLostSign />}

        <RunnerPosProvider>
            <Canvas>
                <CameraPOV />
                <Suspense fallback={null}>
                    <ambientLight intensity={1.5} />
                    <Road />
                    <Runner gameStarted={true} />

                    {step >= 4 && step < 6 && !showCamera && (
                        <>
                            <VehicleSpawner onCollision={() => {setLifeLost(true); setTimeout(() => setLifeLost(false), 2500);}} speed={10} />
                            <CoinSpawner onWrongLetter={() => {setLifeLost(true); setTimeout(() => setLifeLost(false), 2500);}} currentWord={"ASL"} letterIndex={letterIndex} setLetterIndex={setLetterIndex}
                                        pickNewWord={() => {setStep(6); setTimeout(() => navigate('/game'), 2500);}}/>
                        </>
                    )}
            </Suspense>
            </Canvas>
        </RunnerPosProvider>
        </div>
    );
}