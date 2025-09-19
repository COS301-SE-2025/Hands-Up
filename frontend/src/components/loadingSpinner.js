/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

function SpinnerModel() {
  const { scene, animations } = useGLTF("/models/angieLoad.glb");
  const { actions } = useAnimations(animations, scene);
  const groupRef = useRef();

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      Object.values(actions).forEach(action => action.play());
    }
  }, [actions]);

  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const center = box.getCenter(new THREE.Vector3());
      groupRef.current.position.y -= center.y; 
    }
  }, []);

  return (
    <group ref={groupRef} scale={2}>
      <primitive object={scene} />
    </group>
  );
}

export default function LoadingSpinner() {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#FAFAFA", 
      zIndex: 9999,
      flexDirection: 'column',
    }}>
      <div style={{ width: '20vw', height: '20vw', marginBottom: '2vh' }}>
        <Canvas camera={{ position: [0, 1, 5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={10} />
          <Suspense fallback={null}>
            <SpinnerModel />
          </Suspense>
        </Canvas>
      </div>

      <span className="loader"></span>

      <style>{`
        .loader {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: block;
          position: relative;
          color: #7ED957;
          box-sizing: border-box;
          animation: animloader 2s linear infinite;
        }

        @keyframes animloader {
          0% { box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 -2px; }
          25% { box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 2px; }
          50% { box-shadow: 14px 0 0 -2px,  38px 0 0 -2px,  -14px 0 0 2px,  -38px 0 0 -2px; }
          75% { box-shadow: 14px 0 0 2px,  38px 0 0 -2px,  -14px 0 0 -2px,  -38px 0 0 -2px; }
          100% { box-shadow: 14px 0 0 -2px,  38px 0 0 2px,  -14px 0 0 -2px,  -38px 0 0 -2px; }
        }
      `}</style>
    </div>
  );
}