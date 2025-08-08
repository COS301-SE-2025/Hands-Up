import React,  { useState, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas} from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { BiSolidChevronLeft, BiSolidChevronRight } from "react-icons/bi";
import { ImArrowLeft, ImArrowRight } from "react-icons/im";
import { RunnerPosProvider } from '../contexts/game/runnerPosition';
import { VehicleSpawner } from '../components/game/cars';
import Road from '../components/game/road';
import Runner from '../components/game/runner';
// import Runner from '../components/game/runner';
// import Distance from '../components/game/distance';
// import Cars from '../components/game/cars';

// const carModels = [
//   'suzuki swift.glb',
//   'vw golf gti.glb',
//   'peugeot 206.glb',
//   'toyota hilux.glb',
//   'toyota fortuner.glb',
//   'taxi.glb',
// ];

// const xlanes = [-6, -3, 3, -6]; 

// function getRandomCarsForLanes() {
//   return xlanes.map((laneX) => ({
//     x: laneX,
//     z: -Math.random() * 100, // start at random Z between -100 and 0
//     model: carModels[Math.floor(Math.random() * carModels.length)],
//     speed: 0.1 + Math.random() * 0.2, // optional: different speeds
//   }));
// }

// function Model({ filename }) {
//   const path = `/models/game models/${filename}`;
//   const { scene } = useGLTF(path);
//   return <primitive object={scene} />;
// }

// function MovingCar({ position, filename, speed = 0.2, distance }) {
//     const ref = useRef();

//     // const car = getCar(); 

//     useEffect(() => {
//       if (ref.current) {
//         ref.current.position.set(...position);
//       }
//     }, [position]);

//     useFrame(() => {
//       if (ref.current) {
//         ref.current.position.z += 0.5;
//         if (ref.current.position.z > 60) {
//             ref.current.position.z = -50; 
//         }
//       }
//     });

//     return (
//       <group ref={ref} position={position}>
//         <Model filename={filename} />
//       </group>
//     );
// }

export function Game() {
    const [gameStarted, setGameStarted] = useState(false);
    const [lives, setLives] = useState(3);
    const [distance, setDistance] = useState(0);

    const handleCollision = () => {
      setLives(l => Math.max(l - 1, 0));
    };

    return (
      <div style={{ position: 'relative', height: '100vh' }}>   
        <div style={{ height: '100%', filter: gameStarted ? 'none' : 'blur(5px)', transition: 'filter 0.5s', background: 'deepskyblue' }}> 

          <div style={{ position: 'absolute', left: '1%', color: '#ffcc00', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 20px 0px', fontSize: '28px', fontWeight: 'bold' }}>
              Distance: {distance} m
            </div>
            <div style={{ padding: '0px 20px', fontSize: '28px', fontWeight: 'bold' }}>
              Lives: {lives}
            </div>
          </div>

          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', right: '1.5%'}} > 
            <svg width="80" height="80" viewBox="0 0 120 104" style={{ cursor: 'pointer' }} 
              onClick={() => { console.log("clicked stop")}}>
              <polygon points="60,0 115,30 115,74 60,104 5,74 5,30" fill="red" transform="translate(60 52) scale(0.85) translate(-60 -52)" stroke='white' strokeWidth={12}/>
              <text x="60" y="54" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="22" fontWeight="bold" pointerEvents="none">
                STOP
              </text>
            </svg>
            <svg width="80" height="80" style={{ cursor: 'pointer' }} viewBox="0 0 80 80" >
              <polygon points="10,15 70,15 40,65" fill="white" stroke='red' strokeWidth={8} />
            </svg>
          </div>
          
          <RunnerPosProvider>
          <Canvas camera={{ position: [0, 3, 58], fov: 55 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[0, 10, 5]} intensity={1} />

              <Road />
              <Runner />
              <VehicleSpawner onCollision={handleCollision} />

            </Suspense>
          </Canvas>
          </RunnerPosProvider>
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
              width: '50%', 
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
                <Link to="/home" style={{ textDecoration: 'none', cursor: 'pointer', marginTop: '2%' }}><span style={{ color: 'white', fontSize: '2.34vw', fontWeight: 'bold', marginTop: '3%' }}><ImArrowLeft /></span></Link>
                <span style={{ color: '#ffcc00', fontSize: '2.34vw', fontWeight: 'bold' }}>G12</span>
                <span style={{ color: 'white', fontSize: '2.34vw', fontWeight: 'bold' }}>Sign Surfers</span>
              </div>

              <button
                onClick={() => setGameStarted(true)}
                style={{
                  backgroundColor: '#4e7a51',
                  borderRadius: '12px',
                  border: '4px solid white',
                  padding: '12px 16px',
                  fontSize: '1.82vw',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '25px',
                }}
              >
                START <span style={{ fontSize: '1.82vw', marginTop: '1%' }}><ImArrowRight /></span>
              </button>

              <div
                style={{
                  backgroundColor: 'whitesmoke',
                  borderRadius: '12px',
                  border: '4px solid white',
                  // padding: '0',
                  color: 'red',
                  fontSize: '2vw',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // gap: '12px',
                }}
              >
                <span><BiSolidChevronLeft /><BiSolidChevronLeft /><BiSolidChevronLeft /></span>
                <span style={{ margin: '0 16vw' }} />
                <span><BiSolidChevronRight /><BiSolidChevronRight /><BiSolidChevronRight /></span>
              </div>
          </div>
        )}

      </div>
    );
}