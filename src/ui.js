import * as THREE from 'three'
import {
  LABEL_FONT_SIZE_MIN,
  LABEL_FONT_SIZE_MAX,
  LABEL_DISTANCE_FACTOR,
  LABEL_MAX_DISTANCE,
  LABEL_UPDATE_THROTTLE_FRAMES,
  HOVER_THROTTLE_MS,
  SPEED_PRESETS,
  BASE_SPEED
} from './constants.js'

let infoTimeout = null
let speedMultiplier = 1

export function initUI(camera, renderer, canvas, clickables, planets, flareSprite, flareGhosts) {
  createInfoOverlay()
  createSpeedButtons(planets)
  setupClickHandler(camera, canvas, clickables)
  setupHoverHandler(camera, canvas, clickables)
  createLoadingBar()

  return { flareSprite, flareGhosts }
}

function createLoadingBar() {
  const bar = document.createElement('div')
  bar.id = 'loading-bar'
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; width: 0%; height: 2px;
    background: #8b5cf6; z-index: 100; transition: width 0.2s ease;
  `
  document.body.appendChild(bar)
  return bar
}

export function updateLoadingProgress(progress) {
  const bar = document.getElementById('loading-bar')
  if (bar) {
    bar.style.width = `${progress * 100}%`
    if (progress >= 1) {
      setTimeout(() => { bar.style.opacity = '0' }, 300)
      setTimeout(() => { bar.remove() }, 600)
    }
  }
}

function createInfoOverlay() {
  const infoEl = document.createElement('div')
  infoEl.id = 'planet-info'
  infoEl.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15); border-radius: 12px;
    padding: 16px 24px; color: white; font-family: system-ui, sans-serif;
    opacity: 0; transition: opacity 0.3s; pointer-events: none;
    text-align: center; z-index: 10; min-width: 200px; max-width: 340px;
  `
  infoEl.innerHTML = `
    <div id="info-name" style="font-size:18px;font-weight:600;margin-bottom:4px"></div>
    <div id="info-data" style="font-size:13px;opacity:0.7;line-height:1.5"></div>
  `
  document.body.appendChild(infoEl)
}

function createSpeedButtons(planets) {
  const btnContainer = document.createElement('div')
  btnContainer.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 6px; align-items: center; z-index: 10;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
    padding: 8px 14px; border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
  `

  const speedLabel = document.createElement('span')
  speedLabel.textContent = 'VEL'
  speedLabel.style.cssText = 'color:rgba(255,255,255,0.4); font-size:10px; font-family:system-ui; letter-spacing:1px; margin-right:4px;'
  btnContainer.appendChild(speedLabel)

  const speedBtns = []

  SPEED_PRESETS.forEach((preset) => {
    const btn = document.createElement('button')
    btn.textContent = preset.label
    btn.style.cssText = `
      background: ${preset.value === 1 ? '#8b5cf6' : 'rgba(255,255,255,0.08)'};
      color: ${preset.value === 1 ? '#fff' : 'rgba(255,255,255,0.7)'};
      border: 1px solid ${preset.value === 1 ? '#8b5cf6' : 'rgba(255,255,255,0.12)'};
      border-radius: 8px; padding: 6px 10px; cursor: pointer;
      font-family: system-ui; font-size: 12px; font-weight: 600;
      transition: all 0.15s; min-width: 38px;
    `
    btn.addEventListener('click', () => {
      speedMultiplier = preset.value
      speedBtns.forEach((b, i) => {
        const p = SPEED_PRESETS[i]
        b.style.background = p.value === speedMultiplier ? '#8b5cf6' : 'rgba(255,255,255,0.08)'
        b.style.color = p.value === speedMultiplier ? '#fff' : 'rgba(255,255,255,0.7)'
        b.style.borderColor = p.value === speedMultiplier ? '#8b5cf6' : 'rgba(255,255,255,0.12)'
      })
      planets.forEach((p) => {
        if (!p.isMoon && p.info) {
          p.speed = (BASE_SPEED * speedMultiplier) / p.info.period
        }
      })
    })
    btnContainer.appendChild(btn)
    speedBtns.push(btn)
  })

  document.body.appendChild(btnContainer)
}

function setupClickHandler(camera, canvas, clickables) {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const meshes = clickables.map((c) => c.mesh)
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object
      const found = clickables.find((c) => c.mesh === hitMesh)
      if (found) {
        showPlanetInfo(found.info)
      }
    } else {
      hidePlanetInfo()
    }
  })
}

function setupHoverHandler(camera, canvas, clickables) {
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const tooltip = document.createElement('div')
  tooltip.id = 'hover-tooltip'
  tooltip.style.cssText = `
    position: fixed; padding: 4px 10px; border-radius: 8px;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    color: white; font-family: system-ui, sans-serif;
    font-size: 12px; font-weight: 500; pointer-events: none;
    opacity: 0; transition: opacity 0.15s; z-index: 10;
    border: 1px solid rgba(255,255,255,0.1);
  `
  document.body.appendChild(tooltip)

  let lastMove = 0

  canvas.addEventListener('mousemove', (event) => {
    const now = performance.now()
    if (now - lastMove < HOVER_THROTTLE_MS) return
    lastMove = now

    const rect = canvas.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)

    const meshes = clickables.map((c) => c.mesh)
    const intersects = raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object
      const found = clickables.find((c) => c.mesh === hitMesh)
      if (found) {
        tooltip.textContent = found.info.name
        tooltip.style.left = `${event.clientX + 12}px`
        tooltip.style.top = `${event.clientY - 8}px`
        tooltip.style.opacity = '1'
        canvas.style.cursor = 'pointer'
        return
      }
    }

    tooltip.style.opacity = '0'
    canvas.style.cursor = 'default'
  })

  canvas.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0'
    canvas.style.cursor = 'default'
  })
}

function showPlanetInfo(info) {
  const infoEl = document.getElementById('planet-info')
  const nameEl = document.getElementById('info-name')
  const dataEl = document.getElementById('info-data')

  nameEl.textContent = info.name
  dataEl.innerHTML = `
    ${info.description}<br>
    Tipo: ${info.type} &middot; Masa: ${info.mass}<br>
    Gravedad: ${info.gravity} &middot; Temp: ${info.temperature}<br>
    Lunas: ${info.moons} &middot; Radio: ${info.realRadius}<br>
    Distancia: ${info.realDistance} &middot; Per&iacute;odo: ${info.period} a&ntilde;os
  `
  infoEl.style.opacity = '1'

  clearTimeout(infoTimeout)
  infoTimeout = setTimeout(() => { infoEl.style.opacity = '0' }, 5000)
}

function hidePlanetInfo() {
  const infoEl = document.getElementById('planet-info')
  infoEl.style.opacity = '0'
  clearTimeout(infoTimeout)
}

export function updateLabels(planets, camera) {
  const worldPos = new THREE.Vector3()
  let frameCount = 0

  return function () {
    frameCount++
    if (frameCount % LABEL_UPDATE_THROTTLE_FRAMES !== 0) return

    planets.forEach((p) => {
      if (p.isMoon || !p.labelDiv || !p.mesh) return

      worldPos.set(0, 0, 0)
      p.mesh.getWorldPosition(worldPos)
      const dist = camera.position.distanceTo(worldPos)

      const fontSize = Math.max(
        LABEL_FONT_SIZE_MIN,
        Math.min(LABEL_FONT_SIZE_MAX, LABEL_DISTANCE_FACTOR / dist)
      )
      p.labelDiv.style.fontSize = `${fontSize}px`
      p.labelDiv.style.opacity = Math.max(0.2, Math.min(1, 1 - dist / LABEL_MAX_DISTANCE))
    })
  }
}
