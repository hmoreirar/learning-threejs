export const SUN_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const SUN_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 texColor = texture2D(uTexture, vUv).rgb;

    float t = uTime;
    float plasma = sin(vUv.x * 6.0 + vUv.y * 4.0 + t * 0.3)
                 + cos(vUv.y * 5.0 - vUv.x * 3.0 + t * 0.4)
                 + sin((vUv.x + vUv.y) * 7.0 + t * 0.5);
    plasma = plasma * 0.25 + 0.5;

    vec3 plasmaColor = mix(
      vec3(1.0, 0.8, 0.3),
      vec3(0.9, 0.4, 0.0),
      plasma
    );

    vec3 baseColor = mix(texColor, plasmaColor, 0.5);

    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.5);
    baseColor += vec3(1.0, 0.4, 0.0) * fresnel * 0.5;

    float hot = sin(vUv.x * 12.0 + vUv.y * 10.0 + t * 1.5)
              * cos(vUv.y * 8.0 - vUv.x * 6.0 + t * 2.0);
    hot = max(0.0, hot * 0.5 + 0.5);
    baseColor += vec3(1.0, 0.5, 0.1) * pow(hot, 3.0) * 0.4;

    gl_FragColor = vec4(baseColor, 1.0);
  }
`

export const ATMOSPHERE_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const ATMOSPHERE_FRAGMENT_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float intensity = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.6);
  }
`

export const STAR_VERTEX_SHADER = `
  varying float vSeed;
  void main() {
    vec4 viewPos = viewMatrix * modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPos;
    gl_PointSize = 0.15 * 250.0 * (1.0 / -viewPos.z);
    vSeed = sin(position.x * 12.3 + position.y * 45.6 + position.z * 78.9);
  }
`

export const STAR_FRAGMENT_SHADER = `
  uniform float uTime;
  varying float vSeed;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float twinkle = sin(uTime * (1.5 + vSeed * 0.5) + vSeed * 6.28);
    twinkle = twinkle * 0.3 + 0.7;

    float alpha = (1.0 - smoothstep(0.3, 0.5, dist)) * twinkle;
    vec3 color = mix(
      vec3(0.9, 0.95, 1.0),
      vec3(1.0, 0.9, 0.7),
      vSeed * 0.5 + 0.5
    );

    gl_FragColor = vec4(color, alpha * 0.8);
  }
`
