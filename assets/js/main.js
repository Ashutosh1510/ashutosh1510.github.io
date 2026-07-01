const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

let lenis = null;
if (window.Lenis && !REDUCED_MOTION) {
  lenis = new Lenis({
    duration: 1.12,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4
  });
  const raf = time => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function scrollToTarget(target) {
  if (lenis) {
    lenis.scrollTo(target, { offset: -80, duration: 1.2 });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (target === 0) window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  else if (el) el.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
}

const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPct = document.getElementById('loader-pct');
let loaderProgress = 0;
const loaderTick = setInterval(() => {
  loaderProgress = Math.min(100, loaderProgress + 11 + Math.round(Math.random() * 13));
  if (loaderBar) loaderBar.style.width = `${loaderProgress}%`;
  if (loaderPct) loaderPct.textContent = `${loaderProgress}%`;
  if (loaderProgress >= 100) {
    clearInterval(loaderTick);
    setTimeout(() => {
      loader?.classList.add('done');
      document.body.classList.add('booted');
    }, 280);
  }
}, REDUCED_MOTION ? 1 : 120);
setTimeout(() => {
  loader?.classList.add('done');
  document.body.classList.add('booted');
}, 2600);

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const href = link.getAttribute('href');
    if (!href || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    closeMobileMenu();
    scrollToTarget(href);
    history.replaceState(null, '', href);
  });
});

const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
function closeMobileMenu() {
  if (!mobileMenu?.classList.contains('open')) return;
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  menuBtn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  if (lenis) lenis.start();
}
menuBtn?.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (lenis) open ? lenis.stop() : lenis.start();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMobileMenu();
});

const progressBar = document.getElementById('progress-bar');
const siteNav = document.getElementById('site-nav');
const toTop = document.getElementById('to-top');
function onScrollUi() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const percent = (window.scrollY / max) * 100;
  if (progressBar) progressBar.style.width = `${percent}%`;
  siteNav?.classList.toggle('scrolled', window.scrollY > 40);
  toTop?.classList.toggle('show', window.scrollY > 700);
}
if (lenis) lenis.on('scroll', onScrollUi);
window.addEventListener('scroll', onScrollUi, { passive: true });
onScrollUi();
toTop?.addEventListener('click', () => scrollToTarget(0));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -54px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    countUp(entry.target);
    countObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

function countUp(el) {
  const target = Number(el.dataset.count || '0');
  const suffix = el.dataset.suffix || '';
  if (REDUCED_MOTION) {
    el.textContent = `${target}${suffix}`;
    return;
  }
  let value = 0;
  const step = Math.max(1, target / 56);
  const timer = setInterval(() => {
    value = Math.min(target, value + step);
    el.textContent = `${Math.floor(value)}${suffix}`;
    if (value >= target) {
      el.textContent = `${target}${suffix}`;
      clearInterval(timer);
    }
  }, 24);
}

const stationLinks = document.querySelectorAll('.station-link');
const navLinks = document.querySelectorAll('.nav-pill a');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    stationLinks.forEach(link => link.classList.toggle('is-active', link.dataset.section === id));
    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  });
}, { threshold: 0.35 });
document.querySelectorAll('.scene-section[id]').forEach(section => sectionObserver.observe(section));

if (FINE_POINTER && !REDUCED_MOTION) {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;
  document.addEventListener('pointermove', event => {
    x = event.clientX;
    y = event.clientY;
    if (dot) {
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
    }
  }, { passive: true });
  const cursorLoop = () => {
    rx += (x - rx) * 0.13;
    ry += (y - ry) * 0.13;
    if (ring) {
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
    }
    requestAnimationFrame(cursorLoop);
  };
  cursorLoop();

  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) translateY(-4px)`;
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * 0.2;
      const dy = (event.clientY - rect.top - rect.height / 2) * 0.2;
      button.style.transform = `translate(${dx}px,${dy}px)`;
    }, { passive: true });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
}

document.querySelectorAll('.mission-card').forEach(card => {
  const video = card.querySelector('video');
  if (!video) return;
  const play = () => video.play().catch(() => {});
  const pause = () => {
    video.pause();
    video.currentTime = 0;
  };
  card.addEventListener('pointerenter', play);
  card.addEventListener('focusin', play);
  card.addEventListener('pointerleave', pause);
  card.addEventListener('focusout', pause);
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createLabelTexture(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(6,7,19,.72)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, 22, 34, 468, 104, 22);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = '700 34px JetBrains Mono, monospace';
  ctx.letterSpacing = '6px';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), 256, 86);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function createPortfolioWorld(canvas) {
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060713, 0.038);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  camera.position.set(0, 4.6, 11);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.75));
  renderer.setClearColor(0x060713, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = new THREE.Group();
  world.position.x = window.innerWidth > 980 ? 2.15 : 0;
  scene.add(world);

  const ambient = new THREE.AmbientLight(0xa8b9ff, 0.48);
  scene.add(ambient);
  const cyanLight = new THREE.PointLight(0x64ffe3, 2.2, 30);
  cyanLight.position.set(-4, 6, 5);
  scene.add(cyanLight);
  const pinkLight = new THREE.PointLight(0xff6fb6, 1.4, 24);
  pinkLight.position.set(5, 4, -4);
  scene.add(pinkLight);
  const blueLight = new THREE.DirectionalLight(0x75a7ff, 0.72);
  blueLight.position.set(2, 8, 6);
  scene.add(blueLight);

  const grid = new THREE.GridHelper(42, 42, 0x64ffe3, 0x1b2a4b);
  grid.position.y = -0.04;
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  world.add(grid);

  const pathPoints = [
    new THREE.Vector3(-8, 0.06, 7),
    new THREE.Vector3(-4, 0.08, 3.5),
    new THREE.Vector3(0, 0.08, 1.5),
    new THREE.Vector3(4.5, 0.08, -1.4),
    new THREE.Vector3(1.4, 0.08, -5.6),
    new THREE.Vector3(-4.5, 0.08, -8.1),
    new THREE.Vector3(4.5, 0.08, -11.5),
    new THREE.Vector3(0, 0.08, -15)
  ];
  const route = new THREE.CatmullRomCurve3(pathPoints);
  route.curveType = 'catmullrom';
  route.tension = 0.48;
  const tube = new THREE.TubeGeometry(route, 220, 0.035, 8, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x64ffe3, transparent: true, opacity: 0.82 });
  const routeMesh = new THREE.Mesh(tube, tubeMat);
  world.add(routeMesh);

  const laneMat = new THREE.LineBasicMaterial({ color: 0xff6fb6, transparent: true, opacity: 0.26 });
  [-0.42, 0.42].forEach(offset => {
    const shifted = pathPoints.map(point => new THREE.Vector3(point.x + offset, point.y + 0.01, point.z));
    const lane = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(shifted).getPoints(220)), laneMat);
    world.add(lane);
  });

  const rover = new THREE.Group();
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0x101a34, emissive: 0x07142c, shininess: 80 });
  const cyanMat = new THREE.MeshBasicMaterial({ color: 0x64ffe3 });
  const pinkMat = new THREE.MeshBasicMaterial({ color: 0xff6fb6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.28, 1.55), bodyMat);
  body.position.y = 0.38;
  rover.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.32, 0.72), new THREE.MeshPhongMaterial({
    color: 0x75a7ff,
    emissive: 0x13265a,
    transparent: true,
    opacity: 0.82,
    shininess: 90
  }));
  cabin.position.set(0, 0.68, -0.08);
  rover.add(cabin);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.68, 4), cyanMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.42, -0.96);
  rover.add(nose);
  const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.16, 18);
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x070a14, emissive: 0x041414 });
  [[-.58, .24, -.48], [.58, .24, -.48], [-.58, .24, .48], [.58, .24, .48]].forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos[0], pos[1], pos[2]);
    rover.add(wheel);
  });
  const headLeft = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), cyanMat);
  const headRight = headLeft.clone();
  headLeft.position.set(-0.3, 0.42, -0.82);
  headRight.position.set(0.3, 0.42, -0.82);
  rover.add(headLeft, headRight);
  world.add(rover);

  const stationData = [
    { label: 'Lab', color: 0x64ffe3, t: 0.18, side: -1 },
    { label: 'Track', color: 0x75a7ff, t: 0.35, side: 1 },
    { label: 'Missions', color: 0xff6fb6, t: 0.54, side: -1 },
    { label: 'Archive', color: 0xd8ff6b, t: 0.72, side: 1 },
    { label: 'Contact', color: 0xffc866, t: 0.9, side: -1 }
  ];
  const stationMeshes = [];
  stationData.forEach(station => {
    const pos = route.getPointAt(station.t);
    const tangent = route.getTangentAt(station.t).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(station.side * 1.55);
    const group = new THREE.Group();
    group.position.copy(pos).add(normal);
    group.position.y = 0.95;
    const slab = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.82, 0.16), new THREE.MeshPhongMaterial({
      color: station.color,
      emissive: station.color,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.68
    }));
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(slab.geometry),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 })
    );
    slab.add(wire);
    group.add(slab);
    const label = new THREE.Sprite(new THREE.SpriteMaterial({
      map: createLabelTexture(station.label, `#${station.color.toString(16).padStart(6, '0')}`),
      transparent: true,
      depthWrite: false
    }));
    label.scale.set(1.6, 0.6, 1);
    label.position.set(0, 1.35, 0);
    group.add(label);
    world.add(group);
    stationMeshes.push(group);
  });

  const blockMat = new THREE.MeshPhongMaterial({ color: 0x111b36, emissive: 0x061224, transparent: true, opacity: 0.58 });
  for (let i = 0; i < 42; i++) {
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(0.32 + Math.random() * 0.62, 0.18 + Math.random() * 2.6, 0.32 + Math.random() * 0.62),
      blockMat.clone()
    );
    tower.position.set((Math.random() - 0.5) * 28, tower.geometry.parameters.height / 2, (Math.random() - 0.5) * 30 - 4);
    tower.material.emissiveIntensity = 0.05 + Math.random() * 0.08;
    world.add(tower);
  }

  const particleCount = window.innerWidth < 700 ? 300 : 900;
  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particles[i * 3] = (Math.random() - 0.5) * 36;
    particles[i * 3 + 1] = Math.random() * 9 + 0.5;
    particles[i * 3 + 2] = (Math.random() - 0.5) * 34 - 4;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
  const particleCloud = new THREE.Points(particleGeo, new THREE.PointsMaterial({
    color: 0x64ffe3,
    size: window.innerWidth < 700 ? 0.035 : 0.025,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
  }));
  world.add(particleCloud);

  const keys = new Set();
  let pointerX = 0;
  let pointerY = 0;
  let driveBias = 0;
  let lateral = 0;
  let currentProgress = 0;
  window.addEventListener('keydown', event => {
    if (/^(Arrow|KeyW|KeyA|KeyS|KeyD)/.test(event.code)) keys.add(event.code);
  });
  window.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('pointermove', event => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    world.position.x = w > 980 ? 2.15 : 0;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let active = true;
  document.addEventListener('visibilitychange', () => { active = !document.hidden; });
  const cameraTarget = new THREE.Vector3();
  const cameraPos = new THREE.Vector3();
  const roverPos = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();

  function render(time = 0) {
    if (!REDUCED_MOTION) requestAnimationFrame(render);
    if (!active) return;
    const t = time * 0.001;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = clamp(window.scrollY / maxScroll, 0, 1);

    if (keys.has('KeyW') || keys.has('ArrowUp')) driveBias += 0.0028;
    if (keys.has('KeyS') || keys.has('ArrowDown')) driveBias -= 0.0028;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) lateral -= 0.018;
    if (keys.has('KeyD') || keys.has('ArrowRight')) lateral += 0.018;
    driveBias *= 0.965;
    lateral *= 0.9;

    const targetProgress = clamp(scrollProgress + driveBias, 0, 0.995);
    currentProgress += (targetProgress - currentProgress) * 0.055;
    const pos = route.getPointAt(currentProgress);
    const tangent = route.getTangentAt(currentProgress).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    roverPos.copy(pos).add(normal.multiplyScalar(clamp(lateral, -0.8, 0.8)));
    roverPos.y += 0.14 + Math.sin(t * 3.1) * 0.035;
    rover.position.lerp(roverPos, 0.18);
    const angle = Math.atan2(tangent.x, tangent.z);
    rover.rotation.y += (angle - rover.rotation.y) * 0.15;
    rover.rotation.z = -lateral * 0.18;
    rover.rotation.x = Math.sin(t * 4) * 0.02;
    rover.children.forEach(child => {
      if (child.geometry && child.geometry.type === 'CylinderGeometry') child.rotation.x += 0.14;
    });

    stationMeshes.forEach((station, i) => {
      station.rotation.y = Math.sin(t * 0.35 + i) * 0.2;
      station.position.y += Math.sin(t * 1.2 + i) * 0.0018;
    });
    routeMesh.material.opacity = 0.62 + Math.sin(t * 1.5) * 0.12;
    particleCloud.rotation.y = t * 0.018;

    lookTarget.copy(rover.position).add(new THREE.Vector3(pointerX * 0.55, 0.7 - pointerY * 0.25, -1.6));
    cameraPos.copy(rover.position).add(new THREE.Vector3(-pointerX * 0.45, 4.15 - pointerY * 0.25, 8.2));
    if (window.innerWidth > 980 && currentProgress < 0.18) {
      cameraPos.x += -1.6;
      lookTarget.x += 0.7;
    }
    camera.position.lerp(cameraPos, 0.055);
    cameraTarget.lerp(lookTarget, 0.07);
    camera.lookAt(cameraTarget);

    renderer.render(scene, camera);
  }

  if (REDUCED_MOTION) render(0);
  else requestAnimationFrame(render);
}

createPortfolioWorld(document.getElementById('world-canvas'));
