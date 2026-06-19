import * as THREE from 'three'
import { SUN_VERTEX_SHADER, SUN_FRAGMENT_SHADER } from './shaders.js'
import { SHADOW_MAP_SIZE } from './constants.js'

export function createSun(parent, scene, sunTexture) {
  const sunGeo = new THREE.SphereGeometry(2.5, 48, 48)
  const sunMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: sunTexture }
    },
    vertexShader: SUN_VERTEX_SHADER,
    fragmentShader: SUN_FRAGMENT_SHADER,
    side: THREE.FrontSide
  })
  const sun = new THREE.Mesh(sunGeo, sunMat)
  parent.add(sun)

  const sunLight = new THREE.PointLight(0xffeedd, 6, 100)
  sunLight.position.set(0, 0, 0)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = SHADOW_MAP_SIZE
  sunLight.shadow.mapSize.height = SHADOW_MAP_SIZE
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 60
  parent.add(sunLight)

  const ambientLight = new THREE.AmbientLight(0x333366, 0.4)
  scene.add(ambientLight)

  // Glow sprite
  const glowSize = 128
  const c2d = document.createElement('canvas')
  c2d.width = glowSize
  c2d.height = glowSize
  const ctx = c2d.getContext('2d')
  const grad = ctx.createRadialGradient(glowSize / 2, glowSize / 2, 0, glowSize / 2, glowSize / 2, glowSize / 2)
  grad.addColorStop(0, 'rgba(255,200,100,1)')
  grad.addColorStop(0.2, 'rgba(255,150,50,0.6)')
  grad.addColorStop(0.5, 'rgba(255,100,0,0.2)')
  grad.addColorStop(1, 'rgba(255,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, glowSize, glowSize)

  const glowMat = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(c2d),
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8
  })
  const glowSprite = new THREE.Sprite(glowMat)
  glowSprite.scale.set(10, 10, 1)
  parent.add(glowSprite)

  // Flare sprite
  const flareSize = 128
  const fCanvas = document.createElement('canvas')
  fCanvas.width = flareSize
  fCanvas.height = flareSize
  const fCtx = fCanvas.getContext('2d')
  const center = flareSize / 2
  fCtx.globalCompositeOperation = 'lighter'

  const rGrad = fCtx.createRadialGradient(center, center, 0, center, center, center)
  rGrad.addColorStop(0, 'rgba(255,220,150,1)')
  rGrad.addColorStop(0.05, 'rgba(255,200,100,0.8)')
  rGrad.addColorStop(0.15, 'rgba(255,150,50,0.5)')
  rGrad.addColorStop(0.4, 'rgba(255,100,20,0.1)')
  rGrad.addColorStop(1, 'rgba(255,50,0,0)')
  fCtx.fillStyle = rGrad
  fCtx.fillRect(0, 0, flareSize, flareSize)

  fCtx.strokeStyle = 'rgba(255,200,150,0.3)'
  fCtx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    fCtx.beginPath()
    fCtx.moveTo(center, center)
    fCtx.lineTo(center + Math.cos(angle) * center * 0.9, center + Math.sin(angle) * center * 0.9)
    fCtx.stroke()
  }

  const flareMat = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(fCanvas),
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
  })
  const flareSprite = new THREE.Sprite(flareMat)
  flareSprite.scale.set(6, 6, 1)
  parent.add(flareSprite)

  // Lens flare ghosts
  function createFlareGhost(color, size, dist, opacity) {
    const s = 64
    const c = document.createElement('canvas')
    c.width = s
    c.height = s
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, `rgba(${color.join(',')},${opacity})`)
    g.addColorStop(0.3, `rgba(${color.join(',')},${opacity * 0.4})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    const tex = new THREE.CanvasTexture(c)

    const mat = new THREE.SpriteMaterial({
      map: tex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    })
    const sprite = new THREE.Sprite(mat)
    sprite.userData = { dist, baseSize: size }
    sprite.scale.set(size, size, 1)
    return sprite
  }

  const flareGhosts = [
    createFlareGhost([255, 200, 150], 1.0, 0.3, 0.5),
    createFlareGhost([255, 150, 80], 0.6, 0.6, 0.3),
    createFlareGhost([255, 100, 50], 0.3, 0.8, 0.2),
    createFlareGhost([200, 150, 255], 0.4, 0.4, 0.15),
    createFlareGhost([255, 200, 100], 0.2, 0.7, 0.1)
  ]

  flareGhosts.forEach((g) => {
    g.position.set(0, 0, 0)
    parent.add(g)
  })

  return { sun, sunMat, sunLight, glowSprite, flareSprite, flareGhosts, ambientLight }
}
