import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { ATMOSPHERE_VERTEX_SHADER, ATMOSPHERE_FRAGMENT_SHADER } from './shaders.js'
import { BASE_SPEED, ORBIT_SPEED_FACTOR } from './constants.js'

export const planetData = [
  {
    name: 'Mercurio',
    texKey: 'mercury',
    orbit: 4,
    size: 0.2,
    period: 0.241,
    tilt: 0.03,
    rotSpeed: 0.005,
    orbitTilt: 7,
    mass: '3.30 \u00D7 10\u00B2\u00B3 kg',
    gravity: '3.7 m/s\u00B2',
    temperature: '167 \u00B0C (promedio)',
    moons: 0,
    type: 'Rocoso',
    realRadius: '2,440 km',
    realDistance: '0.39 AU',
    description: 'El planeta m\u00E1s peque\u00F1o y cercano al Sol.'
  },
  {
    name: 'Venus',
    texKey: 'venus',
    orbit: 6,
    size: 0.35,
    period: 0.615,
    tilt: 177.4,
    rotSpeed: -0.002,
    orbitTilt: 3.4,
    mass: '4.87 \u00D7 10\u00B2\u00B4 kg',
    gravity: '8.87 m/s\u00B2',
    temperature: '464 \u00B0C (superficie)',
    moons: 0,
    type: 'Rocoso',
    realRadius: '6,052 km',
    realDistance: '0.72 AU',
    description: 'El planeta m\u00E1s caliente, con atm\u00F3sfera densa de CO\u2082.'
  },
  {
    name: 'Tierra',
    texKey: 'earth',
    orbit: 8,
    size: 0.38,
    period: 1.0,
    tilt: 23.4,
    rotSpeed: 0.04,
    orbitTilt: 0,
    hasAtmos: true,
    hasClouds: true,
    mass: '5.97 \u00D7 10\u00B2\u00B4 kg',
    gravity: '9.81 m/s\u00B2',
    temperature: '15 \u00B0C (promedio)',
    moons: 1,
    type: 'Rocoso',
    realRadius: '6,371 km',
    realDistance: '1 AU',
    description: 'Nuestro hogar. \u00DAnico planeta con vida conocida.'
  },
  {
    name: 'Marte',
    texKey: 'mars',
    orbit: 10.5,
    size: 0.3,
    period: 1.881,
    tilt: 25.2,
    rotSpeed: 0.038,
    orbitTilt: 1.9,
    mass: '6.42 \u00D7 10\u00B2\u00B3 kg',
    gravity: '3.72 m/s\u00B2',
    temperature: '-65 \u00B0C (promedio)',
    moons: 2,
    type: 'Rocoso',
    realRadius: '3,390 km',
    realDistance: '1.52 AU',
    description: 'El planeta rojo. Tiene el volc\u00E1n m\u00E1s alto del sistema solar.'
  },
  {
    name: 'J\u00FApiter',
    texKey: 'jupiter',
    orbit: 15,
    size: 1.2,
    period: 11.86,
    tilt: 3.1,
    rotSpeed: 0.09,
    orbitTilt: 1.3,
    mass: '1.90 \u00D7 10\u00B2\u00B7 kg',
    gravity: '24.79 m/s\u00B2',
    temperature: '-110 \u00B0C (nubes)',
    moons: 95,
    type: 'Gaseoso',
    realRadius: '69,911 km',
    realDistance: '5.20 AU',
    description: 'El gigante gaseoso m\u00E1s grande. Su Gran Mancha Roja es una tormenta.'
  },
  {
    name: 'Saturno',
    texKey: 'saturn',
    orbit: 20,
    size: 1.0,
    period: 29.46,
    tilt: 26.7,
    rotSpeed: 0.08,
    orbitTilt: 2.5,
    hasRing: true,
    mass: '5.68 \u00D7 10\u00B2\u00B6 kg',
    gravity: '10.44 m/s\u00B2',
    temperature: '-140 \u00B0C (nubes)',
    moons: 146,
    type: 'Gaseoso',
    realRadius: '58,232 km',
    realDistance: '9.58 AU',
    description: 'Famoso por sus anillos de hielo y roca.'
  },
  {
    name: 'Urano',
    texKey: 'uranus',
    orbit: 26,
    size: 0.6,
    period: 84.01,
    tilt: 97.8,
    rotSpeed: -0.05,
    orbitTilt: 0.8,
    mass: '8.68 \u00D7 10\u00B2\u00B5 kg',
    gravity: '8.87 m/s\u00B2',
    temperature: '-195 \u00B0C (nubes)',
    moons: 28,
    type: 'Helado',
    realRadius: '25,362 km',
    realDistance: '19.22 AU',
    description: 'Gira de lado. El planeta m\u00E1s fr\u00EDo del sistema solar.'
  },
  {
    name: 'Neptuno',
    texKey: 'neptune',
    orbit: 32,
    size: 0.55,
    period: 164.8,
    tilt: 28.3,
    rotSpeed: 0.055,
    orbitTilt: 1.8,
    mass: '1.02 \u00D7 10\u00B2\u00B6 kg',
    gravity: '11.15 m/s\u00B2',
    temperature: '-200 \u00B0C (nubes)',
    moons: 16,
    type: 'Helado',
    realRadius: '24,622 km',
    realDistance: '30.07 AU',
    description: 'Vientos m\u00E1s r\u00E1pidos del sistema solar: hasta 2,100 km/h.'
  }
]

export function createPlanets(scene, textures, cloudTexture) {
  const clickables = []
  const planets = []

  planetData.forEach((info) => {
    const result = createPlanet(scene, info, textures, cloudTexture)
    planets.push(result)
    clickables.push({ mesh: result.mesh, info })
  })

  // Luna de la Tierra
  const earth = planets.find((p) => p.info.name === 'Tierra')
  const moonResult = createMoon(scene, earth, textures.moon, 0.5, 0.1, 0.008)
  planets.push(moonResult)

  // Lunas de J\u00FApiter
  const jupiter = planets.find((p) => p.info.name === 'J\u00FApiter')
  const jupiterMoonData = [
    { name: '\u00CDo',       orbit: 1.8, size: 0.06, speed: 0.8 },
    { name: 'Europa',   orbit: 2.3, size: 0.05, speed: 0.6 },
    { name: 'Gan\u00EDmedes', orbit: 3.0, size: 0.08, speed: 0.4 },
    { name: 'Calisto',  orbit: 3.8, size: 0.07, speed: 0.3 }
  ]

  jupiterMoonData.forEach((m) => {
    const moonP = createJupiterMoon(scene, jupiter, m)
    planets.push(moonP)
  })

  return { planets, clickables }
}

function createPlanet(scene, info, textures, cloudTexture) {
  const orbitGroup = new THREE.Group()
  orbitGroup.rotation.y = Math.random() * Math.PI * 2
  orbitGroup.rotation.x = THREE.MathUtils.degToRad(info.orbitTilt)
  scene.add(orbitGroup)

  const planetGroup = new THREE.Group()
  planetGroup.position.x = info.orbit
  planetGroup.rotation.z = THREE.MathUtils.degToRad(info.tilt)

  const geo = new THREE.SphereGeometry(info.size, 32, 32)
  const mat = new THREE.MeshStandardMaterial({
    map: textures[info.texKey],
    roughness: 0.2,
    metalness: 0.3
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  mesh.receiveShadow = true
  planetGroup.add(mesh)
  orbitGroup.add(planetGroup)

  let cloudMesh = null

  if (info.hasAtmos) {
    const aGeo = new THREE.SphereGeometry(info.size * 1.02, 32, 32)
    const aMat = new THREE.ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX_SHADER,
      fragmentShader: ATMOSPHERE_FRAGMENT_SHADER,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    planetGroup.add(new THREE.Mesh(aGeo, aMat))

    const cGeo = new THREE.SphereGeometry(info.size * 1.01, 32, 32)
    const cMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
      roughness: 0.9,
      depthWrite: false
    })
    cloudMesh = new THREE.Mesh(cGeo, cMat)
    planetGroup.add(cloudMesh)
  }

  if (info.hasRing) {
    const rGeo = new THREE.RingGeometry(info.size * 1.3, info.size * 2.4, 80)
    const rMat = new THREE.MeshStandardMaterial({
      map: textures.saturnRing,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.8,
      depthWrite: false
    })
    const ring = new THREE.Mesh(rGeo, rMat)
    ring.rotation.x = THREE.MathUtils.degToRad(60)
    ring.receiveShadow = true
    planetGroup.add(ring)
  }

  // Label
  const labelDiv = document.createElement('div')
  labelDiv.textContent = info.name
  labelDiv.style.color = '#ffffff'
  labelDiv.style.fontFamily = 'system-ui, sans-serif'
  labelDiv.style.fontSize = '14px'
  labelDiv.style.fontWeight = '600'
  labelDiv.style.textShadow = '0 0 10px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,1)'
  labelDiv.style.background = 'rgba(0,0,0,0.4)'
  labelDiv.style.padding = '4px 10px'
  labelDiv.style.borderRadius = '12px'
  labelDiv.style.border = '1px solid rgba(255,255,255,0.15)'
  labelDiv.style.backdropFilter = 'blur(4px)'
  labelDiv.style.letterSpacing = '0.5px'
  labelDiv.style.userSelect = 'none'

  const label = new CSS2DObject(labelDiv)
  label.position.set(info.orbit, info.size + 0.5, 0)
  orbitGroup.add(label)

  return {
    orbitGroup,
    planetGroup,
    cloudMesh,
    mesh,
    label,
    labelDiv,
    speed: BASE_SPEED / info.period,
    info,
    isMoon: false
  }
}

function createMoon(scene, parentPlanet, moonTexture, distance, size, speed) {
  const moonOrbitGroup = new THREE.Group()
  moonOrbitGroup.position.x = parentPlanet.info.orbit

  const moonGeo = new THREE.SphereGeometry(size, 16, 16)
  const moonMat = new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 0.9 })
  const moonMesh = new THREE.Mesh(moonGeo, moonMat)
  moonMesh.position.x = distance
  moonOrbitGroup.add(moonMesh)
  parentPlanet.orbitGroup.add(moonOrbitGroup)

  return {
    orbitGroup: moonOrbitGroup,
    mesh: moonMesh,
    speed,
    isMoon: true,
    info: { name: 'Luna' }
  }
}

function createJupiterMoon(scene, jupiter, moonData) {
  const group = new THREE.Group()
  group.position.x = jupiter.info.orbit

  const geo = new THREE.SphereGeometry(moonData.size, 12, 12)
  const mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.x = moonData.orbit
  group.add(mesh)
  jupiter.orbitGroup.add(group)

  return {
    orbitGroup: group,
    mesh,
    speed: moonData.speed,
    isMoon: true,
    info: { name: moonData.name }
  }
}
