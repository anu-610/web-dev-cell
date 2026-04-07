import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ── Config ────────────────────────────────────────────────
const NODE_COUNT = 110
const SPREAD = 9
const CONNECT_DIST = 3.0       // max edge length
const REPEL_RADIUS = 2.5       // mouse repulsion radius
const REPEL_FORCE = 0.10
const SPRING = 0.022           // return-to-origin spring
const DAMPING = 0.88
const FLOAT_AMP = 0.0004       // subtle per-node floating

interface Node {
  pos: THREE.Vector3
  origin: THREE.Vector3
  vel: THREE.Vector3
  size: number
  color: THREE.Color
}

// Fibonacci sphere for even distribution
function fibSphere(n: number, spread: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = []
  const ga = Math.PI * (1 + Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n)
    const theta = ga * i
    const r = spread * (0.35 + Math.random() * 0.65)
    pts.push(new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) * 0.55,  // flatten Y
      r * Math.cos(phi) * 0.45,                      // shallow Z
    ))
  }
  return pts
}

// Scratch vector — avoids GC pressure in hot loop
const _v = new THREE.Vector3()

export default function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const linesRef = useRef<THREE.LineSegments>(null!)
  const mouse3D = useRef(new THREE.Vector3(9999, 9999, 0))
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const { viewport } = useThree()

  // ── Nodes ────────────────────────────────────────────────
  const nodes = useMemo<Node[]>(() => {
    const hues = [0.525, 0.526, 0.760, 0.762, 0.525, 0.760]
    return fibSphere(NODE_COUNT, SPREAD).map((p, i) => ({
      pos: p.clone(),
      origin: p.clone(),
      vel: new THREE.Vector3(),
      size: 0.045 + Math.random() * 0.085,
      color: new THREE.Color().setHSL(hues[i % hues.length], 1, 0.55 + Math.random() * 0.35),
    }))
  }, [])

  // ── Connections (computed from rest positions) ─────────
  const connections = useMemo<[number, number][]>(() => {
    const pairs: [number, number][] = []
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++)
        if (nodes[i].origin.distanceTo(nodes[j].origin) < CONNECT_DIST)
          pairs.push([i, j])
    return pairs
  }, [nodes])

  // ── Line geometry (dynamic buffer) ──────────────────────
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(connections.length * 6), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(connections.length * 6), 3))
    return g
  }, [connections])

  // ── Seed instanced mesh ──────────────────────────────────
  useEffect(() => {
    const m = meshRef.current
    if (!m) return
    nodes.forEach((n, i) => {
      dummy.position.copy(n.pos)
      dummy.scale.setScalar(n.size)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, n.color)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [nodes, dummy])

  // ── Animation loop ────────────────────────────────────────
  useFrame(({ mouse, clock }) => {
    // Map NDC mouse → 3D world plane z=0
    mouse3D.current.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0,
    )

    // Slow group orbit
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.038
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.017) * 0.08
    }

    const posArr = lineGeo.attributes.position.array as Float32Array
    const colArr = lineGeo.attributes.color.array as Float32Array

    nodes.forEach((n, i) => {
      // Mouse repulsion
      const d = n.pos.distanceTo(mouse3D.current)
      if (d < REPEL_RADIUS) {
        const s = ((REPEL_RADIUS - d) / REPEL_RADIUS) * REPEL_FORCE
        n.vel.addScaledVector(_v.copy(n.pos).sub(mouse3D.current).normalize(), s)
      }
      // Subtle float
      n.vel.y += Math.sin(clock.elapsedTime * 0.6 + i * 0.23) * FLOAT_AMP
      // Spring to origin
      n.vel.addScaledVector(_v.copy(n.origin).sub(n.pos), SPRING)
      // Damping
      n.vel.multiplyScalar(DAMPING)
      n.pos.add(n.vel)

      // Update matrix
      dummy.position.copy(n.pos)
      dummy.scale.setScalar(n.size)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true

    // Update edge buffers
    connections.forEach(([i, j], idx) => {
      const pi = nodes[i].pos
      const pj = nodes[j].pos
      const dist = pi.distanceTo(pj)
      const alpha = Math.max(0, 1 - dist / CONNECT_DIST) * 0.55
      const t = dist / CONNECT_DIST
      // Cyan → Violet colour blend along edge
      const r = (1 - t) * 0.13 + t * 0.55
      const g = (1 - t) * 0.75 + t * 0.36
      const b = (1 - t) * 0.85 + t * 0.98

      const base = idx * 6
      posArr[base] = pi.x;     posArr[base+1] = pi.y;     posArr[base+2] = pi.z
      posArr[base+3] = pj.x;   posArr[base+4] = pj.y;     posArr[base+5] = pj.z
      colArr[base] = r*alpha;   colArr[base+1] = g*alpha;  colArr[base+2] = b*alpha
      colArr[base+3] = r*alpha; colArr[base+4] = g*alpha;  colArr[base+5] = b*alpha
    })
    lineGeo.attributes.position.needsUpdate = true
    lineGeo.attributes.color.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      {/* Single draw call for all 110 nodes */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODE_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 7, 7]} />
        <meshBasicMaterial vertexColors toneMapped={false} />
      </instancedMesh>

      {/* Dynamic edges */}
      <lineSegments ref={linesRef} geometry={lineGeo} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent toneMapped={false} />
      </lineSegments>
    </group>
  )
}
