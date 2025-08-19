/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import PropTypes from 'prop-types';

function Model({modelPath}) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelPath)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      actions[Object.keys(actions)[0]].play()
    }
  }, [actions])

  return <primitive ref={group} object={scene} scale={1.85} />
}

Model.propTypes = {
  modelPath: PropTypes.string.isRequired
}

export default function ModelViewer({modelPath }) {
  return (
    <Canvas camera={{ position: [-0.5, 3, 5] }}>
      <ambientLight />
      <ambientLight intensity={8} color="white" />
      <Model modelPath={modelPath} />
    </Canvas>
  )
}

ModelViewer.propTypes = {
  modelPath: PropTypes.string.isRequired
}