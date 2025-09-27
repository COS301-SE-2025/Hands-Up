/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { getLandmarks } from '../utils/apiCalls';

export function AngieSings({ filename, isPlaying, replayKey }) {
    const { scene } = useGLTF('/models/angieWaving.glb');
    const bones = useRef({});
    const [modelReady, setModelReady] = useState(false);
    const animationProgress = useRef(0);
    const clock = useRef(new THREE.Clock());
    const [animationDuration, setAnimationDuration] = useState(2.5);
    const delay = 3000; 

    const [landmarks, setLandmarks] = useState(null);
    const [sequence, setSequence] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [delays, setDelays] = useState([]);

    useEffect(() => {
        if (!filename) return; 

        async function loadLandmarks() {
            try {
                const landmarkData = await getLandmarks(filename);
                setLandmarks(landmarkData || {});
                setSequence(landmarkData.sequence || []);
                setDelays(landmarkData.delay || []);
                setCurrentIndex(0);
            } 
            catch (err) {
                console.error('Failed to load landmarks for', filename, err);
                setLandmarks({});
                setDelays([]);
            }
        }

        loadLandmarks();
    }, [filename]);

    useEffect(() => {
        if (!sequence || sequence.length === 0) return;
        if (currentIndex >= sequence.length) return; 

        const currentDelay = (delays[currentIndex] ?? delay / 1000) * 1000;

        const timer = setTimeout(() => {
            if (currentIndex + 1 < sequence.length) {
                setCurrentIndex(currentIndex + 1);
                animationProgress.current = 0;
                clock.current.elapsedTime = 0;
                clock.current.start();
            }
        }, currentDelay);

        return () => clearTimeout(timer);
    }, [currentIndex, sequence, delays]);

    const currentWord = sequence[currentIndex] || sequence[sequence.length - 1];
    const currentLandmarks = landmarks ? landmarks[currentWord] : null;

    useEffect(() => {
        if (!currentLandmarks) return;

        // reset animation progress and clock
        animationProgress.current = 0;
        clock.current.elapsedTime = 0;
        clock.current.start();
    }, [currentWord, currentLandmarks]);

    useEffect(() => {
        if (!currentLandmarks) return;

        let maxKeyframes = 0;
        for (const boneName in currentLandmarks) {
            const keyframes = currentLandmarks[boneName]?.keyframes;
            if (keyframes && keyframes.length > maxKeyframes) {
            maxKeyframes = keyframes.length;
            }
        }

        const timePerKeyframe = 0.3;
        const calculatedDuration = maxKeyframes * timePerKeyframe;
        setAnimationDuration(Math.max(2, Math.min(10.0, calculatedDuration)));
    }, [currentWord, currentLandmarks]);

    useEffect(() => {
        if (!scene) return;

        scene.traverse((obj) => {
            if (obj.isBone && obj.name.startsWith('mixamorig')) {
                bones.current[obj.name] = obj;
            }
        });

        // initial pose adjustments
        const upperArmL = bones.current['mixamorigLeftArm'];
        const upperArmR = bones.current['mixamorigRightArm'];
        const foreArmL = bones.current['mixamorigLeftForeArm'];
        const foreArmR = bones.current['mixamorigRightForeArm'];
        const handL = bones.current['mixamorigLeftHand'];
        const handR = bones.current['mixamorigRightHand'];
        if (upperArmL) upperArmL.rotation.set(1, 0, 0);
        if (upperArmR) upperArmR.rotation.set(1, 0, 0);
        if (foreArmL) foreArmL.rotation.set(0, 0, 0);
        if (foreArmR) foreArmR.rotation.set(0.0, 0, 0);
        if (handL) handL.rotation.set(0, 0, 0);
        if (handR) handR.rotation.set(0, 0, 0);

        setModelReady(true);
    }, [scene]);

    useEffect(() => {
        if (isPlaying) {
            animationProgress.current = 0;
            clock.current.elapsedTime = 0;
            clock.current.start();
        } 
        else {
            clock.current.stop();
        }
    }, [isPlaying]);

    useEffect(() => {
        // reset
        setCurrentIndex(0);
        animationProgress.current = 0;
        clock.current.elapsedTime = 0;
        if (isPlaying) clock.current.start();
    }, [replayKey, isPlaying]);

    useFrame(() => {
        if (!modelReady || !currentLandmarks || !isPlaying) return;

        const delta = clock.current.getDelta();
        animationProgress.current += delta / animationDuration;
        animationProgress.current %= 1;
        
        for (const boneName in currentLandmarks) {
            const bone = bones.current[boneName];
            if (!bone) continue;

            const keyframes = currentLandmarks[boneName].keyframes;
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
    filename: PropTypes.string.isRequired,
    isPlaying: PropTypes.bool.isRequired,
};