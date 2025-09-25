/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import landmarksData from './wheelsOnTheBus.json';

export function AngieSings({ word }) {
  const { scene } = useGLTF('/models/angieWaving.glb');
  const bones = useRef({});
  const [modelReady, setModelReady] = useState(false);
  const animationProgress = useRef(0);
  const clock = useRef(new THREE.Clock());
  const startDelay = 500;

  // landmarks for the selected word
  const landmarks = landmarksData[word];

    useEffect(() => {
    if (!landmarks) return;

    // Reset animation progress and clock
    animationProgress.current = 0;
    clock.current.elapsedTime = 0;
    clock.current.start();
    }, [word, landmarks]);

    if (!landmarks) {
    console.warn(`No landmarks found for word "${word}"`);
    }

  const getAnimationDuration = () => {
    if (!landmarks) return 2.5;

    let maxKeyframes = 0;
    for (const boneName in landmarks) {
      const keyframes = landmarks[boneName]?.keyframes;
      if (keyframes && keyframes.length > maxKeyframes) {
        maxKeyframes = keyframes.length;
      }
    }

    const timePerKeyframe = 0.3;
    const calculatedDuration = maxKeyframes * timePerKeyframe;
    return Math.max(2, Math.min(10.0, calculatedDuration));
  };

  const animationDuration = getAnimationDuration();

  useEffect(() => {
    if (!scene) return;

    scene.traverse((obj) => {
      if (obj.isBone && obj.name.startsWith('mixamorig')) {
        bones.current[obj.name] = obj;
      }
    });

    // Initial pose adjustments
    const upperArmL = bones.current['mixamorigLeftArm'];
    const upperArmR = bones.current['mixamorigRightArm'];
    const foreArmR = bones.current['mixamorigRightForeArm'];
    const handR = bones.current['mixamorigRightHand'];

    if (upperArmL) upperArmL.rotation.x = 1.1;
    if (upperArmR) {
      upperArmR.rotation.x = 0.9;
      upperArmR.rotation.z = -0.3;
    }
    if (foreArmR) {
      foreArmR.rotation.x = 0.5;
      foreArmR.rotation.z = -2.8;
    }
    if (handR) handR.rotation.y = -1.5;

    const timer = setTimeout(() => {
      setModelReady(true);
      clock.current.start();
    }, startDelay);

    return () => clearTimeout(timer);
  }, [scene, startDelay]);

  useFrame(() => {
    if (!modelReady || !landmarks) return;

    const delta = clock.current.getDelta();
    animationProgress.current = Math.min(
      animationProgress.current + delta / animationDuration,
      1
    );

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

AngieSings.propTypes = {
  word: PropTypes.string.isRequired,
};