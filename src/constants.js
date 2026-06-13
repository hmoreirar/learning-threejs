// Velocidades
export const ORBIT_SPEED_FACTOR = 0.016
export const ASTEROID_ROTATION_SPEED = 0.001
export const CLOUD_ROTATION_SPEED = 0.005
export const CINEMATIC_ORBIT_SPEED = 0.04
export const SUN_ROTATION_SPEED = 0.05
export const BASE_SPEED = 0.2

// Cámara
export const CAMERA_DEFAULT_POS = [12, 8, 18]
export const CAMERA_CINEMATIC_POS = [22, 6, 0]
export const CAMERA_ANIM_DURATION = 1.5
export const CAMERA_CINEMATIC_RADIUS = 22
export const CAMERA_CINEMATIC_HEIGHT = 6
export const CAMERA_CINEMATIC_HEIGHT_AMPLITUDE = 2
export const CAMERA_CINEMATIC_HEIGHT_FREQ = 0.02

// Render
export const MAX_PIXEL_RATIO = 2
export const SHADOW_MAP_SIZE = 1024

// Counts
export const STAR_COUNT = 5000
export const ASTEROID_COUNT = 5000
export const TRAIL_LENGTH = 80

// Labels
export const LABEL_FONT_SIZE_MIN = 8
export const LABEL_FONT_SIZE_MAX = 16
export const LABEL_DISTANCE_FACTOR = 200
export const LABEL_MAX_DISTANCE = 50
export const LABEL_UPDATE_THROTTLE_FRAMES = 3

// Cometa
export const COMET_TRAIL_SIZE = 0.06
export const COMET_HEAD_SIZE = 0.12

// Bloom
export const BLOOM_STRENGTH = 0.6
export const BLOOM_RADIUS = 0.4
export const BLOOM_THRESHOLD = 0.6

// Hover
export const HOVER_THROTTLE_MS = 50

// Velocidades predefinidas
export const SPEED_PRESETS = [
  { label: '\u23F8', value: 0 },
  { label: '\u00BC\u00D7', value: 0.25 },
  { label: '\u00BD\u00D7', value: 0.5 },
  { label: '1\u00D7', value: 1 },
  { label: '2\u00D7', value: 2 },
  { label: '5\u00D7', value: 5 },
  { label: '10\u00D7', value: 10 }
]
