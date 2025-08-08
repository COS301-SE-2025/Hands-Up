import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRunnerX } from '../../contexts/game/runnerPosition';

const lanes = [-6, -3, 3, 6];

export default function Runner({ gameStarted }) {
  const runnerX = useRunnerX(); 
  const { scene, animations } = useGLTF(`/models/angieRun.glb`);
  const { actions } = useAnimations(animations, scene);

  const [currentX, setCurrentX] = useState(0);
  const currentXRef = useRef(0);
  currentXRef.current = currentX;

  useEffect(() => {
    if (actions && actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  useEffect(() => {
    if (gameStarted) {
      if (runnerX.current === 0) {
        runnerX.current = 3;
      }
    } 
    else {
      runnerX.current = 0;
      setCurrentX(0);
    }
  }, [gameStarted, runnerX]);

  useEffect(() => {
    if (!gameStarted) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        const laneID = lanes.indexOf(runnerX.current);
        if (laneID > 0) runnerX.current = lanes[laneID - 1];
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        const laneID = lanes.indexOf(runnerX.current);
        if (laneID < lanes.length - 1) runnerX.current = lanes[laneID + 1];
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, runnerX]);

  useFrame((_, delta) => {
    const speed = 20; 
    const targetX = runnerX.current;
    let diff = targetX - currentXRef.current;

    if (Math.abs(diff) > 0.01) {
      const step = Math.sign(diff) * speed * delta;
      let newX = Math.abs(step) > Math.abs(diff) ? targetX : currentXRef.current + step;
      setCurrentX(newX);
    }
  });

  return (<primitive object={scene} position={[currentX, 0, 50]} rotation={[0, Math.PI, 0]} scale={[1.4, 1.4, 1.4]}/>);
}