/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from "prop-types";
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRunnerX, useRunnerY } from '../../contexts/game/runnerPosition';

const lanes = [-5, -2, 2, 5];

export default function Runner({ gameStarted }) {
  const runnerX = useRunnerX(); 
  const runnerY = useRunnerY();

  const { scene, animations } = useGLTF(`/models/angieRun.glb`);
  const { actions } = useAnimations(animations, scene);

  const [currentX, setCurrentX] = useState(0);
  const currentXRef = useRef(0);
  currentXRef.current = currentX;

  const [currentY, setCurrentY] = useState(0);
  const currentYRef = useRef(0);
  currentYRef.current = currentY;

  const isJumpingRef = useRef(false);

  const jumpStartTimeRef = useRef(0);
  const JUMP_DURATION = 2; 
  const JUMP_HEIGHT = 3; 

  useEffect(() => {
    if (actions && actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  useEffect(() => {
    if (gameStarted) {
      if (runnerX.current === 0) {
        runnerX.current = 2;
      }
    } 
    else {
      runnerX.current = 0;
      runnerY.current = 0;
      setCurrentX(0);
      setCurrentY(0);
      isJumpingRef.current = false;
      jumpStartTimeRef.current = 0;
    }
  }, [gameStarted, runnerX, runnerY]);

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
      if ((e.key === 'ArrowUp' || e.key === 'w') && !isJumpingRef.current) {
        isJumpingRef.current = true;
        jumpStartTimeRef.current = performance.now() / 1000;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, runnerX]);

  useEffect(() => {
    if (!gameStarted) return;

    let startX = 0;
    let startY = 0;

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
        // swipe right         
        if (diffX > 50) {
          const laneID = lanes.indexOf(runnerX.current);
          if (laneID < lanes.length - 1) {
            runnerX.current = lanes[laneID + 1];
          }
        }
        // swipe left 
        else if (diffX < -50) { 
          const laneID = lanes.indexOf(runnerX.current);
          if (laneID > 0) {
            runnerX.current = lanes[laneID - 1];
          }
        }
      } 
      // swipe up 
      else {
        if (diffY < -50 && !isJumpingRef.current) {
          isJumpingRef.current = true;
          jumpStartTimeRef.current = performance.now() / 1000;
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameStarted, runnerX]);

  useFrame((_, delta) => {
    const speed = 15; 
    const targetX = runnerX.current;
    let diff = targetX - currentXRef.current;

    if (Math.abs(diff) > 0.01) {
      const step = Math.sign(diff) * speed * delta;
      let newX = Math.abs(step) > Math.abs(diff) ? targetX : currentXRef.current + step;
      setCurrentX(newX);
    }

    if (isJumpingRef.current) {
      const now = performance.now() / 1000;
      const elapsed = now - jumpStartTimeRef.current;

      if (elapsed >= JUMP_DURATION) {
        isJumpingRef.current = false;
        setCurrentY(0);
        runnerY.current = 0;
      } else {
        const newY = JUMP_HEIGHT * Math.sin(Math.PI * elapsed / JUMP_DURATION);
        setCurrentY(newY);
        runnerY.current = newY;
      }
    }
    else {
      runnerY.current = currentYRef.current; 
    }

  });

  return (<primitive object={scene} position={[currentX, currentY, 50]} rotation={[0, Math.PI, 0]} scale={1}/>);
}

Runner.propTypes = {
  gameStarted: PropTypes.bool.isRequired,
};