import React, { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'

function Model({modelPath}) {
  const group = useRef()
  const { scene, animations } = useGLTF(modelPath)
  const { actions } = useAnimations(animations, group)

  console.log('animations:', animations)
  console.log('scene:', scene)

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = actions[Object.keys(actions)[0]]
      firstAction.play()
    }
  }, [actions])

    return <primitive ref={group} object={scene} scale={1.85} />
}

export default function ModelViewer({modelPath}) {
  return (
    <Canvas camera={{ position: [-0.5, 3, 5] }}>
      <ambientLight />
      <ambientLight intensity={10} color="white" />
      <Model modelPath={modelPath}/>
    </Canvas>
  )
}