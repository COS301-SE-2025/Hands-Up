import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

export default function Road() {
  const texture = useTexture('/models/game models/textures/road.png');
  const materialRef = useRef();

  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4); 

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.map.offset.y += delta * 0.3; 
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[18, 200]} />
      <meshStandardMaterial ref={materialRef} map={texture} />
    </mesh>
  );
}