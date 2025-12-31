import { useRef, useState } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface SkillDiscProps {
  skillName: string
  logoUrl: string
  borderColor?: string
  hoverColor?: string
}

// Couleurs du portfolio
const NEON_CYAN = '#00ffff'
const NEON_MAGENTA = '#ff0080'
const GRAY_DARK = '#0a0a0a'
const GRAY_MID = '#1a1a1a'

function SkillDisc({
  skillName,
  logoUrl,
  borderColor = NEON_CYAN,
  hoverColor = NEON_MAGENTA
}: SkillDiscProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // Charger le logo
  const logoTexture = useTexture(logoUrl)

  // Pas de rotation - disque statique
  void skillName

  // Scale au hover
  const targetScale = hovered ? 1.08 : 1
  const currentBorderColor = hovered ? hoverColor : borderColor

  return (
    <group
      ref={groupRef}
      rotation={[0, 0, 0]} // Pas de rotation - face caméra
      scale={targetScale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Fond du disque - sombre */}
      <mesh>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color={GRAY_DARK} />
      </mesh>

      {/* Cercle intérieur - légèrement plus clair */}
      <mesh position={[0, 0, 0.001]}>
        <circleGeometry args={[0.92, 64]} />
        <meshBasicMaterial color={GRAY_MID} />
      </mesh>

      {/* Bordure néon extérieure */}
      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.96, 1, 64]} />
        <meshBasicMaterial
          color={currentBorderColor}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bordure intérieure fine */}
      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.88, 0.9, 64]} />
        <meshBasicMaterial
          color={currentBorderColor}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Logo au centre */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshBasicMaterial
          map={logoTexture}
          transparent
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Points décoratifs aux coins (style brutaliste) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.93,
            Math.sin(angle) * 0.93,
            0.003
          ]}
        >
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color={currentBorderColor} />
        </mesh>
      ))}

      {/* Indicateur de nom (invisible en 3D, géré en CSS) */}
      <group userData={{ skillName }} />
    </group>
  )
}

export default SkillDisc
