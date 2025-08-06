import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

export default function Runner() {
  const path = `/models/angieRun.glb`;
  const group = useRef();
  const { scene, animations } = useGLTF(path);
  const { actions } = useAnimations(animations, group);
  const [xPos, setXPos] = useState(0); // lanes: -6, -3, 3, 6

  useEffect(() => {
    if (actions && actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  useEffect(() => {
      const handleKeyDown = (e) => {
      setXPos((prev) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
          const next = prev - 3;
          return next === 0 ? -3 : Math.max(-6, next);
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
          const next = prev + 3;
          return next === 0 ? 3 : Math.min(6, next);
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (<primitive ref={group} object={scene} position={[xPos, 0, 50]} rotation={[0, Math.PI, 0]} scale={[1.4, 1.4, 1.4]}/>
  );
}