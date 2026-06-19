import * as THREE from 'three'
import {
  ASTEROID_ROTATION_SPEED, CLOUD_ROTATION_SPEED, CINEMATIC_ORBIT_SPEED,
  SUN_ROTATION_SPEED, CAMERA_ANIM_DURATION, CAMERA_CINEMATIC_RADIUS,
  CAMERA_CINEMATIC_HEIGHT, CAMERA_CINEMATIC_HEIGHT_AMPLITUDE,
  CAMERA_CINEMATIC_HEIGHT_FREQ, DRIFT_SPEED, DRIFT_AXIS_X,
  DRIFT_AXIS_Y, DRIFT_AXIS_Z, DUST_COUNT, DUST_SPREAD
} from './constants.js'
import { speedMultiplier } from './ui.js'

const timer = new THREE.Timer()
let cinematicMode = false
let isAnimatingCamera = false
let cameraAnimStart = 0
const cameraStartPos = new THREE.Vector3()
const cameraEndPos = new THREE.Vector3()
const sunWorldPos = new THREE.Vector3()
const sunToCam = new THREE.Vector3()
const ghostPos = new THREE.Vector3()

export function startAnimation({
  scene, camera, renderer, labelRenderer, controls,
  solarSystemGroup,
  sun, sunMat, sunLight, glowSprite, flareSprite, flareGhosts,
  planets, asteroids, closeStarMat, galaxyMat, galaxyCoreGlow,
  dustParticles, dustVelocities,
  updateComet, composer, updateLabels
}) {
  setupCinematicToggle()

  const earth = planets.find((p) => p.info.name === 'Tierra')

  function animate() {
    requestAnimationFrame(animate)

    timer.update()
    const deltaTime = Math.min(timer.getDelta(), 0.05)
    const elapsed = timer.getElapsed()

    const drift = DRIFT_SPEED * speedMultiplier * deltaTime
    solarSystemGroup.position.x += drift * DRIFT_AXIS_X
    solarSystemGroup.position.y += drift * DRIFT_AXIS_Y
    solarSystemGroup.position.z += drift * DRIFT_AXIS_Z

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
    if (earth && earth.cloudMesh) earth.cloudMesh.rotation.y += CLOUD_ROTATION_SPEED

    // Asteroides
    asteroids.rotation.y += ASTEROID_ROTATION_SPEED

    // Estrellas cercanas (viajan con el sistema)
    closeStarMat.uniforms.uTime.value = elapsed

    // Via Lactea (fondo fijo)
    galaxyMat.uniforms.uTime.value = elapsed

    // Brillo del nucleo galactico
    const corePulse = 0.5 + Math.sin(elapsed * 0.15) * 0.15
    galaxyCoreGlow.material.opacity = corePulse

    // Labels
    updateLabels()

    // Cometa
    updateComet(deltaTime)

    // Polvo galactico
    const dustPos = dustParticles.geometry.attributes.position.array
    for (let i = 0; i < DUST_COUNT; i++) {
      const i3 = i * 3
      dustPos[i3] += dustVelocities[i].x * deltaTime
      dustPos[i3 + 1] += dustVelocities[i].y * deltaTime
      dustPos[i3 + 2] += dustVelocities[i].z * deltaTime

      if (Math.abs(dustPos[i3]) > DUST_SPREAD ||
          Math.abs(dustPos[i3 + 1]) > DUST_SPREAD * 0.3 ||
          Math.abs(dustPos[i3 + 2]) > DUST_SPREAD) {
        dustPos[i3] = (Math.random() - 0.5) * DUST_SPREAD
        dustPos[i3 + 1] = (Math.random() - 0.5) * DUST_SPREAD * 0.3
        dustPos[i3 + 2] = (Math.random() - 0.5) * DUST_SPREAD
      }
    }
    dustParticles.geometry.attributes.position.needsUpdate = true

    // Lens flare
    const flarePulse = 0.3 + Math.sin(elapsed * 0.4) * 0.15
    flareSprite.material.opacity = flarePulse
    flareSprite.scale.setScalar(5 + Math.sin(elapsed * 0.7) * 1.5)

    sun.getWorldPosition(sunWorldPos)
    sunToCam.subVectors(camera.position, sunWorldPos).normalize()
    flareGhosts.forEach((g) => {
      const d = g.userData.dist
      ghostPos.copy(sunToCam).multiplyScalar(d * 8)
      g.position.copy(ghostPos)
      const camDist = camera.position.distanceTo(sunWorldPos)
      g.visible = camDist > 3
      const scalePulse = g.userData.baseSize * (0.8 + Math.sin(elapsed * 0.5 + d * 3) * 0.2)
      g.scale.setScalar(scalePulse)
    })

    // Transicion de camara
    if (isAnimatingCamera) {
      const t = Math.min(1, (elapsed - cameraAnimStart) / CAMERA_ANIM_DURATION)
      const smooth = t * t * (3 - 2 * t)
      camera.position.lerpVectors(cameraStartPos, cameraEndPos, smooth)
      if (t >= 1) isAnimatingCamera = false
    }

    if (cinematicMode) {
      sun.getWorldPosition(sunWorldPos)
      const angle = elapsed * CINEMATIC_ORBIT_SPEED
      cameraEndPos.set(
        Math.cos(angle) * CAMERA_CINEMATIC_RADIUS + sunWorldPos.x,
        CAMERA_CINEMATIC_HEIGHT + Math.sin(elapsed * CAMERA_CINEMATIC_HEIGHT_FREQ) * CAMERA_CINEMATIC_HEIGHT_AMPLITUDE + sunWorldPos.y,
        Math.sin(angle) * CAMERA_CINEMATIC_RADIUS + sunWorldPos.z
      )
      camera.position.lerp(cameraEndPos, 0.02)
      controls.target.copy(sunWorldPos)
    }

    controls.update()

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
      cameraAnimStart = timer.getElapsed()
    }
  })
}
