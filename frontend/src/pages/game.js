import React,  { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

const carModels = [
  'suzuki swift.glb',
  'vw golf gti.glb',
  'peugeot 206.glb',
  'toyota hilux.glb',
  'toyota fortuner.glb',
  'taxi.glb',
];

const xlanes = [-6, -3, 2, 4]; 

function getRandomCarsForLanes() {
  return xlanes.map((laneX) => ({
    x: laneX,
    z: -Math.random() * 100, // start at random Z between -100 and 0
    model: carModels[Math.floor(Math.random() * carModels.length)],
    speed: 0.1 + Math.random() * 0.2, // optional: different speeds
  }));
}

// function getRandomCars(count = 6) {
//   const cars = [];

//   for (let i = 0; i < count; i++) {
//     cars.push({
//       x: xlanes[Math.floor(Math.random() * xlanes.length)],
//       z: -Math.random() * 100,
//       model: carModels[Math.floor(Math.random() * carModels.length)],
//       speed: 0.1 + Math.random() * 0.2,
//     });
//   }

//   return cars;
// }

function RunnerCharacter({ filename }) {
  const path = `/models/${filename}`;
  const group = useRef();
  const { scene, animations } = useGLTF(path);
  const { actions } = useAnimations(animations, group);
  const [xPos, setXPos] = useState(0); // lane: -3, 0, 3

  console.log("Animations array:", animations);

  useEffect(() => {
    if (actions && actions["Armature|mixamo.com|Layer0"]) {
      actions["Armature|mixamo.com|Layer0"].reset().fadeIn(0.5).play();
    }
  }, [actions]);

  // keyboard controls 
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setXPos((prev) => Math.max(-6, prev - 3)); // left 
      } 
      else if (e.key === 'ArrowRight' || e.key === 'd') {
        setXPos((prev) => Math.min(6, prev + 3)); // right 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // useFrame(() => {
  //   if (group.current) 
  //       group.current.position.set(xPos, 0, 50); 
  // });

  return <primitive ref={group} object={scene} position={[xPos, 0, 50]} rotation={[0, Math.PI, 0]} scale={[1.5, 1.5, 1.5]}/>;
}

function Model({ filename }) {
  const path = `/models/game models/${filename}`;
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

function MovingCar({ position, filename, speed = 0.2 }) {
    const ref = useRef();
    // const [initialZ] = useState(position[2]); 

    useEffect(() => {
        if (ref.current) {
        ref.current.position.set(...position);
        }
    }, [position]);

    useFrame(() => {
        if (ref.current) {
        ref.current.position.z += speed;
        if (ref.current.position.z > 60) {
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

function Road() {
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
      <planeGeometry args={[20, 200]} />
      <meshStandardMaterial ref={materialRef} map={texture} />
    </mesh>
  );
}

export function Game() {
    const [cars, setCars] = useState([]);

    useEffect(() => {
        setCars(getRandomCarsForLanes());
    }, []);

    // useEffect(() => {
    //   setCars(getRandomCars(4)); // or however many cars you want
    // }, []);

    return (
        <div>

        <div style={{ height: '100vh', background: 'deepskyblue' }}>
            <Canvas camera={{ position: [0, 3, 58], fov: 55 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[0, 10, 5]} intensity={1} />

            <Road />

            {/* Spawn random cars */}
            {cars.map((car, index) => (
                <MovingCar
                key={index}
                position={[car.x, 0, car.z]}
                filename={car.model}
                speed={car.speed}
                />
            ))}

            <RunnerCharacter filename="philRun.glb" />

            <OrbitControls />
            </Canvas>
        </div>
        </div>
    );
}