/* eslint-disable react/no-unknown-property */
import React, { useState, useRef } from 'react';
import PropTypes from "prop-types";
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useRunnerX, useRunnerY } from '../../contexts/game/runnerPosition';

const lanes = [-5, -2, 2, 5];
const carModels = [
  'bakkie.glb',
  'bmw m3.glb',
  'bmw m4.glb',
  'bus.glb',
  'jeep.glb', 
  'taxi.glb',
  'vw golf gti.glb',
];

export function VehicleSpawner({ onCollision, speed }) {
  const runnerX = useRunnerX();
  const runnerY = useRunnerY();

  const idCounter = useRef(0);
  const lastCollisionTime = useRef(0);
  const lastSpawnTime = useRef(0);

  const modelPaths = carModels.map((name) => encodeURI(`/models/game_models/${name}`));
  const gltfs = useLoader(GLTFLoader, modelPaths);
  const scenes = useRef(gltfs.map((g) => g.scene)).current;
  const [vehicles, setVehicles] = useState([]);

  useFrame((state, delta) => {
    setVehicles((prev) => {
      const next = [...prev];

      // spawn new vehicle
      const now = state.clock.elapsedTime;
      if (now - lastSpawnTime.current > 1 && Math.random() < 0.2) {
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const modelIndex = Math.floor(Math.random() * scenes.length);
        
        const clone = skeletonClone(scenes[modelIndex]);

        idCounter.current += 1;
        next.push({
          id: idCounter.current,
          lane,
          z: -60,
          speed: speed,
          object: clone, 
        });

        lastSpawnTime.current = now;
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
        if (runnerY.current === 0 && v.lane === runnerX.current && Math.abs(v.z - runnerZ) < collisionThresholdZ) {
          if (state.clock.elapsedTime - lastCollisionTime.current > 0.4) { 
            lastCollisionTime.current = state.clock.elapsedTime;
            onCollision?.();
          }
          continue; 
        }

        // keep vehicle if it hasn't passed runner yet
        if (v.z < zFront) {
          remaining.push(v);
        }
      }

      return remaining;
    });
  });

  return (
    <>
      {vehicles.map((v) => (<primitive key={v.id} object={v.object} scale={1.1} dispose={null} />))}
    </>
  );
}

VehicleSpawner.propTypes = {
  onCollision: PropTypes.func.isRequired,
  speed: PropTypes.number.isRequired,
};