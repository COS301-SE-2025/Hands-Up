import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import PropTypes from 'prop-types';

// Angie Model Component that matches your structure
/* eslint-disable react/no-unknown-property */
function AngieEditor({ boneRotations, onBoneUpdate }) {
  const { scene } = useGLTF('/models/angieWaving.glb');
  const bones = useRef({});
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    if (!scene) return;

    // Extract bones just like in your AngieSings component
    scene.traverse((obj) => {
      if (obj.isBone && obj.name.startsWith('mixamorig')) {
        bones.current[obj.name] = obj;
      }
    });

    // Apply initial pose like in your original
    const upperArmL = bones.current['mixamorigLeftArm'];
    const upperArmR = bones.current['mixamorigRightArm'];
    const foreArmR = bones.current['mixamorigRightForeArm'];
    const handR = bones.current['mixamorigRightHand'];

    if (upperArmL) upperArmL.rotation.x = 1.1;
    if (upperArmR) {
      upperArmR.rotation.x = 0.9;
      upperArmR.rotation.z = -0.3;
    }
    if (foreArmR) {
      foreArmR.rotation.x = 0.5;
      foreArmR.rotation.z = -2.8;
    }
    if (handR) handR.rotation.y = -1.5;

    setModelReady(true);
    
    // Report available bones
    if (onBoneUpdate) {
      onBoneUpdate(Object.keys(bones.current));
    }
  }, [scene, onBoneUpdate]);

  useFrame(() => {
    if (!modelReady) return;

    // Apply current rotations to bones
    Object.keys(boneRotations).forEach(boneName => {
      const bone = bones.current[boneName];
      if (bone && boneRotations[boneName]) {
        const [x, y, z] = boneRotations[boneName];
        bone.rotation.set(x, y, z);
      }
    });
  });

  return (
    <primitive 
      object={scene} 
      scale={4} 
      position={[0, -2, 0]} 
    />
  );
}

AngieEditor.propTypes = {
  boneRotations: PropTypes.object.isRequired,
  onBoneUpdate: PropTypes.func
};

export function Home() {
  const [currentWord, setCurrentWord] = useState('');
  const [currentKeyframe, setCurrentKeyframe] = useState(0);
  const [keyframes, setKeyframes] = useState([]);
  const [selectedBone, setSelectedBone] = useState('mixamorigRightHand');
  const [boneRotations, setBoneRotations] = useState({});
  const [animationData, setAnimationData] = useState({});
  const [availableBones, setAvailableBones] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const animationRef = useRef();

  const boneGroups = {
    'Right Arm': [
      'mixamorigRightArm',
      'mixamorigRightForeArm', 
      'mixamorigRightHand'
    ],
    'Right Hand Fingers': [
      'mixamorigRightHandThumb1', 'mixamorigRightHandThumb2', 'mixamorigRightHandThumb3',
      'mixamorigRightHandIndex1', 'mixamorigRightHandIndex2', 'mixamorigRightHandIndex3',
      'mixamorigRightHandMiddle1', 'mixamorigRightHandMiddle2', 'mixamorigRightHandMiddle3',
      'mixamorigRightHandRing1', 'mixamorigRightHandRing2', 'mixamorigRightHandRing3',
      'mixamorigRightHandPinky1', 'mixamorigRightHandPinky2', 'mixamorigRightHandPinky3'
    ],
    'Left Arm': [
      'mixamorigLeftArm',
      'mixamorigLeftForeArm',
      'mixamorigLeftHand'
    ],
    'Left Hand Fingers': [
      'mixamorigLeftHandThumb1', 'mixamorigLeftHandThumb2', 'mixamorigLeftHandThumb3',
      'mixamorigLeftHandIndex1', 'mixamorigLeftHandIndex2', 'mixamorigLeftHandIndex3',
      'mixamorigLeftHandMiddle1', 'mixamorigLeftHandMiddle2', 'mixamorigLeftHandMiddle3',
      'mixamorigLeftHandRing1', 'mixamorigLeftHandRing2', 'mixamorigLeftHandRing3',
      'mixamorigLeftHandPinky1', 'mixamorigLeftHandPinky2', 'mixamorigLeftHandPinky3'
    ]
  };

  const commonHandPoses = {
    'Open Hand (Right)': {
      'mixamorigRightHandThumb1': [0, 0, -0.4],
      'mixamorigRightHandThumb2': [0, 0, 0.8],
      'mixamorigRightHandThumb3': [0, 0, 1],
      'mixamorigRightHandIndex1': [0, 0, 0],
      'mixamorigRightHandIndex2': [0, 0, 0],
      'mixamorigRightHandMiddle1': [0, 0, 0],
      'mixamorigRightHandMiddle2': [0, 0, 0],
      'mixamorigRightHandRing1': [0, 0, 0],
      'mixamorigRightHandRing2': [0, 0, 0],
      'mixamorigRightHandPinky1': [0, 0, 0],
      'mixamorigRightHandPinky2': [0, 0, 0]
    },
    'Fist (Right)': {
      'mixamorigRightHandThumb1': [0, 0, -1],
      'mixamorigRightHandThumb2': [1, 0, 0],
      'mixamorigRightHandIndex1': [1.5, 0, 0],
      'mixamorigRightHandIndex2': [2, 0, 0],
      'mixamorigRightHandIndex3': [2, 0, 0],
      'mixamorigRightHandMiddle1': [1.5, 0, 0],
      'mixamorigRightHandMiddle2': [2, 0, 0],
      'mixamorigRightHandMiddle3': [2, 0, 0],
      'mixamorigRightHandRing1': [1.5, 0, 0],
      'mixamorigRightHandRing2': [2, 0, 0],
      'mixamorigRightHandRing3': [2, 0, 0],
      'mixamorigRightHandPinky1': [1.5, 0, 0],
      'mixamorigRightHandPinky2': [2, 0, 0],
      'mixamorigRightHandPinky3': [2, 0, 0]
    }
  };

  const initializeKeyframe = () => {
    const newKeyframe = {};
    Object.values(boneGroups).flat().forEach(bone => {
      newKeyframe[bone] = [0, 0, 0];
    });
    return newKeyframe;
  };

  const addKeyframe = () => {
    const newKeyframe = { ...boneRotations };
    setKeyframes(prev => [...prev, newKeyframe]);
    setCurrentKeyframe(keyframes.length);
  };

  const deleteKeyframe = (index) => {
    if (keyframes.length > 1) {
      setKeyframes(prev => prev.filter((_, i) => i !== index));
      if (currentKeyframe >= keyframes.length - 1) {
        setCurrentKeyframe(Math.max(0, keyframes.length - 2));
      }
    }
  };

  const updateBoneRotation = (boneName, axis, value) => {
    const newRotation = [...(boneRotations[boneName] || [0, 0, 0])];
    const axisIndex = ['x', 'y', 'z'].indexOf(axis);
    newRotation[axisIndex] = parseFloat(value);
    
    setBoneRotations(prev => ({
      ...prev,
      [boneName]: newRotation
    }));

    // Update current keyframe
    if (keyframes[currentKeyframe]) {
      const updatedKeyframes = [...keyframes];
      updatedKeyframes[currentKeyframe] = {
        ...updatedKeyframes[currentKeyframe],
        [boneName]: newRotation
      };
      setKeyframes(updatedKeyframes);
    }
  };

  const applyHandPose = (poseName) => {
    const pose = commonHandPoses[poseName];
    if (!pose) return;
    
    const updatedRotations = { ...boneRotations };
    Object.keys(pose).forEach(boneName => {
      updatedRotations[boneName] = pose[boneName];
    });
    
    setBoneRotations(updatedRotations);
    
    if (keyframes[currentKeyframe]) {
      const updatedKeyframes = [...keyframes];
      updatedKeyframes[currentKeyframe] = {
        ...updatedKeyframes[currentKeyframe],
        ...pose
      };
      setKeyframes(updatedKeyframes);
    }
  };

  const generateJSON = () => {
    if (!currentWord || keyframes.length === 0) {
      alert('Please enter a word and create at least one keyframe');
      return;
    }

    const result = {
      [currentWord]: {}
    };

    // Generate keyframes in the format your system expects
    Object.values(boneGroups).flat().forEach(boneName => {
      const boneKeyframes = keyframes.map(kf => kf[boneName] || [0, 0, 0]);
      result[currentWord][boneName] = {
        keyframes: boneKeyframes
      };
    });

    setAnimationData(result);
  };

  const loadKeyframe = (index) => {
    if (keyframes[index]) {
      setCurrentKeyframe(index);
      setBoneRotations(keyframes[index]);
    }
  };

  const playAnimation = () => {
    if (keyframes.length < 2) return;
    
    setIsPlaying(true);
    setPlaybackProgress(0);
    
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setPlaybackProgress(progress);
      
      // Interpolate between keyframes
      const totalFrames = keyframes.length - 1;
      const frameProgress = progress * totalFrames;
      const frameIndex = Math.floor(frameProgress);
      const frameFraction = frameProgress - frameIndex;
      
      if (frameIndex < keyframes.length - 1) {
        const currentFrame = keyframes[frameIndex];
        const nextFrame = keyframes[frameIndex + 1];
        
        const interpolatedRotations = {};
        Object.keys(currentFrame).forEach(boneName => {
          const current = currentFrame[boneName] || [0, 0, 0];
          const next = nextFrame[boneName] || [0, 0, 0];
          
          interpolatedRotations[boneName] = [
            current[0] + (next[0] - current[0]) * frameFraction,
            current[1] + (next[1] - current[1]) * frameFraction,
            current[2] + (next[2] - current[2]) * frameFraction
          ];
        });
        
        setBoneRotations(interpolatedRotations);
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setPlaybackProgress(0);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setPlaybackProgress(0);
    if (keyframes[currentKeyframe]) {
      setBoneRotations(keyframes[currentKeyframe]);
    }
  };

  useEffect(() => {
    if (keyframes.length === 0) {
      const initialKeyframe = initializeKeyframe();
      setKeyframes([initialKeyframe]);
      setBoneRotations(initialKeyframe);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 flex">
      {/* Left Panel - Controls */}
      <div className="w-1/3 bg-white shadow-lg overflow-y-auto p-4">
        {/* Word Setup */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-blue-600">ASL Sign Creator</h2>
          <input
            type="text"
            placeholder="Enter ASL sign name (e.g., 'hello', 'thank_you')"
            value={currentWord}
            onChange={(e) => setCurrentWord(e.target.value)}
            className="w-full p-2 border rounded mb-3 focus:border-blue-500 outline-none"
          />
          <p className="text-sm text-gray-600">
            Available bones: {availableBones.length}
          </p>
        </div>

        {/* Animation Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Animation</h3>
          <div className="flex gap-2 mb-3">
            <button
              onClick={playAnimation}
              disabled={isPlaying || keyframes.length < 2}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Play
            </button>
            <button
              onClick={stopAnimation}
              disabled={!isPlaying}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
            >
              Stop
            </button>
          </div>
          {isPlaying && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-100" 
                style={{ width: `${playbackProgress * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Keyframe Management */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Keyframes ({keyframes.length})</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {keyframes.map((_, index) => (
              <button
                key={index}
                onClick={() => loadKeyframe(index)}
                className={`px-3 py-1 rounded text-sm ${
                  currentKeyframe === index 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={addKeyframe}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Add Keyframe
            </button>
            <button
              onClick={() => deleteKeyframe(currentKeyframe)}
              disabled={keyframes.length <= 1}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-300"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Hand Pose Presets */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Hand Poses</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(commonHandPoses).map(poseName => (
              <button
                key={poseName}
                onClick={() => applyHandPose(poseName)}
                className="px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
              >
                {poseName}
              </button>
            ))}
          </div>
        </div>

        {/* Bone Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Bone Rotations</h3>
          <select
            value={selectedBone}
            onChange={(e) => setSelectedBone(e.target.value)}
            className="w-full p-2 border rounded mb-3 focus:border-blue-500 outline-none"
          >
            {Object.entries(boneGroups).map(([groupName, bones]) => (
              <optgroup key={groupName} label={groupName}>
                {bones.map(boneName => (
                  <option key={boneName} value={boneName}>
                    {boneName.replace('mixamorig', '').replace(/([A-Z])/g, ' $1')}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Rotation Controls for Selected Bone */}
          <div className="space-y-3">
            {['x', 'y', 'z'].map(axis => (
              <div key={axis}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {axis.toUpperCase()}: {(boneRotations[selectedBone]?.[['x', 'y', 'z'].indexOf(axis)] || 0).toFixed(2)}
                </label>
                <input
                  type="range"
                  min="-3.14"
                  max="3.14"
                  step="0.05"
                  value={boneRotations[selectedBone]?.[['x', 'y', 'z'].indexOf(axis)] || 0}
                  onChange={(e) => updateBoneRotation(selectedBone, axis, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Generate JSON */}
        <div className="mt-6">
          <button
            onClick={generateJSON}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700"
          >
            Generate JSON for {currentWord || 'Sign'}
          </button>
        </div>
      </div>

      {/* Right Panel - 3D View and JSON Output */}
      <div className="w-2/3 flex flex-col">
        {/* 3D Canvas */}
        <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 min-h-96">
          <Canvas camera={{ position: [0, 1, 2], fov: 75 }}>
            {/* eslint-disable react/no-unknown-property */}
            <ambientLight intensity={5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            {/* eslint-enable react/no-unknown-property */}
            <AngieEditor 
              boneRotations={boneRotations}
              onBoneUpdate={setAvailableBones}
            />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>

        {/* JSON Output */}
        {Object.keys(animationData).length > 0 && (
          <div className="h-64 bg-gray-900 text-green-400 p-4 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Generated JSON</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(animationData, null, 2));
                  alert('JSON copied to clipboard!');
                }}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Copy JSON
              </button>
            </div>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(animationData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}