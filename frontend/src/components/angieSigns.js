/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';

export function AngieSigns({ landmarks, replay }) {
  const { scene } = useGLTF('/models/angieWaving.glb');
  const bones = useRef({}); 

  const animationProgress = useRef(0); 
  const animationDuration = 2.5; // seconds
  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    if (!scene) return;

    scene.traverse((obj) => {
      if (obj.isBone && obj.name.startsWith('mixamorig')) {
        bones.current[obj.name] = obj;
      }
    });

    // scene.traverse((obj) => obj.isBone && console.log(obj.name));

    const upperArmL = bones.current['mixamorigLeftArm'];
    const upperArmR = bones.current['mixamorigRightArm'];
    const foreArmR = bones.current['mixamorigRightForeArm'];
    const handR = bones.current['mixamorigRightHand'];

    if (upperArmL) {
      upperArmL.rotation.x = 1.1;
    }

    if (upperArmR) {
      upperArmR.rotation.x = 0.9;
      upperArmR.rotation.z = -0.3;    
    }

    if (foreArmR) {
      foreArmR.rotation.x = 0.5;
      foreArmR.rotation.z = -2.8; 
      // foreArmR.rotation.y = -2;    
    }

    if (handR) {
      // handR.rotation.x = -0.3;        
      handR.rotation.y = -1.5;
      // handR.rotation.z = -0.5; 
    }

    clock.current.start();

  }, [scene]);

  useEffect(() => {
      animationProgress.current = 0;
      clock.current.elapsedTime = 0;
  }, [replay]);

  useFrame(() => {
    const delta = clock.current.getDelta(); // time since last frame
    animationProgress.current = Math.min(animationProgress.current + delta / animationDuration, 1);

    for (const boneName in landmarks) {
      const bone = bones.current[boneName];
      if (!bone) continue;

      const keyframes = landmarks[boneName].keyframes;
      if (!keyframes || keyframes.length < 2) continue;

      const totalFrames = keyframes.length - 1;
      const progress = animationProgress.current * totalFrames;

      const frameIndex = Math.floor(progress);
      const frameFraction = progress - frameIndex;

      const currentFrame = keyframes[frameIndex];
      const nextFrame = keyframes[frameIndex + 1] || keyframes[frameIndex];

      const x = THREE.MathUtils.lerp(currentFrame[0], nextFrame[0], frameFraction);
      const y = THREE.MathUtils.lerp(currentFrame[1], nextFrame[1], frameFraction);
      const z = THREE.MathUtils.lerp(currentFrame[2], nextFrame[2], frameFraction);

      bone.rotation.set(x, y, z);
    }
  });

  return <primitive object={scene} scale={2} position={[0, -1.5, 0]} />;
}

AngieSigns.propTypes = {
  landmarks: PropTypes.objectOf(
    PropTypes.shape({
      keyframes: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number)
      )
    })
  ).isRequired,
  replay: PropTypes.any
};