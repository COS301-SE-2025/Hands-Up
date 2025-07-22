import React,  { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, useAnimations } from '@react-three/drei';

function RunnerCharacter({ filename }) {
  const path = `/models/${filename}`;
  const group = useRef();
  const { scene, animations } = useGLTF(path);
  const { actions } = useAnimations(animations, group);
  const [xPos, setXPos] = useState(0); // lane: -3, 0, 3

  // Play the run animation if available
  useEffect(() => {
    if (actions && actions['Run']) {
      actions['Run'].play();
    }
  }, [actions]);

  // Keyboard controls for left/right movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setXPos((prev) => Math.max(-6, prev - 3)); // left lane
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setXPos((prev) => Math.min(6, prev + 3)); // right lane
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update position each frame
  useFrame(() => {
    if (group.current) {
      group.current.position.x = xPos;
      group.current.position.z += 0.1; // Move forward continuously
    }
  });

  return <primitive ref={group} object={scene} position={[0, 0, 0]} />;
}

function Model({ filename }) {
  const path = `/models/game models/${filename}`;
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

function Road() {
  const texture = useTexture('/models/game models/textures/road.png'); 
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[20, 200]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function MovingCarBackward({ position, filename, speed = 0.05 }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.position.z -= speed;
      if (ref.current.position.z < -50) {
        ref.current.position.z = 50; 
      }
    }
  });

  return (
    <group ref={ref} position={position}>
      <Model filename={filename} />
    </group>
  );
}

function MovingCarForward({ position, filename, speed = 0.05 }) {
  const ref = useRef();

  useFrame(() => {
    if (ref.current) {
      ref.current.position.z += speed;
      if (ref.current.position.z > 50) {
        ref.current.position.z = -50; 
      }
    }
  });

  return (
    <group ref={ref} position={position}>
      <Model filename={filename} />
    </group>
  );
}

export function Game() {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>This is the Game Page</h1>

      <div style={{ height: '100vh', background: 'deepskyblue' }}>
        <Canvas camera={{ position: [0, 5, 15], fov: 55 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[0, 10, 5]} intensity={1} />

          <Road />

          <MovingCarForward position={[-6, 0, 30]} filename="toyota fortuner.glb" />
          <MovingCarForward position={[-3, 0, 40]} filename="vw golf gti.glb" />
          {/* <MovingCar position={[0, 0, 50]} filename="suzuki swift.glb" /> */}
          <MovingCarBackward position={[3, 0, 35]} filename="peugeot 206.glb" />
          <MovingCarBackward position={[6, 0, 45]} filename="toyota hilux.glb" />

          {/* <RunnerCharacter filename="angieStretch.glb" /> */}

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}