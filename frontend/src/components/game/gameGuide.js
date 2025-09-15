/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from 'react-router-dom';
import { Canvas } from "@react-three/fiber";
import { RunnerPosProvider } from "../../contexts/game/runnerPosition";
import { VehicleSpawner } from "./spawnCars";
import { CoinSpawner } from "./letterCoins";
import LifeLostSign from './removeLife';
import Runner from "./runner";
import Road from "./road";

export default function GameGuide({ onComplete }) {
    const navigate = useNavigate();
    
    const [step, setStep] = useState(0); 
    const [letterIndex, setLetterIndex] = useState(0);
    const [lifeLost, setLifeLost] = useState(false);
    const currentWord = "ASL";

    const steps = [
        "Let’s learn how to play Sign Surfers!",
        "JUMP",
        "MOVE LEFT",
        "MOVE RIGHT",
        "Now try collecting letters while avoiding cars.",
        "Well Done!"
    ];

    const subSteps = [
        "Press any key to begin... ", 
        "Press ↑ (Up Arrow), W or Swipe Up",
        "Press ← (Left Arrow), A or Swipe Left",
        "Press → (Right Arrow), D or Swipe Right",
        "If you hit a car or collect an incorrect letter, you will lose a life.", 
        "Now you're ready to play Sign Surfers."
    ]

    useEffect(() => {
        const handleAction = (action) => {
            if (step === 1 && action === "jump") setStep(2);
            else if (step === 2 && action === "left") setStep(3);
            else if (step === 3 && action === "right") setStep(4);
        };

        const handleKeyDown = (e) => {
        if (step === 0) setStep(1);
        if (e.key === "ArrowUp" || e.key === "w") handleAction("jump");
        if (e.key === "ArrowLeft" || e.key === "a") handleAction("left");
        if (e.key === "ArrowRight" || e.key === "d") handleAction("right");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [step]);

    return (
        <div style={{ position: "relative", height: "100vh",
                      background: `linear-gradient(to bottom, lightblue 0%, deepskyblue 40%, #4CAF50 54%, #2E7D32 100%)`}}>
        <div
            style={{
            whiteSpace: "pre-line",
            position: "absolute",
            top: "5%",
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
            top: "15%",
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

        {step === 4 && (
            <div style={{
                position: 'absolute',
                top: '20%',
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
            <Canvas camera={{ position: [0, 2, 56], fov: 60 }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={1.5} />
                    <Road />
                    <Runner gameStarted={true} />

                    {step >= 4 && (
                        <>
                            <VehicleSpawner onCollision={() => {setLifeLost(true); setTimeout(() => setLifeLost(false), 2500);}} speed={10} />
                            <CoinSpawner onWrongLetter={() => {setLifeLost(true); setTimeout(() => setLifeLost(false), 2500);}} currentWord={"ASL"} letterIndex={letterIndex} setLetterIndex={setLetterIndex}
                                        pickNewWord={() => {setStep(5); setTimeout(() => navigate('/game'), 2500);}}/>
                        </>
                    )}
            </Suspense>
            </Canvas>
        </RunnerPosProvider>
        </div>
    );
}