import * as THREE from 'three'

export function loadTextures(onProgress) {
  return new Promise((resolve, reject) => {
    const manager = new THREE.LoadingManager()
    manager.onProgress = (url, loaded, total) => {
      if (onProgress) onProgress(loaded / total)
    }
    manager.onLoad = () => resolve(textures)
    manager.onError = (url) => {
      console.warn(`Failed to load texture: ${url}`)
    }

    const loader = new THREE.TextureLoader(manager)
    const base = import.meta.env.BASE_URL

    const textures = {
      sun:        loader.load(`${base}textures/2k_sun.jpg`),
      mercury:    loader.load(`${base}textures/2k_mercury.jpg`),
      venus:      loader.load(`${base}textures/2k_venus_surface.jpg`),
      earth:      loader.load(`${base}textures/2k_earth_daymap.jpg`),
      clouds:     loader.load(`${base}textures/2k_earth_clouds.jpg`),
      mars:       loader.load(`${base}textures/2k_mars.jpg`),
      jupiter:    loader.load(`${base}textures/2k_jupiter.jpg`),
      saturn:     loader.load(`${base}textures/2k_saturn.jpg`),
      saturnRing: loader.load(`${base}textures/2k_saturn_ring_alpha.png`),
      uranus:     loader.load(`${base}textures/2k_uranus.jpg`),
      neptune:    loader.load(`${base}textures/2k_neptune.jpg`),
      moon:       loader.load(`${base}textures/2k_moon.jpg`)
    }
  })
}
