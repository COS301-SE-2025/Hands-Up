// eslint-disable-next-line react-hooks/exhaustive-deps
import React, { useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useRunnerX } from '../../contexts/game/runnerPosition';

export default function Runner() {
  const runnerX = useRunnerX();
  const { scene, animations } = useGLTF(`/models/angieRun.glb`);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     setXPos((prev) => {
  //       if (e.key === 'ArrowLeft' || e.key === 'a') {
  //         const next = prev - 3;
  //         return next === 0 ? -3 : Math.max(-6, next);
  //       } else if (e.key === 'ArrowRight' || e.key === 'd') {
  //         const next = prev + 3;
  //         return next === 0 ? 3 : Math.min(6, next);
  //       }
  //       return prev;
  //     });
  //   };

  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        runnerX.current = Math.max(runnerX.current - 3, -6);
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        runnerX.current = Math.min(runnerX.current + 3, 6);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (<primitive object={scene} position={[runnerX.current, 0, 50]} rotation={[0, Math.PI, 0]} scale={[1.4, 1.4, 1.4]}/>
  );
}