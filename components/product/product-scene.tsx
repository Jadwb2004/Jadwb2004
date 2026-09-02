'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { models, type ProductId } from '@/lib/brand-content'

type OrbitControlsImpl = NonNullable<React.ComponentRef<typeof OrbitControls>>

type SceneProps = {
  productId: ProductId
  onReady: () => void
  onError: () => void
  resetRef: React.MutableRefObject<(() => void) | null>
}

/**
 * Serum: the owner-supplied 360° GLB, normalised to a consistent size.
 * Cream: a procedural frosted jar with a polished lid, matching the export
 * (which also built the cream jar procedurally rather than from a model).
 */
export function ProductScene({ productId, onReady, onError, resetRef }: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    resetRef.current = () => controlsRef.current?.reset()
    return () => {
      resetRef.current = null
    }
  }, [resetRef])

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.3, 8.2], fov: 28, near: 0.05, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
      className="touch-none"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={2.6} color="#fff2d6" />
      <directionalLight position={[-4, 3, -5]} intensity={1.4} color="#d7e6ff" />
      <pointLight position={[2, 1.3, 2]} intensity={12} distance={12} color="#f3d5ae" />

      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.55} />
        <AutoRotate controls={controlsRef}>
          {productId === 'advanced-plumping-serum' ? (
            <SerumModel onReady={onReady} onError={onError} />
          ) : (
            <CreamJar onReady={onReady} />
          )}
        </AutoRotate>
        <ContactShadows position={[0, -1.55, 0]} opacity={0.42} scale={7} blur={2.4} far={3} color="#2a2420" />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.075}
        minDistance={5}
        maxDistance={11}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.62}
        target={[0, 0, 0]}
        makeDefault
      />
    </Canvas>
  )
}

/** Gentle idle rotation that pauses while the visitor is orbiting. */
function AutoRotate({
  children,
  controls,
}: {
  children: React.ReactNode
  controls: React.MutableRefObject<OrbitControlsImpl | null>
}) {
  const group = useRef<THREE.Group>(null)
  const interacting = useRef(false)
  const resumeAt = useRef(0)

  useEffect(() => {
    const ctrl = controls.current
    if (!ctrl) return
    const start = () => {
      interacting.current = true
    }
    const end = () => {
      interacting.current = false
      resumeAt.current = performance.now() + 1400
    }
    ctrl.addEventListener('start', start)
    ctrl.addEventListener('end', end)
    return () => {
      ctrl.removeEventListener('start', start)
      ctrl.removeEventListener('end', end)
    }
  }, [controls])

  useFrame((_, delta) => {
    if (!group.current || interacting.current || performance.now() < resumeAt.current) return
    group.current.rotation.y += delta * 0.28
  })

  return <group ref={group}>{children}</group>
}

function SerumModel({ onReady, onError }: { onReady: () => void; onError: () => void }) {
  const { scene } = useGLTF(models['advanced-plumping-serum'])

  const normalised = useMemo(() => {
    try {
      const clone = scene.clone(true)
      const box = new THREE.Box3().setFromObject(clone)
      const size = box.getSize(new THREE.Vector3())

      // A bottle is tallest along one axis; stand it upright on Y regardless
      // of how the file was exported.
      const wrapper = new THREE.Group()
      if (size.z >= size.x && size.z >= size.y) {
        wrapper.rotation.x = -Math.PI / 2
      } else if (size.x >= size.y && size.x >= size.z) {
        wrapper.rotation.z = Math.PI / 2
      }
      wrapper.add(clone)

      const scale = 3.1 / Math.max(size.x, size.y, size.z)
      wrapper.scale.setScalar(scale)
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      return wrapper
    } catch {
      onError()
      return null
    }
  }, [scene, onError])

  useEffect(() => {
    if (normalised) onReady()
  }, [normalised, onReady])

  if (!normalised) return null
  return (
    <Center>
      <primitive object={normalised} />
    </Center>
  )
}

function CreamJar({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <Center>
      <group>
        {/* frosted glass body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.05, 1.0, 1.35, 96, 1]} />
          <meshPhysicalMaterial
            color="#efe6d8"
            roughness={0.42}
            transmission={0.55}
            thickness={1.1}
            ior={1.45}
            clearcoat={0.35}
            clearcoatRoughness={0.3}
            attenuationColor="#f5ecdd"
            attenuationDistance={1.6}
          />
        </mesh>
        {/* cream fill visible through frosted glass */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.92, 0.9, 1.1, 64]} />
          <meshStandardMaterial color="#f7f0e3" roughness={0.9} />
        </mesh>
        {/* base ring */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[1.0, 0.98, 0.06, 96]} />
          <meshStandardMaterial color="#d9d2c6" roughness={0.35} metalness={0.15} />
        </mesh>
        {/* polished lid */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[1.08, 1.08, 0.46, 96]} />
          <meshStandardMaterial color="#e4e3df" roughness={0.12} metalness={0.95} />
        </mesh>
        <mesh position={[0, 1.135, 0]}>
          <cylinderGeometry args={[1.02, 1.08, 0.03, 96]} />
          <meshStandardMaterial color="#f1f0ec" roughness={0.08} metalness={1} />
        </mesh>
        {/* engraved band */}
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[1.085, 0.012, 16, 128]} />
          <meshStandardMaterial color="#b9b3a8" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
    </Center>
  )
}

useGLTF.preload(models['advanced-plumping-serum'])
