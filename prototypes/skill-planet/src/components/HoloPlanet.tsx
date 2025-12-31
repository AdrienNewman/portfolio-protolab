import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

interface HoloPlanetProps {
  skillName: string
  logoUrl?: string
}

// Couleurs neon du portfolio
const NEON_CYAN = '#00ffff'
const NEON_MAGENTA = '#ff0080'

function HoloPlanet({ skillName: _skillName, logoUrl: _logoUrl }: HoloPlanetProps) {
  const groupRef = useRef<THREE.Group>(null)
  const scanLineRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Note: logoUrl sera utilisé plus tard avec un loader async
  void _skillName
  void _logoUrl

  // Créer une géométrie de sphère wireframe custom avec plus de détails
  const wireframeGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 2)
    return geo
  }, [])

  // Animation frame
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Rotation de base + accélération au hover
    const baseSpeed = 0.15
    const hoverSpeed = 0.6
    const speed = hovered ? hoverSpeed : baseSpeed
    groupRef.current.rotation.y += delta * speed

    // Légère inclinaison oscillante
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1

    // Animation scan line (monte et descend)
    const scanY = Math.sin(state.clock.elapsedTime * 0.8) * 0.9
    if (scanLineRef.current) {
      scanLineRef.current.position.y = scanY
    }

  })

  return (
    <>
      {/* Groupe principal contenant la planète */}
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Sphère wireframe externe - structure hologramme */}
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial
            wireframe
            color={NEON_CYAN}
            transparent
            opacity={hovered ? 0.9 : 0.7}
          />
        </mesh>

        {/* Deuxième couche wireframe - plus dense, décalée */}
        <Sphere args={[0.98, 24, 24]}>
          <meshBasicMaterial
            wireframe
            color={NEON_CYAN}
            transparent
            opacity={0.3}
          />
        </Sphere>

      </group>

      {/* Ligne de scan fine et nette - juste un cercle */}
      <mesh ref={scanLineRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.008, 8, 64]} />
        <meshBasicMaterial
          color={NEON_MAGENTA}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Post-processing: Bloom pour l'effet glow */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>

      {/* Lumière ambiante subtile */}
      <ambientLight intensity={0.5} />
    </>
  )
}

export default HoloPlanet
