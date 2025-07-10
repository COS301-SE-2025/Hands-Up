import React, { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'

function Model() {
    const group = useRef()
    const { scene, animations } = useGLTF('/models/angieWaving.glb')
    const { actions } = useAnimations(animations, group)

    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
        const firstAction = actions[Object.keys(actions)[0]]
        firstAction.play()
        }
    }, [actions])

    return <primitive ref={group} object={scene} scale={1.9} />
}

export default function ModelViewer() {
  return (
    <Canvas camera={{ position: [-0.5, 3, 5] }}>
      <ambientLight />
      <ambientLight intensity={10} color="white" />
      <Model />
    </Canvas>
  )
}