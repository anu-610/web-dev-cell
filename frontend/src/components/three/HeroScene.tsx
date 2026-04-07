import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import NeuralNetwork from './NeuralNetwork'

function OrbitingLights() {
  const cyan = useRef<THREE.PointLight>(null!)
  const violet = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    cyan.current.position.set(Math.sin(t * 0.27) * 8, Math.cos(t * 0.19) * 5, Math.sin(t * 0.12) * 4)
    violet.current.position.set(Math.cos(t * 0.22) * 8, Math.sin(t * 0.15) * 5, Math.cos(t * 0.10) * 4)
  })

  return (
    <>
      <ambientLight intensity={0.05} />
      <pointLight ref={cyan} color="#06b6d4" intensity={2} distance={20} />
      <pointLight ref={violet} color="#8b5cf6" intensity={1.5} distance={20} />
    </>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 58, near: 0.1, far: 100 }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <OrbitingLights />
      <Suspense fallback={null}>
        <NeuralNetwork />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.4} luminanceThreshold={0} luminanceSmoothing={0.85} radius={0.55} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
