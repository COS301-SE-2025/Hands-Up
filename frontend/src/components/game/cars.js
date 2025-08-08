import React, { useState, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useRunnerX } from '../../contexts/game/runnerPosition';

const lanes = [-6, -3, 3, 6];
const carModels = [
  'suzuki swift.glb',
  'vw golf gti.glb',
  'peugeot 206.glb',
  'toyota hilux.glb',
  'toyota fortuner.glb',
  'taxi.glb',
];

export function VehicleSpawner({ onCollision }) {
  const runnerX = useRunnerX();
  const idCounter = useRef(0);

  const modelPaths = carModels.map((name) => encodeURI(`/models/game models/${name}`));
  const gltfs = useLoader(GLTFLoader, modelPaths);
  const scenes = useRef(gltfs.map((g) => g.scene)).current;

  const [vehicles, setVehicles] = useState([]);

  useFrame((_, delta) => {
    setVehicles((prev) => {
      const next = [...prev];

      // spawn new vehicle
      if (Math.random() < 0.02) {
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const modelIndex = Math.floor(Math.random() * scenes.length);
        const clone = scenes[modelIndex].clone(true);

        idCounter.current += 1;
        next.push({
          id: idCounter.current,
          lane,
          z: -60,
          speed: 12,
          object: clone, 
        });
      }

      const runnerZ = 50;
      const collisionThresholdZ = 2; 
      const zFront = 60;
      const remaining = [];

      for (let i = 0; i < next.length; i++) {
        const v = { ...next[i], z: next[i].z + next[i].speed * delta };

        // update vehicle position
        v.object.position.set(v.lane, 0, v.z);

        // collision check
        if (Math.abs(v.z - runnerZ) < collisionThresholdZ && v.lane === runnerX.current) {
          onCollision?.();
          continue; // remove vehicle
        }

        // remove vehicle if passed runner
        if (v.z < zFront) {
          remaining.push(v);
        }
      }

      return remaining;
    });
  });

  return (
    <>
      {vehicles.map((v) => (<primitive key={v.id} object={v.object} scale={1} dispose={null} />))}
    </>
  );
}