# Solar System - Three.js

Sistema solar interactivo hecho con Three.js y Vite.

![Solar System Demo](public/demo.gif)

## Features

- Sol con shader personalizado (plasma animado, fresnel, puntos calientes)
- 8 planetas con texturas reales (2K) y datos de astronomía reales
- Luna de la Tierra + 4 lunas de Júpiter (Ío, Europa, Ganímedes, Calisto)
- Anillos de Saturno con textura
- Atmósfera y nubes animadas en la Tierra
- Cinturón de asteroides (5000 partículas)
- Estrellas de fondo con shader de titileo
- Nebulosas de fondo
- Cometa con estela de partículas
- Bloom post-processing (UnrealBloomPass)
- Lens flare con ghosts
- Labels CSS2D responsivos (se achican con la distancia)
- Click en planetas → info detallada (masa, gravedad, temperatura, lunas, etc.)
- Hover tooltip
- Control de velocidad (0× a 10×)
- Modo cinemático (tecla C)
- Loading bar con progreso

## Tech Stack

- [Three.js](https://threejs.org/) v0.184
- [Vite](https://vitejs.dev/) v8
- JavaScript ES modules

## Install

```bash
git clone https://github.com/hmoreirar/learning-threejs.git
cd learning-threejs
npm install
npm run dev
```

## Controls

| Input | Acción |
|-------|--------|
| Mouse drag | Rotar cámara |
| Scroll | Zoom |
| Click en planeta | Info detallada |
| Hover | Tooltip con nombre |
| Tecla C | Modo cinemático |
| Botones VEL | Controlar velocidad |

## Project Structure

```
src/
  main.js         → entry point, orquestación async
  scene.js        → scene, camera, renderers, controls
  sun.js          → sol + shader + glow + flare
  planets.js      → planetas con datos reales + lunas
  effects.js      → asteroides, estrellas, nebulosas, cometa, bloom
  ui.js           → labels, tooltips, info, loading bar
  animation.js    → loop + deltaTime + cinematic camera
  shaders.js      → GLSL shaders
  constants.js    → named constants
  textures.js     → LoadingManager con progreso
  style.css       → estilos base
```

## License

MIT
