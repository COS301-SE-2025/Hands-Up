import React,  { useRef, useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF,  Loader } from '@react-three/drei';
import { BiSolidChevronLeft, BiSolidChevronRight } from "react-icons/bi";
import { ImArrowLeft, ImArrowRight } from "react-icons/im";
import Road from '../components/game/road';
import Runner from '../components/game/runner';
import Cars from '../components/game/cars';

const carModels = [
  'suzuki swift.glb',
  'vw golf gti.glb',
  'peugeot 206.glb',
  'toyota hilux.glb',
  'toyota fortuner.glb',
  'taxi.glb',
];

const xlanes = [-6, -3, 3, -6]; 

function getRandomCarsForLanes() {
  return xlanes.map((laneX) => ({
    x: laneX,
    z: -Math.random() * 100, // start at random Z between -100 and 0
    model: carModels[Math.floor(Math.random() * carModels.length)],
    speed: 0.1 + Math.random() * 0.2, // optional: different speeds
  }));
}

function Model({ filename }) {
  const path = `/models/game models/${filename}`;
  const { scene } = useGLTF(path);
  return <primitive object={scene} />;
}

function MovingCar({ position, filename, speed = 0.2 }) {
    const ref = useRef();

    // const car = getCar(); 

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

export function Game() {
    const [cars, setCars] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        setCars(getRandomCarsForLanes());
    }, []);

    return (
      <div style={{ position: 'relative', height: '100vh' }}>   

        <div style={{ height: '100%', filter: gameStarted ? 'none' : 'blur(5px)', transition: 'filter 0.5s', background: 'deepskyblue' }}>             
          <Canvas camera={{ position: [0, 3, 58], fov: 55 }}>
            <Suspense fallback={null}>
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

              {gameStarted && <Runner filename="philRun.glb" />}
            </Suspense>
          </Canvas>
        </div>
        <Loader />

        {!gameStarted && (
          <div
            style={{
              position: 'absolute',
              top: '23%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              textAlign: 'center',
              width: '35%', 
              backgroundColor: '#4e7a51',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}
          >
              <div
                style={{
                  backgroundColor: '#4e7a51',
                  borderRadius: '12px',
                  border: '4px solid white',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'row', 
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: '5%',
                }}
              >
                <Link to="/home" style={{ textDecoration: 'none', cursor: 'pointer', marginTop: '3%' }}><span style={{ color: 'white', fontSize: '45px', fontWeight: 'bold', marginTop: '3%' }}><ImArrowLeft /></span></Link>
                <span style={{ color: '#ffcc00', fontSize: '45px', fontWeight: 'bold' }}>G12</span>
                <span style={{ color: 'white', fontSize: '45px', fontWeight: 'bold' }}>Sign Surfers</span>
              </div>

              <button
                onClick={() => setGameStarted(true)}
                style={{
                  backgroundColor: '#4e7a51',
                  borderRadius: '12px',
                  border: '4px solid white',
                  padding: '12px 16px',
                  fontSize: '35px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '25px',
                }}
              >
                START <span style={{ fontSize: '35px', marginTop: '1%' }}><ImArrowRight /></span>
              </button>

              <div
                style={{
                  backgroundColor: 'whitesmoke',
                  borderRadius: '12px',
                  border: '4px solid white',
                  // padding: '0',
                  color: 'red',
                  fontSize: '40px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // gap: '12px',
                }}
              >
                <span><BiSolidChevronLeft /><BiSolidChevronLeft /><BiSolidChevronLeft /></span>
                <span style={{ margin: '0 120px' }} />
                <span><BiSolidChevronRight /><BiSolidChevronRight /><BiSolidChevronRight /></span>
              </div>
          </div>
        )}

      </div>
    );
}