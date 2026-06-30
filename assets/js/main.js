/* ══════════════════════════════════════
   AR PORTFOLIO — main.js (v2.6)
   Lenis smooth scroll · boot loader · scramble type
   ColorBends WebGL · spotlight cards · perf guards
══════════════════════════════════════ */
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

/* ══════════════════════════════════════
   LENIS SMOOTH SCROLL
══════════════════════════════════════ */
let lenis = null;
if (window.Lenis && !RM) {
  lenis = new Lenis({
    duration: 1.15,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6
  });
  (function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  })(performance.now());
}

function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.3 });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    else if (target === 0) window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
  }
}

// Anchor links → smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      closeMenu();
      scrollToTarget(id);
      history.replaceState(null, '', id);
    }
  });
});

/* ══════════════════════════════════════
   SCRAMBLE / DECODE TYPE
══════════════════════════════════════ */
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#01';
let scrambleSeq = 0;
function scramble(el, duration = 850) {
  const final = el.dataset.final || el.textContent;
  el.dataset.final = final;
  if (RM) { el.textContent = final; return; }
  const run = String(++scrambleSeq);
  el.dataset.scrambleRun = run;
  clearTimeout(el._scrambleTimer);
  const len = final.length;
  const start = performance.now();
  const finish = () => {
    if (el.dataset.scrambleRun !== run) return;
    el.textContent = final;
    delete el.dataset.scrambleRun;
  };
  el._scrambleTimer = setTimeout(finish, duration + 160);
  (function frame(now) {
    if (el.dataset.scrambleRun !== run) return;
    const p = Math.min(1, (now - start) / duration);
    const cut = Math.floor(p * len);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = final[i];
      out += i < cut || ch === ' ' ? ch : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame);
    else finish();
  })(start);
}

// Decode section headings as they enter the viewport
const scrObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      scramble(e.target, 950);
      scrObs.unobserve(e.target);
    }
  });
}, { threshold: .4 });
document.querySelectorAll('section:not(#s-hero) [data-scramble]').forEach(el => scrObs.observe(el));

/* ══════════════════════════════════════
   BOOT LOADER
══════════════════════════════════════ */
const loader = document.getElementById('loader');
// sessionStorage can throw on file:// or with cookies disabled — never let it block the page
const store = {
  get(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (_) {} }
};
function dismissLoader() {
  if (document.body.classList.contains('booted')) return;
  if (loader) loader.classList.add('done');
  document.body.style.overflow = '';
  document.body.classList.add('booted');
  if (lenis) lenis.start();
}
// Watchdog: no matter what goes wrong, the loader can never trap the page
setTimeout(dismissLoader, 4000);

(function boot() {
  if (!loader) { document.body.classList.add('booted'); return; }
  const skip = RM || store.get('ar-booted');
  if (skip) {
    loader.style.display = 'none';
    document.body.classList.add('booted');
    document.querySelectorAll('.hero-name [data-scramble]').forEach((el, i) =>
      setTimeout(() => scramble(el, 700), i * 140));
    return;
  }
  if (lenis) lenis.stop();
  document.body.style.overflow = 'hidden';

  const term = document.getElementById('ld-term');
  const bar = document.getElementById('ld-bar');
  const pct = document.getElementById('ld-pct');
  const lines = [
    '> boot ar-portfolio --env=production',
    '> loading models ............ <span class="ok">ok</span>',
    '> mounting vector index ..... <span class="ok">ok</span>',
    '> warming inference api ..... <span class="ok">ok</span>',
    '> render'
  ];
  let i = 0, progress = 0;
  const stepTime = 230;
  const tick = setInterval(() => {
    if (i < lines.length) {
      term.innerHTML += lines[i] + '\n';
      i++;
    }
    progress = Math.min(100, Math.round((i / lines.length) * 100));
    bar.style.width = progress + '%';
    pct.textContent = progress + '%';
    if (i >= lines.length) {
      clearInterval(tick);
      setTimeout(finish, 320);
    }
  }, stepTime);

  function finish() {
    store.set('ar-booted', '1');
    dismissLoader();
    document.querySelectorAll('.hero-name [data-scramble]').forEach((el, j) =>
      setTimeout(() => scramble(el, 900), 150 + j * 180));
  }
})();

/* ══════════════════════════════════════
   ROLE ROTATOR
══════════════════════════════════════ */
(function roleRotator() {
  const el = document.getElementById('role-rotator');
  if (!el || RM) return;
  const roles = ['GenAI Systems', 'Fraud Detection ML', 'Real-Time Pipelines', 'RAG & Vector Search', 'MLOps at Scale'];
  if (!FINE_POINTER || window.innerWidth <= 640) {
    el.textContent = roles[0];
    el.dataset.final = roles[0];
    return;
  }
  let idx = 0;
  setInterval(() => {
    el.classList.add('swapping');
    setTimeout(() => {
      idx = (idx + 1) % roles.length;
      el.textContent = roles[idx];
      el.dataset.final = roles[idx];
      el.classList.remove('swapping');
    }, 240);
  }, 3600);
})();

/* ══════════════════════════════════════
   COLOR BENDS — Three.js WebGL shader
══════════════════════════════════════ */
const FRAG = `

#define MAX_COLORS 8
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;
void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;
  vec3 col = vec3(0.0);
  float a = 1.0;
  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-6.0 / exp(6.0 * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  }
  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }
  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}

`;
const VERT = `
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,1.0);}
`;

// Pauses rendering whenever the canvas leaves the viewport or the tab is hidden
function visibilityGuard(el, onChange) {
  let inView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      onChange(inView && !document.hidden);
    }, { rootMargin: '120px' }).observe(el);
  }
  document.addEventListener('visibilitychange', () => onChange(inView && !document.hidden));
}

function createColorBends(canvas, opts) {
  if (!canvas || !window.THREE) return;
  const {
    colors = ['#ff5c7a','#8a5cff','#00ffd1'],
    rotation = 0, speed = 0.2, scale = 1,
    frequency = 1, warpStrength = 1,
    mouseInfluence = 1, parallax = 0.5,
    noise = 0.1, transparent = true, autoRotate = 0
  } = opts;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const geo = new THREE.PlaneGeometry(2,2);

  const MAX_COLORS = 8;
  const uColorsArray = Array.from({length:MAX_COLORS},()=>new THREE.Vector3(0,0,0));

  function hexToVec3(hex) {
    const h = hex.replace('#','').trim();
    const v = h.length===3
      ? [parseInt(h[0]+h[0],16),parseInt(h[1]+h[1],16),parseInt(h[2]+h[2],16)]
      : [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];
    return new THREE.Vector3(v[0]/255,v[1]/255,v[2]/255);
  }

  const arr = colors.filter(Boolean).slice(0,MAX_COLORS).map(hexToVec3);
  arr.forEach((v,i)=>uColorsArray[i].copy(v));

  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG,
    uniforms: {
      uCanvas:       {value: new THREE.Vector2(1,1)},
      uTime:         {value: 0},
      uSpeed:        {value: speed},
      uRot:          {value: new THREE.Vector2(1,0)},
      uColorCount:   {value: arr.length},
      uColors:       {value: uColorsArray},
      uTransparent:  {value: transparent?1:0},
      uScale:        {value: scale},
      uFrequency:    {value: frequency},
      uWarpStrength: {value: warpStrength},
      uPointer:      {value: new THREE.Vector2(0,0)},
      uMouseInfluence:{value: mouseInfluence},
      uParallax:     {value: parallax},
      uNoise:        {value: noise}
    },
    premultipliedAlpha: true,
    transparent: true
  });

  scene.add(new THREE.Mesh(geo,mat));

  const renderer = new THREE.WebGLRenderer({canvas, antialias:false, alpha:true, powerPreference:'high-performance'});
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0x000000, transparent?0:1);

  function resize() {
    const w = canvas.clientWidth||window.innerWidth;
    const h = canvas.clientHeight||window.innerHeight;
    renderer.setSize(w,h,false);
    mat.uniforms.uCanvas.value.set(w,h);
  }
  resize();
  if('ResizeObserver' in window) {
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement||canvas);
  }

  // Mouse tracking
  const ptrTarget = new THREE.Vector2(0,0);
  const ptrCurrent = new THREE.Vector2(0,0);
  const container = canvas.parentElement || document.body;
  container.addEventListener('pointermove', e => {
    const r = container.getBoundingClientRect();
    const x = ((e.clientX-r.left)/(r.width||1))*2-1;
    const y = -(((e.clientY-r.top)/(r.height||1))*2-1);
    ptrTarget.set(x,y);
  }, {passive:true});

  let active = true;
  visibilityGuard(container, v => { active = v; });

  const clock = new THREE.Clock();
  let rotAngle = rotation;
  function loop() {
    requestAnimationFrame(loop);
    if (!active) { clock.getDelta(); return; }
    const dt = clock.getDelta();
    mat.uniforms.uTime.value = clock.elapsedTime;
    rotAngle += autoRotate * dt;
    const rad = (rotAngle * Math.PI) / 180;
    mat.uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));
    ptrCurrent.lerp(ptrTarget, Math.min(1, dt*8));
    mat.uniforms.uPointer.value.copy(ptrCurrent);
    renderer.render(scene, camera);
  }
  if (RM) { renderer.render(scene, camera); }  // single static frame
  else requestAnimationFrame(loop);
}

/* ══════════════════════════════════════
   BACKGROUND PARTICLE FIELD
══════════════════════════════════════ */
function createBackgroundField(canvas) {
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 20);
  camera.position.z = 5;

  const count = window.innerWidth < 700 ? 80 : 150;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }

  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(pointGeo, new THREE.PointsMaterial({
    color: 0x30f5c8,
    size: 0.018,
    transparent: true,
    opacity: 0.62
  }));
  scene.add(points);

  const linePositions = [];
  for (let i = 0; i < count - 1; i += 3) {
    linePositions.push(
      positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
      positions[(i + 1) * 3], positions[(i + 1) * 3 + 1], positions[(i + 1) * 3 + 2]
    );
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color: 0x6aa8ff,
    transparent: true,
    opacity: 0.08
  }));
  scene.add(lines);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let tx = 0, ty = 0;
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / window.innerWidth - 0.5) * 0.18;
    ty = (e.clientY / window.innerHeight - 0.5) * 0.12;
  }, { passive: true });

  let active = true;
  document.addEventListener('visibilitychange', () => { active = !document.hidden; });

  function render(t = 0) {
    if (!RM) requestAnimationFrame(render);
    if (!active) return;
    points.rotation.y = t * 0.000035 + tx;
    lines.rotation.y = points.rotation.y;
    points.rotation.x = ty;
    lines.rotation.x = ty;
    renderer.render(scene, camera);
  }
  render();
}

function createImmersiveScene(canvas) {
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x02030a, 0.055);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
  camera.position.set(0, 0.4, 9);

  const world = new THREE.Group();
  scene.add(world);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.8));
  renderer.setClearColor(0x02030a, 0);

  scene.add(new THREE.AmbientLight(0x9bdcff, 0.42));
  const key = new THREE.PointLight(0x5fffe0, 1.55, 20);
  key.position.set(4, 4, 5);
  scene.add(key);
  const magenta = new THREE.PointLight(0xff5ea8, 1.05, 16);
  magenta.position.set(-4, -2, 4);
  scene.add(magenta);

  const lab = new THREE.Group();
  world.add(lab);

  const panelMat = new THREE.MeshPhongMaterial({
    color: 0x0d1a31,
    emissive: 0x061423,
    shininess: 78,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide
  });
  const panelEdgeMat = new THREE.LineBasicMaterial({ color: 0x5fffe0, transparent: true, opacity: 0.28 });
  const panels = [];
  [
    [-0.95, 0.56, 0.18, -0.15, 0.44, 1.45, 0.9, 0x5fffe0],
    [0.84, 0.24, -0.36, 0.08, -0.36, 1.18, 0.72, 0x74a7ff],
    [0.08, -0.82, 0.26, -0.22, 0.12, 1.8, 0.58, 0xff5ea8],
    [-0.2, 1.22, -0.62, 0.22, -0.18, 1.34, 0.52, 0xd8f36a]
  ].forEach(([x, y, z, rx, ry, w, h, color]) => {
    const mat = panelMat.clone();
    mat.color.setHex(color);
    mat.emissive.setHex(color);
    mat.emissiveIntensity = 0.04;
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    panel.position.set(x, y, z);
    panel.rotation.set(rx, ry, 0);
    panel.userData.base = panel.position.clone();
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(panel.geometry), panelEdgeMat.clone());
    panel.add(edge);
    lab.add(panel);
    panels.push(panel);
  });

  const cubeGroup = new THREE.Group();
  lab.add(cubeGroup);
  const cubeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
  const cubes = [];
  for (let i = 0; i < 28; i++) {
    const mat = new THREE.MeshPhongMaterial({
      color: i % 3 === 0 ? 0xff5ea8 : i % 3 === 1 ? 0x74a7ff : 0x5fffe0,
      emissive: i % 3 === 0 ? 0x2e0a1c : 0x082923,
      transparent: true,
      opacity: 0.72,
      shininess: 60
    });
    const cube = new THREE.Mesh(cubeGeo, mat);
    const col = i % 7;
    const row = Math.floor(i / 7);
    cube.position.set((col - 3) * 0.28, (row - 1.5) * 0.28, (Math.random() - 0.5) * 0.72);
    cube.rotation.set(Math.random() * 0.6, Math.random() * 0.8, Math.random() * 0.4);
    cube.userData.base = cube.position.clone();
    cubeGroup.add(cube);
    cubes.push(cube);
  }

  const dataNodes = new THREE.Group();
  world.add(dataNodes);
  const nodeData = [
    { label: 'RAG', color: 0x5fffe0, pos: [-2.4, 0.72, 0.6] },
    { label: 'MLOps', color: 0x74a7ff, pos: [2.05, -0.92, -0.2] },
    { label: 'Vision', color: 0xff5ea8, pos: [1.9, 1.15, -0.45] },
    { label: 'Streaming', color: 0xd8f36a, pos: [-0.65, -1.86, 0.42] },
    { label: 'Risk', color: 0xff5ea8, pos: [0.4, 1.92, 0.22] }
  ];
  const dataNodeMeshes = nodeData.map((node, i) => {
    const mat = new THREE.MeshPhongMaterial({
      color: node.color,
      emissive: node.color,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(i === 0 ? 0.11 : 0.085, 0), mat);
    mesh.position.set(node.pos[0], node.pos[1], node.pos[2]);
    mesh.userData.base = mesh.position.clone();
    dataNodes.add(mesh);
    return mesh;
  });

  const beamPositions = [];
  nodeData.forEach(node => beamPositions.push(0, 0, 0, node.pos[0], node.pos[1], node.pos[2]));
  const beams = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(beamPositions, 3)),
    new THREE.LineBasicMaterial({ color: 0x5fffe0, transparent: true, opacity: 0.16 })
  );
  world.add(beams);

  const grid = new THREE.GridHelper(12, 28, 0x5fffe0, 0x203452);
  grid.position.y = -2.7;
  grid.rotation.x = Math.PI * 0.03;
  grid.material.transparent = true;
  grid.material.opacity = 0.13;
  world.add(grid);

  const count = window.innerWidth < 700 ? 280 : 820;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const field = new THREE.Points(fieldGeo, new THREE.PointsMaterial({
    color: 0x5fffe0,
    size: window.innerWidth < 700 ? 0.026 : 0.018,
    transparent: true,
    opacity: window.innerWidth < 700 ? 0.32 : 0.46,
    depthWrite: false
  }));
  scene.add(field);

  const sectionIds = ['s-hero', 's-about', 's-exp', 's-proj', 's-edu', 's-contact'];
  const targets = [
    { camera: [0, 0.4, 9], world: [2.6, 0, 0], scale: 1, rot: 0 },
    { camera: [-0.8, 0.35, 8.2], world: [3.4, 0.2, -0.2], scale: 0.88, rot: 0.6 },
    { camera: [0.7, 0.1, 8.6], world: [-3.1, -0.1, -0.3], scale: 0.92, rot: 1.45 },
    { camera: [0, 0.15, 7.2], world: [0, 0, 0], scale: 1.1, rot: 2.35 },
    { camera: [-0.5, 0.35, 8.8], world: [3, -0.1, -0.4], scale: 0.84, rot: 3.25 },
    { camera: [0, 0.4, 9.5], world: [0, 0.15, -0.6], scale: 0.95, rot: 4.1 }
  ];
  let targetIndex = 0;
  function updateTarget() {
    const center = window.scrollY + window.innerHeight * 0.48;
    let best = 0;
    let bestDistance = Infinity;
    sectionIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.offsetTop;
      const mid = top + el.offsetHeight * 0.5;
      const d = Math.abs(center - mid);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    });
    targetIndex = best;
  }
  updateTarget();
  window.addEventListener('scroll', updateTarget, { passive: true });

  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener('pointermove', e => {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let active = true;
  document.addEventListener('visibilitychange', () => { active = !document.hidden; });

  const targetWorld = new THREE.Vector3();
  const targetCamera = new THREE.Vector3();
  function render(t = 0) {
    if (!RM) requestAnimationFrame(render);
    if (!active) return;
    const time = t * 0.001;
    const target = targets[targetIndex];

    targetCamera.set(
      target.camera[0] + pointerX * 0.24,
      target.camera[1] - pointerY * 0.16,
      target.camera[2]
    );
    camera.position.lerp(targetCamera, 0.045);
    camera.lookAt(0, 0, 0);

    targetWorld.set(target.world[0], target.world[1], target.world[2]);
    world.position.lerp(targetWorld, 0.05);
    world.scale.lerp(new THREE.Vector3(target.scale, target.scale, target.scale), 0.045);
    world.rotation.y += ((target.rot + time * 0.12) - world.rotation.y) * 0.025;
    world.rotation.x += ((-0.08 + pointerY * 0.08) - world.rotation.x) * 0.035;

    lab.rotation.y = Math.sin(time * 0.18) * 0.16 + pointerX * 0.08;
    lab.rotation.x = -0.08 + Math.sin(time * 0.14) * 0.05 - pointerY * 0.04;
    panels.forEach((panel, i) => {
      const base = panel.userData.base;
      panel.position.y = base.y + Math.sin(time * 0.7 + i) * 0.05;
      panel.material.opacity = 0.26 + Math.sin(time * 1.1 + i) * 0.045 + (targetIndex === 3 ? 0.04 : 0);
      panel.rotation.z = Math.sin(time * 0.28 + i) * 0.045;
    });
    cubes.forEach((cube, i) => {
      const base = cube.userData.base;
      cube.position.y = base.y + Math.sin(time * 1.5 + i * 0.47) * 0.06;
      cube.position.z = base.z + Math.cos(time * 1.1 + i * 0.31) * 0.08;
      cube.rotation.x += 0.004 + (i % 5) * 0.0003;
      cube.rotation.y += 0.006 + (i % 7) * 0.0002;
    });
    dataNodeMeshes.forEach((node, i) => {
      const base = node.userData.base;
      node.position.y = base.y + Math.sin(time * 1.3 + i) * 0.08;
      node.scale.setScalar(1 + Math.sin(time * 2.1 + i) * 0.13);
    });
    field.rotation.y = time * 0.025 + pointerX * 0.035;
    field.rotation.x = -pointerY * 0.02;

    renderer.render(scene, camera);
  }
  if (RM) render(0);
  else requestAnimationFrame(render);
}

createImmersiveScene(document.getElementById('bg-canvas'));

// — Hero ColorBends: warm pink/violet/teal, low opacity via CSS
createColorBends(document.getElementById('cb-canvas'), {
  colors: ['#ff5c7a','#8a5cff','#00ffd1'],
  rotation: 0, speed: 0.18, scale: 1, frequency: 1,
  warpStrength: 1, mouseInfluence: 1, parallax: 0.5,
  noise: 0.08, transparent: true, autoRotate: 0
});

// — Contact ColorBends: cooler palette
createColorBends(document.getElementById('cb-contact'), {
  colors: ['#00ffd1','#8a5cff','#ff5c7a'],
  rotation: 45, speed: 0.12, scale: 1.2, frequency: 0.8,
  warpStrength: 1.2, mouseInfluence: 0.8, parallax: 0.3,
  noise: 0.06, transparent: true, autoRotate: 3
});

/* ══════════════════════════════════════
   CURSOR (fine pointers only)
══════════════════════════════════════ */
const CUR = document.getElementById('CUR'), CURF = document.getElementById('CUR_F');
if (FINE_POINTER && !RM) {
  let mx=0,my=0,fx=0,fy=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;CUR.style.left=mx+'px';CUR.style.top=my+'px'},{passive:true});
  (function animF(){fx+=(mx-fx)*.1;fy+=(my-fy)*.1;CURF.style.left=fx+'px';CURF.style.top=fy+'px';requestAnimationFrame(animF)})();
}

/* ══════════════════════════════════════
   SCROLL PROGRESS + NAV BLUR + TO-TOP
══════════════════════════════════════ */
const pbar=document.getElementById('pbar'),tnav=document.getElementById('tnav'),totop=document.getElementById('totop');
function onScroll(){
  const y = window.scrollY;
  const p = y/(document.body.scrollHeight-window.innerHeight)*100;
  pbar.style.width=p+'%';
  tnav.classList.toggle('scrolled',y>60);
  totop.classList.toggle('show',y>700);
}
if (lenis) lenis.on('scroll', onScroll);
window.addEventListener('scroll',onScroll,{passive:true});
totop.addEventListener('click',()=>scrollToTarget(0));

/* ══════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════ */
const menuBtn=document.getElementById('menu-btn'),mMenu=document.getElementById('m-menu');
function closeMenu(){
  if(!mMenu.classList.contains('open'))return;
  mMenu.classList.remove('open');
  mMenu.setAttribute('aria-hidden','true');
  menuBtn.setAttribute('aria-expanded','false');
  document.body.style.overflow='';
  if(lenis)lenis.start();
}
menuBtn.addEventListener('click',()=>{
  const open=mMenu.classList.toggle('open');
  mMenu.setAttribute('aria-hidden',String(!open));
  menuBtn.setAttribute('aria-expanded',String(open));
  document.body.style.overflow=open?'hidden':'';
  if(lenis)open?lenis.stop():lenis.start();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

/* ══════════════════════════════════════
   COUNT UP
══════════════════════════════════════ */
function countUp(el){
  const target=+el.dataset.target, suffix=el.dataset.suffix||'';
  if(RM){el.textContent=target+suffix;return}
  let cur=0;const step=target/60;
  const t=setInterval(()=>{
    cur=Math.min(cur+step,target);
    el.textContent=Math.floor(cur)+suffix;
    if(cur>=target){el.textContent=target+suffix;clearInterval(t)}
  },25);
}
const cntObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){countUp(e.target);cntObs.unobserve(e.target)}})},{threshold:.5});
document.querySelectorAll('.counter').forEach(el=>cntObs.observe(el));

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
const revObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revObs.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

/* EXP CARD top-bar */
const cObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');cObs.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll('.exp-card').forEach(el=>cObs.observe(el));

/* ══════════════════════════════════════
   TILT + SPOTLIGHT CARDS
══════════════════════════════════════ */
if (FINE_POINTER && !RM) {
  document.querySelectorAll('.tilt-card').forEach(card=>{
    card.addEventListener('mouseenter',()=>{
      // applied on hover only, so the .reveal entrance transition stays intact
      card.style.transition='transform .12s ease, box-shadow .3s ease';
    });
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(600px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateZ(6px)`;
    },{passive:true});
    card.addEventListener('mouseleave',()=>{card.style.transform=''});
  });
  document.querySelectorAll('.spot').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      card.style.setProperty('--mx',(e.clientX-r.left)+'px');
      card.style.setProperty('--my',(e.clientY-r.top)+'px');
    },{passive:true});
  });
}

/* PROJECT PREVIEW VIDEOS */
document.querySelectorAll('.pcard').forEach(card=>{
  const video=card.querySelector('video');
  if(!video) return;
  const play=()=>{video.play().catch(()=>{})};
  const pause=()=>{video.pause();video.currentTime=0};
  card.addEventListener('mouseenter',play);
  card.addEventListener('focusin',play);
  card.addEventListener('mouseleave',pause);
  card.addEventListener('focusout',pause);
});

/* ══════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════ */
if (FINE_POINTER && !RM) {
  document.querySelectorAll('.mag-btn').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)*.28;
      const dy=(e.clientY-r.top-r.height/2)*.28;
      btn.style.transform=`translate(${dx}px,${dy}px)`;
    },{passive:true});
    btn.addEventListener('mouseleave',()=>{btn.style.transform=''});
  });
}

/* ══════════════════════════════════════
   SIDE NAV + TOP NAV ACTIVE
══════════════════════════════════════ */
const sideItems=document.querySelectorAll('.si');
const topLinks=document.querySelectorAll('.nls a');
const snObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id=entry.target.id;
      sideItems.forEach(a=>a.classList.toggle('act',a.dataset.s===id));
      topLinks.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+id));
    }
  });
},{threshold:.35});
document.querySelectorAll('section[id]').forEach(s=>snObs.observe(s));
