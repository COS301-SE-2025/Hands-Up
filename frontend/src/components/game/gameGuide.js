/* eslint-disable react/no-unknown-property */
import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { RunnerPosProvider } from "../../contexts/game/runnerPosition";
import Runner from "./runner";
import Road from "./road";
import { VehicleSpawner } from "./spawnCars";
import { CoinSpawner } from "./letterCoins";

export default function GameGuide({ onComplete }) {
    const [step, setStep] = useState(0); 
    const [letterIndex, setLetterIndex] = useState(0);

    const steps = [
        "Let’s learn how to play Sign Surfers!",
        "JUMP",
        "MOVE LEFT",
        "MOVE RIGHT",
        "MAKE WORDS",
        "ASL"
    ];

    const subSteps = [
        "Press any key to begin... ", 
        "Press ↑ (Up Arrow), W or Swipe Up",
        "Press ← (Left Arrow), A or Swipe Left",
        "Press → (Right Arrow), D or Swipe Right",
        "Try collecting letters while avoiding cars.", 
        ""
    ]

    const handleAction = (action) => {
        if (step === 1 && action === "jump") setStep(2);
        else if (step === 2 && action === "left") setStep(3);
        else if (step === 3 && action === "right") setStep(4);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
        if (step === 0) setStep(1);
        if (e.key === "ArrowUp" || e.key === "w") handleAction("jump");
        if (e.key === "ArrowLeft" || e.key === "a") handleAction("left");
        if (e.key === "ArrowRight" || e.key === "d") handleAction("right");
        if (step === 4) setStep(5);
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

        <RunnerPosProvider>
            <Canvas camera={{ position: [0, 2, 56], fov: 60 }}>
            <ambientLight intensity={1.5} />
            <Road />
            <Runner gameStarted={true} />
            </Canvas>
        </RunnerPosProvider>
        </div>
    );
}