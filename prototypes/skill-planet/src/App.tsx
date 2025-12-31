import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import SkillDisc from './components/SkillDisc'

function App() {
  return (
    <div className="prototype-container">
      <div className="prototype-info">
        Prototype <span>// Skill Disc v0.2 - Brutaliste</span>
      </div>

      <div className="disc-wrapper">
        <div className="disc-container">
          <Canvas
            camera={{ position: [0, 0, 3], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <SkillDisc
                skillName="Windows Server"
                logoUrl="/logos/windows.svg"
                borderColor="#00ffff"
                hoverColor="#ff0080"
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="skill-label">
          <h2>Windows Server</h2>
          <p>AD • GPO • PowerShell</p>
        </div>
      </div>

      <div className="controls-hint">
        Hover pour activer la rotation
      </div>
    </div>
  )
}

export default App
