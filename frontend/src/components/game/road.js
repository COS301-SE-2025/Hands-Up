/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

export default function Road() {
  const roadTexture = useTexture('/models/game_models/textures/road.png');
  const grassTexture = useTexture('/models/game_models/textures/grass.png');

  const roadMaterialRef = useRef();
  const grassMaterialRef = useRef();

  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(1, 2); 

  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 30);

  useFrame((state, delta) => {
    if (roadMaterialRef.current) {
      roadMaterialRef.current.map.offset.y += delta * 0.2;
    }
    if (grassMaterialRef.current) {
      grassMaterialRef.current.map.offset.y += delta * 0.3;
    }
  });

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial ref={grassMaterialRef} map={grassTexture} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 200]} />
        <meshStandardMaterial ref={roadMaterialRef} map={roadTexture} />
      </mesh>
    </>
  );
}