import './style.css'
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

  const { sun, sunMat, sunLight, glowSprite, flareSprite, flareGhosts } = createSun(scene, textures.sun)
  updateLoadingProgress(0.75)

  const { planets, clickables } = createPlanets(scene, textures, textures.clouds)
  updateLoadingProgress(0.85)

  const effects = createEffects(scene, camera, renderer)
  updateLoadingProgress(0.95)

  const labelUpdateFn = updateLabels(planets, camera)

  initUI(camera, renderer, canvas, clickables, planets, flareSprite, flareGhosts)
  updateLoadingProgress(1)

  startAnimation({
    scene,
    camera,
    renderer,
    labelRenderer,
    controls,
    sun,
    sunMat,
    sunLight,
    glowSprite,
    flareSprite,
    flareGhosts,
    planets,
    asteroids: effects.asteroids,
    starMat: effects.starMat,
    updateComet: effects.updateComet,
    composer: effects.composer,
    updateLabels: labelUpdateFn
  })
}

init()
