import './style.css'
import * as THREE from 'three'
import { initScene } from './scene.js'
import { loadTextures } from './textures.js'
import { createSun } from './sun.js'
import { createPlanets } from './planets.js'
import { createEffects } from './effects.js'
import { initUI, updateLabels, updateLoadingProgress } from './ui.js'
import { startAnimation } from './animation.js'

async function init() {
  updateLoadingProgress(0.1)

  const { scene, camera, renderer, labelRenderer, controls, canvas } = initScene()
  updateLoadingProgress(0.2)

  const textures = await loadTextures((progress) => {
    updateLoadingProgress(0.2 + progress * 0.5)
  })

  const solarSystemGroup = new THREE.Group()
  scene.add(solarSystemGroup)

  const effects = createEffects({ scene, solarSystemGroup }, camera, renderer)
  updateLoadingProgress(0.7)

  const { sun, sunMat, sunLight, glowSprite, flareSprite, flareGhosts } = createSun(solarSystemGroup, scene, textures.sun)
  updateLoadingProgress(0.78)

  const { planets, clickables } = createPlanets(solarSystemGroup, textures, textures.clouds)
  updateLoadingProgress(0.88)

  const labelUpdateFn = updateLabels(planets, camera)

  initUI(camera, renderer, canvas, clickables, planets, flareSprite, flareGhosts)
  updateLoadingProgress(1)

  startAnimation({
    scene, camera, renderer, labelRenderer, controls,
    solarSystemGroup,
    sun, sunMat, sunLight, glowSprite, flareSprite, flareGhosts,
    planets,
    asteroids: effects.asteroids,
    closeStarMat: effects.closeStarMat,
    galaxyMat: effects.galaxyMat,
    galaxyCoreGlow: effects.coreGlow,
    dustParticles: effects.dustParticles,
    dustVelocities: effects.dustVelocities,
    updateComet: effects.updateComet,
    composer: effects.composer,
    updateLabels: labelUpdateFn
  })
}

init()
