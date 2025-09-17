/* eslint-disable react/no-unknown-property */
import React, { useState, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useRunnerX } from '../../contexts/game/runnerPosition';
import * as THREE from 'three';

const lanes = [-5, -2, 2, 5];
const coinImages = [
  'A.png','B.png','C.png','D.png','E.png','F.png','G.png','H.png','I.png',
  'J.png','K.png','L.png','M.png','N.png','O.png','P.png','Q.png','R.png',
  'S.png','T.png','U.png','V.png','W.png','X.png','Y.png','Z.png',
];

export function CoinSpawner({ onWrongLetter, currentWord, letterIndex, setLetterIndex, pickNewWord }) {
    const runnerX = useRunnerX();
    const idCounter = useRef(0);
    const lastCollectTime = useRef(0);
    const [coins, setCoins] = useState([]);
    const spawnTimer = useRef(0);
    const nextSpawnDelay = useRef(getRandomDelay());
    const textures = useLoader(THREE.TextureLoader, coinImages.map((name) => `/images/game/${name}`));

    function getRandomDelay() {
        return 5 + Math.random() * 5; // 5 to 10 seconds
    }

    function getTargetLetter() {
        return currentWord[letterIndex];
    }

    function getRandomTexture() {
        let letter = Math.random() < 0.5 
            ? getTargetLetter() 
            : coinImages[Math.floor(Math.random() * coinImages.length)][0];

        if (!textures || textures.length === 0) return null;
        const tex = textures.find(t => t.image.src.includes(letter));
        // const tex = textures[Math.floor(Math.random() * textures.length)];
        tex.center.set(0.5, 0.5);
        tex.repeat.set(0.55, 0.55); 
        tex.needsUpdate = true;
        return tex;
    }

    useFrame((state, delta) => {
        spawnTimer.current += delta;

        if (spawnTimer.current >= nextSpawnDelay.current) {
            const lane = lanes[Math.floor(Math.random() * lanes.length)];
            idCounter.current += 1;

            setCoins((prev) => [
                ...prev,
                {
                    id: idCounter.current,
                    lane,
                    z: -60,
                    speed: 10,
                    baseY: 1.5, 
                    jumpOffset: Math.random() * Math.PI * 2,
                    texture: getRandomTexture(),
                },
            ]);

            spawnTimer.current = 0;
            nextSpawnDelay.current = getRandomDelay(); 
        }

        setCoins((prev) => {
            const runnerZ = 50;
            const collectThresholdZ = 1.5;
            const zFront = 60;
            const remaining = [];

            for (let i = 0; i < prev.length; i++) {
                const c = { ...prev[i] };
                c.z += c.speed * delta;
                c.y = c.baseY + Math.sin(state.clock.elapsedTime * 2 + c.jumpOffset) * 0.5;

                // collection check
                if (Math.abs(c.z - runnerZ) < collectThresholdZ && c.lane === runnerX.current) {
                    if (state.clock.elapsedTime - lastCollectTime.current > 0.2) {
                        lastCollectTime.current = state.clock.elapsedTime;
                        
                        if (c.texture.image.src.includes(getTargetLetter())) {
                            // correct letter 
                            setLetterIndex(idx => {
                                let nextIndex = idx + 1;
                                
                                while (currentWord[nextIndex] === ' ') {
                                    nextIndex += 1;
                                }

                                if (nextIndex >= currentWord.length) {
                                    pickNewWord(currentWord);
                                    return 0; 
                                }
                                return nextIndex;
                            });
                        } 
                        else {
                            // incorrect letter
                            onWrongLetter?.();
                        }
                    }
                    continue; // remove collected coin
                }

                // keep coin if if it hasn't passed runner yet
                if (c.z < zFront) {
                    remaining.push(c);
                }
            }

            return remaining;
        });
    });

    return (
        <>
        {coins.map((c) => (
            <mesh key={c.id} position={[c.lane, c.y, c.z]}>
                <circleGeometry args={[1.23, 32]} />
                <meshStandardMaterial 
                    map={c.texture}
                    color={c.texture ? undefined : "gold"} 
                    side={THREE.DoubleSide}
                    transparent={true} 
                />
            </mesh>
        ))}
        </>
    );
}