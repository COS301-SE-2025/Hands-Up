import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRunnerX } from '../../contexts/game/runnerPosition';
import * as THREE from 'three';

const lanes = [-5, -2, 2, 5];

export function CoinSpawner() {
    const runnerX = useRunnerX();
    const idCounter = useRef(0);
    const lastCollectTime = useRef(0);

    const [coins, setCoins] = useState([]);

    const spawnTimer = useRef(0);
    const nextSpawnDelay = useRef(getRandomDelay());

    function getRandomDelay() {
        return 5 + Math.random() * 10; // 5 to 15 seconds
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
            rotation: 0,
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
                c.rotation += delta * 2; // spin effect

                // collection check
                if (Math.abs(c.z - runnerZ) < collectThresholdZ && c.lane === runnerX.current) {
                if (state.clock.elapsedTime - lastCollectTime.current > 0.2) {
                    lastCollectTime.current = state.clock.elapsedTime;
                    // onCollect?.(c.id);
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
            <mesh
            key={c.id}
            position={[c.lane, 1, c.z]}
            rotation={[0, c.rotation, 0]}
            >
            <circleGeometry args={[0.7, 32]} />
            <meshStandardMaterial color="gold" side={THREE.DoubleSide} />
            </mesh>
        ))}
        </>
    );
}