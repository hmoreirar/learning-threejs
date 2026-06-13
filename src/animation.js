import * as THREE from 'three'
import {
  ASTEROID_ROTATION_SPEED,
  CLOUD_ROTATION_SPEED,
  CINEMATIC_ORBIT_SPEED,
  SUN_ROTATION_SPEED,
  CAMERA_ANIM_DURATION,
  CAMERA_CINEMATIC_RADIUS,
  CAMERA_CINEMATIC_HEIGHT,
  CAMERA_CINEMATIC_HEIGHT_AMPLITUDE,
  CAMERA_CINEMATIC_HEIGHT_FREQ
} from './constants.js'

const timer = new THREE.Timer()
let cinematicMode = false
let isAnimatingCamera = false
let cameraAnimStart = 0
const cameraStartPos = new THREE.Vector3()
const cameraEndPos = new THREE.Vector3()
const origin = new THREE.Vector3(0, 0, 0)
const sunToCam = new THREE.Vector3()
const ghostPos = new THREE.Vector3()

export function startAnimation({
  scene, camera, renderer, labelRenderer, controls,
  sun, sunMat, sunLight, glowSprite, flareSprite, flareGhosts,
  planets, asteroids, starMat,
  updateComet, composer, updateLabels
}) {
  setupCinematicToggle()

  function animate() {
    requestAnimationFrame(animate)

    timer.update()
    const deltaTime = timer.getDelta()
    const elapsed = timer.getElapsedTime()

    // Sol
    sun.rotation.y += SUN_ROTATION_SPEED * deltaTime
    sunMat.uniforms.uTime.value = elapsed
    const pulse = 1 + Math.sin(elapsed * 0.3) * 0.05
    glowSprite.scale.set(10 * pulse, 10 * pulse, 1)
    sunLight.intensity = 6 + Math.sin(elapsed * 0.3) * 0.3

    // Planetas
    planets.forEach((p) => {
      if (p.isMoon) {
        p.orbitGroup.rotation.y += p.speed * deltaTime
        return
      }
      p.orbitGroup.rotation.y += p.speed * deltaTime
      if (p.mesh) p.mesh.rotation.y += p.info.rotSpeed * deltaTime
    })

    // Nubes de la Tierra
    const earth = planets.find((p) => p.info.name === 'Tierra')
    if (earth && earth.cloudMesh) earth.cloudMesh.rotation.y += CLOUD_ROTATION_SPEED

    // Asteroides
    asteroids.rotation.y += ASTEROID_ROTATION_SPEED

    // Estrellas
    starMat.uniforms.uTime.value = elapsed

    // Labels
    updateLabels()

    // Cometa
    updateComet(deltaTime)

    // Lens flare
    const flarePulse = 0.3 + Math.sin(elapsed * 0.4) * 0.15
    flareSprite.material.opacity = flarePulse
    flareSprite.scale.setScalar(5 + Math.sin(elapsed * 0.7) * 1.5)

    sunToCam.subVectors(camera.position, origin).normalize()
    flareGhosts.forEach((g) => {
      const d = g.userData.dist
      ghostPos.copy(sunToCam).multiplyScalar(d * 8)
      g.position.copy(ghostPos)
      const camDist = camera.position.length()
      g.visible = camDist > 3
      const scalePulse = g.userData.baseSize * (0.8 + Math.sin(elapsed * 0.5 + d * 3) * 0.2)
      g.scale.setScalar(scalePulse)
    })

    // Transici\u00F3n de c\u00E1mara
    if (isAnimatingCamera) {
      const t = Math.min(1, (elapsed - cameraAnimStart) / CAMERA_ANIM_DURATION)
      const smooth = t * t * (3 - 2 * t)
      camera.position.lerpVectors(cameraStartPos, cameraEndPos, smooth)
      if (t >= 1) isAnimatingCamera = false
    }

    if (cinematicMode) {
      const angle = elapsed * CINEMATIC_ORBIT_SPEED
      cameraEndPos.set(
        Math.cos(angle) * CAMERA_CINEMATIC_RADIUS,
        CAMERA_CINEMATIC_HEIGHT + Math.sin(elapsed * CAMERA_CINEMATIC_HEIGHT_FREQ) * CAMERA_CINEMATIC_HEIGHT_AMPLITUDE,
        Math.sin(angle) * CAMERA_CINEMATIC_RADIUS
      )
      camera.position.lerp(cameraEndPos, 0.02)
      controls.target.set(0, 0, 0)
    }

    controls.update()

    // Render con bloom
    composer.render()
    labelRenderer.render(scene, camera)
  }

  animate()
}

function setupCinematicToggle() {
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
      cinematicMode = !cinematicMode
      isAnimatingCamera = true
      cameraAnimStart = timer.getElapsedTime()
    }
  })
}
