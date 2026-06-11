/* ============================================================================
 * MindSmack hero orb — our own Three.js build
 *
 * Technique-inspired by Bruno Simon's "organic-sphere", but contains NONE of
 * his code (UNLICENSED / all rights reserved). Built from scratch on MIT Three.js
 * + public-domain Ashima simplex noise.
 *
 * TWO RENDER MODES:
 *   'ring'  — near-circular additive glass ring, warm/cool angular rim (our default).
 *   'glass' — solid dark glass ball with an internal iridescent energy band + gloss
 *             (Siri-style). 'glossy' is a band-less, high-spec variant of this mode.
 *
 * ---- LOCAL TESTING via URL params (served over http, see note at bottom) ----
 *   ?style=NAME           pick a preset (ring|ice|ember|aurora|glass|glossy)
 *   ?style=glass&gloss=2  …then override ANY config key below, e.g.:
 *   ?intensity=1.5  ?distortStrength=0.09  ?spinSpeed=0  ?bandIntensity=2
 *   ?colorWarm=ff4632  ?colorCool=56c7ff   (hex WITHOUT the #, since # is a URL fragment)
 *   ?cameraZ=3.0        (numbers parse as floats; colours as hex strings)
 * The active config is logged to the console so you can see what's applied.
 *
 * Opening the .html via file:// blocks this module in Chrome — serve over http:
 *   python3 -m http.server 5500 --directory <project root>
 *   → http://localhost:5500/mindsmack-landing.html?style=glass
 * ========================================================================== */

import * as THREE from 'three';

// ---- full default config (every key here is URL-overridable) ----------------
const BASE = {
  mode: 'ring',
  // shape (both modes)
  distortFreq: 0.85, distortStrength: 0.055, displaceFreq: 1.3, displaceStrength: 0.03,
  // motion (both modes)
  morphSpeed: 0.35, spinSpeed: 0.05,
  // framing / quality (both modes)
  cameraZ: 3.4, detailDesktop: 48, detailMobile: 24,
  // RING mode — warm/cool angular rim
  colorCool: '#4DE0C8', colorWarm: '#F2B24B', warmDirX: 1.0, warmDirY: 1.0, intensity: 1.2,
  // GLASS mode — glass body, internal band, gloss
  glassColor: '#0a0e14', rimColor: '#bfeaff', rimStrength: 0.6,
  gloss: 1.0, shininess: 48.0, lightX: -0.6, lightY: 0.8, lightZ: 0.6,
  bandIntensity: 1.4, bandWidth: 0.05, bandWave: 0.18, bandFreq: 2.2, bandSpeed: 0.25,
};

// ---- named presets (only list what differs from BASE) -----------------------
const PRESETS = {
  ring:   { mode: 'ring' },
  ice:    { mode: 'ring', colorCool: '#56C7FF', colorWarm: '#6E7BFF' },
  ember:  { mode: 'ring', colorCool: '#F2B24B', colorWarm: '#FF4632' },
  aurora: { mode: 'ring', colorCool: '#4DE0C8', colorWarm: '#9B6BFF' },
  glass:  { mode: 'glass', spinSpeed: 0.0, distortStrength: 0.025, displaceStrength: 0.02, bandIntensity: 1.5 },
  glossy: { mode: 'glass', spinSpeed: 0.03, distortStrength: 0.03, bandIntensity: 0.0,
            rimColor: '#4DE0C8', rimStrength: 1.0, gloss: 1.9, shininess: 80.0, glassColor: '#0c1117' },
};

// ---- resolve config from URL ------------------------------------------------
function resolveConfig(){
  const params = new URLSearchParams(location.search);
  const styleName = params.get('style') || params.get('orb') || 'glass';
  const cfg = Object.assign({}, BASE, PRESETS[styleName] || PRESETS.glass);
  for (const [k, v] of params){
    if (k === 'style' || k === 'orb' || !(k in cfg)) continue;
    const cur = cfg[k];
    if (typeof cur === 'number') cfg[k] = parseFloat(v);
    else if (typeof cur === 'string' && cur.startsWith('#')) cfg[k] = '#' + v.replace(/^#/, '');
    else cfg[k] = v;
  }
  console.log('[orb] style:', styleName, '\n[orb] presets:', Object.keys(PRESETS).join(' | '), '\n[orb] config:', cfg);
  return cfg;
}

// ---- shared noise + displacement chunk (GLSL) -------------------------------
const NOISE_GLSL = `
  // Ashima Arts simplex noise 3D — public domain
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

// displace() needs the distortion uniforms — vertex-shader only (keep it OUT of the
// fragment, which only wants snoise; otherwise the frag references undeclared uniforms)
const DISPLACE_GLSL = `
  vec3 displace(vec3 p){
    vec3 dir = normalize(p);
    float distort = snoise(p * uDistortFreq + vec3(0.0, 0.0, uTime)) * uDistortStrength;
    vec3 q = p + dir * distort;
    float disp = snoise(q * uDisplaceFreq + vec3(uTime * 0.7));
    return q + dir * disp * uDisplaceStrength;
  }
`;

// ---- one vertex shader feeds both modes -------------------------------------
const VERT = `
  uniform float uTime, uDistortFreq, uDistortStrength, uDisplaceFreq, uDisplaceStrength;
  varying vec3 vNormal;   // view-space normal
  varying vec3 vView;     // view vector
  varying vec3 vObjPos;   // stable object-space position (for the band)
  ${NOISE_GLSL}
  ${DISPLACE_GLSL}
  void main(){
    vObjPos = position;
    vec3 displaced = displace(position);
    vec3 n  = normalize(position);
    vec3 up = mix(vec3(0.0,1.0,0.0), vec3(1.0,0.0,0.0), step(0.99, abs(n.y)));
    vec3 t  = normalize(cross(n, up));
    vec3 bt = normalize(cross(n, t));
    float eps = 0.0015;
    vec3 pa = displace(position + t  * eps);
    vec3 pb = displace(position + bt * eps);
    vec3 newNormal = normalize(cross(pa - displaced, pb - displaced));
    if (dot(newNormal, n) < 0.0) newNormal = -newNormal;
    vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
    vView   = -mv.xyz;
    vNormal = normalMatrix * newNormal;
    gl_Position = projectionMatrix * mv;
  }
`;

// ---- RING mode (additive) ---------------------------------------------------
const FRAG_RING = `
  precision highp float;
  uniform vec3 uColorA, uColorB;
  uniform vec2 uWarmDir;
  uniform float uIntensity;
  varying vec3 vNormal; varying vec3 vView; varying vec3 vObjPos;
  void main(){
    vec3 normal = normalize(vNormal);
    vec3 view   = normalize(vView);
    float fres = 1.0 - clamp(dot(normal, view), 0.0, 1.0);
    float glow = pow(fres, 2.0);
    float core = pow(fres, 9.0);
    vec2  dir = normalize(vNormal.xy + 1e-5);
    float t   = dot(dir, normalize(uWarmDir)) * 0.5 + 0.5;
    vec3  col = mix(uColorA, uColorB, smoothstep(0.12, 0.88, t));
    vec3  outColor = col * glow * uIntensity + vec3(1.0) * core * 0.7;
    float alpha    = clamp(glow * 1.1 + core, 0.0, 1.0);
    gl_FragColor = vec4(outColor, alpha);
  }
`;

// ---- GLASS mode (solid, internal iridescent band + gloss) -------------------
const FRAG_GLASS = `
  precision highp float;
  uniform float uTime;
  uniform vec3 uGlassColor, uRimColor, uLightDir;
  uniform float uRimStrength, uGloss, uShininess;
  uniform float uBandIntensity, uBandWidth, uBandWave, uBandFreq, uBandSpeed;
  varying vec3 vNormal; varying vec3 vView; varying vec3 vObjPos;
  ${NOISE_GLSL}
  vec3 spectrum(float t){               // blue -> cyan -> white -> orange -> red
    t = clamp(t, 0.0, 1.0);
    if (t < 0.25) return mix(vec3(0.10,0.30,1.00), vec3(0.00,0.90,1.00), t/0.25);
    if (t < 0.50) return mix(vec3(0.00,0.90,1.00), vec3(1.00,1.00,1.00), (t-0.25)/0.25);
    if (t < 0.75) return mix(vec3(1.00,1.00,1.00), vec3(1.00,0.58,0.10), (t-0.50)/0.25);
    return                mix(vec3(1.00,0.58,0.10), vec3(1.00,0.16,0.10), (t-0.75)/0.25);
  }
  void main(){
    vec3 normal = normalize(vNormal);
    vec3 view   = normalize(vView);
    float ndv = max(dot(normal, view), 0.0);
    float fres = pow(1.0 - ndv, 3.0);

    // internal horizontal energy band, centre line waves over time
    float yc   = snoise(vec3(vObjPos.x * uBandFreq, uTime * uBandSpeed, 0.0)) * uBandWave;
    float dpos = vObjPos.y - yc;
    float band = exp(-(dpos*dpos) / uBandWidth);
    band *= smoothstep(1.0, 0.45, length(vObjPos.xy));   // keep it inside the ball
    vec3 bandCol = spectrum(vObjPos.x * 0.5 + 0.5) * band * uBandIntensity;

    // glossy specular highlight
    vec3 H = normalize(normalize(uLightDir) + view);
    float spec = pow(max(dot(normal, H), 0.0), uShininess) * uGloss;

    vec3 rim = uRimColor * fres * uRimStrength;
    vec3 col = uGlassColor + bandCol + rim + vec3(spec);
    gl_FragColor = vec4(col, 1.0);
  }
`;

(function initOrb(){
  const canvas = document.getElementById('orbCanvas');
  if (!canvas) return;
  const container = canvas.parentElement;
  const cfg = resolveConfig();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    container.style.display = 'none';   // no WebGL -> fall back to the CSS bloom + arc
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, cfg.cameraZ);

  const uniforms = {
    uTime:             { value: 0 },
    uDistortFreq:      { value: cfg.distortFreq },
    uDistortStrength:  { value: cfg.distortStrength },
    uDisplaceFreq:     { value: cfg.displaceFreq },
    uDisplaceStrength: { value: cfg.displaceStrength },
    // ring
    uColorA:  { value: new THREE.Color(cfg.colorCool) },
    uColorB:  { value: new THREE.Color(cfg.colorWarm) },
    uWarmDir: { value: new THREE.Vector2(cfg.warmDirX, cfg.warmDirY) },
    uIntensity: { value: cfg.intensity },
    // glass
    uGlassColor: { value: new THREE.Color(cfg.glassColor) },
    uRimColor:   { value: new THREE.Color(cfg.rimColor) },
    uRimStrength:{ value: cfg.rimStrength },
    uGloss:      { value: cfg.gloss },
    uShininess:  { value: cfg.shininess },
    uLightDir:   { value: new THREE.Vector3(cfg.lightX, cfg.lightY, cfg.lightZ) },
    uBandIntensity: { value: cfg.bandIntensity },
    uBandWidth:  { value: cfg.bandWidth },
    uBandWave:   { value: cfg.bandWave },
    uBandFreq:   { value: cfg.bandFreq },
    uBandSpeed:  { value: cfg.bandSpeed },
  };

  const isGlass = cfg.mode === 'glass';
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: isGlass ? FRAG_GLASS : FRAG_RING,
    uniforms,
    transparent: !isGlass,
    blending: isGlass ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: isGlass,
  });

  const detail = window.innerWidth < 860 ? cfg.detailMobile : cfg.detailDesktop;
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1, detail), material);
  scene.add(mesh);

  function resize(){
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let running = false, visible = true, last = 0;

  function render(){
    mesh.rotation.y = uniforms.uTime.value * cfg.spinSpeed;
    renderer.render(scene, camera);
  }
  function loop(){
    if (running || reduceMotion) return;
    running = true;
    last = performance.now();   // reset so a resume after pause doesn't jump
    (function frame(){
      if (!visible){ running = false; return; }
      const now = performance.now();
      uniforms.uTime.value += Math.min((now - last) / 1000, 0.05) * cfg.morphSpeed;
      last = now;
      render();
      requestAnimationFrame(frame);
    })();
  }

  if ('IntersectionObserver' in window){
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }).observe(container);
  }

  if (reduceMotion){ uniforms.uTime.value = 2.0; render(); } else { loop(); }
})();
