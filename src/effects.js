import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { STAR_VERTEX_SHADER, STAR_FRAGMENT_SHADER, GALAXY_VERTEX_SHADER, GALAXY_FRAGMENT_SHADER } from './shaders.js'
import {
  ASTEROID_COUNT, STAR_COUNT, TRAIL_LENGTH,
  BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD,
  GALAXY_RADIUS, GALAXY_DISK_THICKNESS, GALAXY_BULGE_RADIUS,
  GALAXY_ARM_COUNT, GALAXY_ARM_SPREAD, GALAXY_ARM_TURNS,
  GALAXY_STAR_COUNT, GALAXY_CORE_DIST,
  DUST_COUNT, DUST_SPREAD, DUST_SIZE_MIN, DUST_SIZE_MAX
} from './constants.js'

export function createEffects({ scene, solarSystemGroup }, camera, renderer) {
  const asteroids = createAsteroids(solarSystemGroup)
  const { starMat: closeStarMat } = createCloseStars(solarSystemGroup)
  const { starMat: galaxyMat, coreGlow } = createMilkyWay(scene)
  createNebulae(scene)
  const cometElements = createComet(solarSystemGroup)
  const { dustParticles, dustVelocities } = createGalacticDust(solarSystemGroup)
  const composer = createBloom(renderer, scene, camera)

  return { asteroids, closeStarMat, galaxyMat, coreGlow, dustParticles, dustVelocities, ...cometElements, composer }
}

function createAsteroids(parent) {
  const astPos = new Float32Array(ASTEROID_COUNT * 3)
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    const i3 = i * 3
    const r = 12 + Math.random() * 3
    const a = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * 1.2
    astPos[i3] = Math.cos(a) * r
    astPos[i3 + 1] = y
    astPos[i3 + 2] = Math.sin(a) * r
  }
  const astGeo = new THREE.BufferGeometry()
  astGeo.setAttribute('position', new THREE.BufferAttribute(astPos, 3))
  const astMat = new THREE.PointsMaterial({
    color: 0x888877,
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6
  })
  const asteroids = new THREE.Points(astGeo, astMat)
  parent.add(asteroids)
  return asteroids
}

function createCloseStars(parent) {
  const starPos = new Float32Array(STAR_COUNT * 3)
  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3
    const t = Math.random() * Math.PI * 2
    const p = Math.acos(2 * Math.random() - 1)
    const r = 100 + Math.random() * 80
    starPos[i3] = Math.sin(p) * Math.cos(t) * r
    starPos[i3 + 1] = Math.sin(p) * Math.sin(t) * r
    starPos[i3 + 2] = Math.cos(p) * r
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: STAR_VERTEX_SHADER,
    fragmentShader: STAR_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const stars = new THREE.Points(starGeo, starMat)
  parent.add(stars)
  return { starMat, stars }
}

function createMilkyWay(scene) {
  const total = GALAXY_STAR_COUNT
  const positions = new Float32Array(total * 3)
  const colors = new Float32Array(total * 3)
  const sizes = new Float32Array(total)
  const coreCenter = -GALAXY_CORE_DIST
  const color = new THREE.Color()

  for (let i = 0; i < total; i++) {
    const i3 = i * 3
    let x, y, z, starSize, r, angle

    if (Math.random() < 0.12) {
      // Bulbo central
      r = Math.random() * GALAXY_BULGE_RADIUS
      angle = Math.random() * Math.PI * 2
      y = (Math.random() - 0.5) * GALAXY_DISK_THICKNESS * 0.4
      x = Math.cos(angle) * r
      z = Math.sin(angle) * r
      starSize = 0.3 + Math.random() * 0.3
      color.setHSL(0.08 + Math.random() * 0.04, 0.6, 0.4 + Math.random() * 0.3)
    } else {
      // Disco con brazos espirales
      r = GALAXY_BULGE_RADIUS + Math.random() * (GALAXY_RADIUS - GALAXY_BULGE_RADIUS)
      const armIdx = Math.floor(Math.random() * GALAXY_ARM_COUNT)
      const baseAngle = (armIdx / GALAXY_ARM_COUNT) * Math.PI * 2
      const normR = (r - GALAXY_BULGE_RADIUS) / (GALAXY_RADIUS - GALAXY_BULGE_RADIUS)
      const spiralAngle = normR * GALAXY_ARM_TURNS * Math.PI * 2
      angle = baseAngle + spiralAngle + (Math.random() - 0.5) * GALAXY_ARM_SPREAD
      y = (Math.random() - 0.5) * GALAXY_DISK_THICKNESS * (1.3 - normR * 0.8)
      x = Math.cos(angle) * r
      z = Math.sin(angle) * r
      starSize = 0.1 + Math.random() * 0.2

      if (normR < 0.3) {
        color.setHSL(0.08, 0.4, 0.5 + Math.random() * 0.3)
      } else if (normR < 0.65) {
        color.setHSL(0.6 + Math.random() * 0.1, 0.2, 0.6 + Math.random() * 0.3)
      } else {
        color.setHSL(0.58 + Math.random() * 0.08, 0.5, 0.4 + Math.random() * 0.3)
      }
    }

    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z + coreCenter

    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b

    sizes[i] = starSize
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const starMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: GALAXY_VERTEX_SHADER,
    fragmentShader: GALAXY_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })

  const galaxyPoints = new THREE.Points(geo, starMat)
  scene.add(galaxyPoints)

  // Brillo del nucleo galactico
  const gSize = 128
  const c = document.createElement('canvas')
  c.width = gSize; c.height = gSize
  const ctx = c.getContext('2d')
  const grad = ctx.createRadialGradient(gSize / 2, gSize / 2, 0, gSize / 2, gSize / 2, gSize / 2)
  grad.addColorStop(0, 'rgba(255,220,150,1)')
  grad.addColorStop(0.1, 'rgba(255,180,80,0.6)')
  grad.addColorStop(0.3, 'rgba(200,120,40,0.2)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, gSize, gSize)

  const glowTex = new THREE.CanvasTexture(c)
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6,
    depthWrite: false
  })
  const coreGlow = new THREE.Sprite(glowMat)
  coreGlow.position.set(0, 0, coreCenter)
  coreGlow.scale.set(15, 15, 1)
  scene.add(coreGlow)

  return { starMat, galaxyPoints, coreGlow }
}

function createGalacticDust(parent) {
  const positions = new Float32Array(DUST_COUNT * 3)
  const colors = new Float32Array(DUST_COUNT * 3)
  const sizes = new Float32Array(DUST_COUNT)
  const velocities = []

  for (let i = 0; i < DUST_COUNT; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * DUST_SPREAD
    positions[i3 + 1] = (Math.random() - 0.5) * DUST_SPREAD * 0.3
    positions[i3 + 2] = (Math.random() - 0.5) * DUST_SPREAD

    const gray = 0.15 + Math.random() * 0.2
    colors[i3] = gray
    colors[i3 + 1] = gray + 0.05
    colors[i3 + 2] = gray + 0.15

    sizes[i] = DUST_SIZE_MIN + Math.random() * (DUST_SIZE_MAX - DUST_SIZE_MIN)

    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.005,
      (Math.random() - 0.5) * 0.02
    ))
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  })

  const dust = new THREE.Points(geo, mat)
  parent.add(dust)

  return { dustParticles: dust, dustVelocities: velocities }
}

function createNebulae(scene) {
  function createNebulaTexture(color1, color2) {
    const s = 256
    const c = document.createElement('canvas')
    c.width = s
    c.height = s
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    g.addColorStop(0, color1)
    g.addColorStop(0.4, color2)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)

    const imageData = ctx.getImageData(0, 0, s, s)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 0.15
      imageData.data[i] = Math.min(255, imageData.data[i] + noise * 255)
      imageData.data[i + 1] = Math.min(255, imageData.data[i + 1] + noise * 255)
      imageData.data[i + 2] = Math.min(255, imageData.data[i + 2] + noise * 255)
    }
    ctx.putImageData(imageData, 0, 0)
    const tex = new THREE.CanvasTexture(c)
    return tex
  }

  const nebulae = [
    { c1: 'rgba(80,40,120,0.15)', c2: 'rgba(40,10,80,0.08)', x: -40, y: 10, z: -80, s: 50 },
    { c1: 'rgba(20,60,120,0.12)', c2: 'rgba(10,30,80,0.06)', x: 50, y: -5, z: -70, s: 45 },
    { c1: 'rgba(120,60,30,0.10)', c2: 'rgba(80,30,10,0.05)', x: -30, y: -15, z: -90, s: 40 }
  ]

  nebulae.forEach((n) => {
    const tex = createNebulaTexture(n.c1, n.c2)
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.5
    })
    const sprite = new THREE.Sprite(mat)
    sprite.position.set(n.x, n.y, n.z)
    sprite.scale.set(n.s, n.s, 1)
    scene.add(sprite)
  })
}

function createComet(parent) {
  const cometOrbit = {
    semiMajor: 18,
    semiMinor: 6,
    speed: 0.3,
    angle: Math.random() * Math.PI * 2,
    tilt: 0.5
  }

  const cometGeo = new THREE.SphereGeometry(0.12, 8, 8)
  const cometMat = new THREE.MeshBasicMaterial({ color: 0x88ddff })
  const comet = new THREE.Mesh(cometGeo, cometMat)
  parent.add(comet)

  const cometGlowMat = new THREE.SpriteMaterial({
    map: (() => {
      const c = document.createElement('canvas')
      c.width = 64
      c.height = 64
      const ctx = c.getContext('2d')
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      g.addColorStop(0, 'rgba(150,220,255,1)')
      g.addColorStop(0.2, 'rgba(100,180,255,0.5)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 64, 64)
      return new THREE.CanvasTexture(c)
    })(),
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })
  const cometGlow = new THREE.Sprite(cometGlowMat)
  cometGlow.scale.set(1, 1, 1)
  parent.add(cometGlow)

  const trailPositions = new Float32Array(TRAIL_LENGTH * 3)
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    trailPositions[i * 3] = 0
    trailPositions[i * 3 + 1] = -100
    trailPositions[i * 3 + 2] = 0
  }
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))

  const trailMat = new THREE.PointsMaterial({
    color: 0x66bbff,
    size: 0.06,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const trail = new THREE.Points(trailGeo, trailMat)
  parent.add(trail)

  const trailHistory = new Float32Array(TRAIL_LENGTH * 3)
  let trailIndex = 0

  function updateComet(deltaTime) {
    cometOrbit.angle += cometOrbit.speed * deltaTime

    const cx = Math.cos(cometOrbit.angle) * cometOrbit.semiMajor
    const cz = Math.sin(cometOrbit.angle) * cometOrbit.semiMinor
    const cy = Math.sin(cometOrbit.angle * 2) * cometOrbit.tilt

    comet.position.set(cx, cy, cz)
    cometGlow.position.copy(comet.position)

    trailHistory[trailIndex * 3] = cx
    trailHistory[trailIndex * 3 + 1] = cy
    trailHistory[trailIndex * 3 + 2] = cz
    trailIndex = (trailIndex + 1) % TRAIL_LENGTH

    const tPos = trailGeo.attributes.position.array
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      const srcIdx = (trailIndex + i) % TRAIL_LENGTH
      tPos[i * 3] = trailHistory[srcIdx * 3]
      tPos[i * 3 + 1] = trailHistory[srcIdx * 3 + 1]
      tPos[i * 3 + 2] = trailHistory[srcIdx * 3 + 2]
    }
    trailGeo.attributes.position.needsUpdate = true
  }

  return { comet, cometGlow, trail, updateComet }
}

function createBloom(renderer, scene, camera) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    BLOOM_STRENGTH,
    BLOOM_RADIUS,
    BLOOM_THRESHOLD
  )
  composer.addPass(bloomPass)
  composer.addPass(new OutputPass())

  window.addEventListener('resize', () => {
    composer.setSize(window.innerWidth, window.innerHeight)
  })

  return composer
}
