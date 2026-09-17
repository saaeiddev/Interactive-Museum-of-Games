import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileQuery = window.matchMedia('(max-width: 760px)');
const lowMemory = (navigator.deviceMemory || 8) <= 4;
const instances = [];

function roundedRectGeometry(width, height, depth, radius = 0.1, bevel = 0.035) {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 10,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function roundedMesh(width, height, depth, radius, material, bevel = 0.035) {
  const mesh = new THREE.Mesh(roundedRectGeometry(width, height, depth, radius, bevel), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function box(width, height, depth, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function cylinder(radius, height, material, x = 0, y = 0, z = 0, segments = 40) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function torus(radius, tube, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 48), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

function material(color, roughness = 0.5, metalness = 0, extras = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness, metalness, ...extras });
}

function screenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 272;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 512, 272);
  gradient.addColorStop(0, '#07111f');
  gradient.addColorStop(0.45, '#17355c');
  gradient.addColorStop(1, '#05080d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 272);
  ctx.fillStyle = 'rgba(90,180,255,.18)';
  ctx.fillRect(0, 0, 512, 2);
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(220, 0);
  ctx.lineTo(105, 272);
  ctx.lineTo(0, 272);
  ctx.closePath();
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function addTinyVents(group, startX, count, spacing, y, z, width, depth, mat) {
  for (let i = 0; i < count; i += 1) {
    group.add(box(width, 0.018, depth, mat, startX + i * spacing, y, z));
  }
}

function buildPS1() {
  const group = new THREE.Group();
  const shell = material(0xbabbb7, 0.64, 0.03, { clearcoat: 0.1, clearcoatRoughness: 0.7 });
  const shellDark = material(0x8b8d89, 0.72, 0.02);
  const black = material(0x141515, 0.82, 0.02);
  const groove = material(0x6e706d, 0.78, 0.02);
  const buttonMat = material(0xc9cac6, 0.55, 0.02, { clearcoat: 0.12 });

  const lower = roundedMesh(3.7, 0.38, 2.85, 0.13, shellDark, 0.045);
  lower.position.y = 0.28;
  group.add(lower);

  const body = roundedMesh(3.62, 0.58, 2.74, 0.14, shell, 0.055);
  body.position.y = 0.62;
  group.add(body);

  const lid = cylinder(0.95, 0.075, shell, 0, 0.95, -0.08, 72);
  group.add(lid);
  group.add(torus(0.95, 0.022, groove, 0, 0.99, -0.08));
  group.add(torus(0.73, 0.012, material(0xd9dad5, 0.6), 0, 1.005, -0.08));

  const power = cylinder(0.23, 0.08, buttonMat, -1.38, 0.94, -0.55, 40);
  const open = cylinder(0.23, 0.08, buttonMat, 1.38, 0.94, -0.55, 40);
  group.add(power, open);
  group.add(torus(0.145, 0.025, material(0x6d6f6b, 0.7), -1.38, 0.985, -0.55));
  group.add(box(0.19, 0.035, 0.03, material(0x6d6f6b, 0.7), 1.38, 1.015, -0.55));

  const frontZ = 1.395;
  [-0.74, 0.74].forEach(x => {
    const recess = roundedMesh(1.12, 0.28, 0.09, 0.035, black, 0.012);
    recess.position.set(x, 0.52, frontZ);
    group.add(recess);
    group.add(box(0.72, 0.035, 0.025, material(0x343635, 0.8), x, 0.55, 1.45));
    group.add(box(0.72, 0.035, 0.025, material(0x343635, 0.8), x, 0.47, 1.45));
  });

  addTinyVents(group, -1.44, 8, 0.15, 0.93, -1.24, 0.075, 0.32, groove);
  addTinyVents(group, 0.39, 8, 0.15, 0.93, -1.24, 0.075, 0.32, groove);

  const logo = roundedMesh(0.38, 0.08, 0.025, 0.02, material(0x6b6d69, 0.62), 0.008);
  logo.position.set(0, 1.02, 0.07);
  group.add(logo);

  [[-1.45, -1.06], [1.45, -1.06], [-1.45, 1.06], [1.45, 1.06]].forEach(([x, z]) => {
    group.add(cylinder(0.13, 0.08, black, x, 0.05, z, 28));
  });

  group.rotation.y = -0.18;
  return group;
}

function buildNES() {
  const group = new THREE.Group();
  const light = material(0xc9c9c2, 0.72, 0.015);
  const lightTop = material(0xd7d7d1, 0.68, 0.015);
  const dark = material(0x333534, 0.8, 0.015);
  const black = material(0x141616, 0.84, 0.01);
  const red = material(0x8f171b, 0.56, 0.03, { clearcoat: 0.14 });

  const base = roundedMesh(3.9, 0.48, 2.8, 0.1, light, 0.035);
  base.position.y = 0.3;
  group.add(base);

  const upper = roundedMesh(3.78, 0.56, 2.65, 0.09, lightTop, 0.035);
  upper.position.y = 0.7;
  group.add(upper);

  const topPanel = roundedMesh(2.8, 0.08, 1.5, 0.055, material(0x9b9d99, 0.76), 0.015);
  topPanel.position.set(-0.1, 1.01, -0.26);
  group.add(topPanel);

  const cartridgeDoor = roundedMesh(2.25, 0.055, 0.88, 0.035, material(0x777976, 0.78), 0.01);
  cartridgeDoor.position.set(-0.14, 1.075, -0.18);
  group.add(cartridgeDoor);
  const doorSlot = roundedMesh(1.85, 0.025, 0.2, 0.018, black, 0.006);
  doorSlot.position.set(-0.14, 1.11, 0.07);
  group.add(doorSlot);

  const frontZ = 1.39;
  group.add(box(3.55, 0.28, 0.08, dark, 0, 0.42, frontZ));
  group.add(box(3.55, 0.075, 0.085, black, 0, 0.58, frontZ + 0.01));
  group.add(box(3.55, 0.04, 0.09, red, 0, 0.30, frontZ + 0.012));

  [-0.75, 0.45].forEach(x => {
    const port = roundedMesh(0.72, 0.24, 0.08, 0.04, black, 0.01);
    port.position.set(x, 0.43, 1.46);
    group.add(port);
    group.add(box(0.45, 0.03, 0.02, material(0x555856, 0.83), x, 0.45, 1.51));
  });

  const power = roundedMesh(0.42, 0.20, 0.08, 0.025, dark, 0.008);
  power.position.set(1.42, 0.43, 1.47);
  group.add(power);
  const reset = roundedMesh(0.34, 0.16, 0.08, 0.025, light, 0.008);
  reset.position.set(1.03, 0.43, 1.47);
  group.add(reset);

  addTinyVents(group, -1.52, 11, 0.18, 1.04, -1.08, 0.085, 0.42, dark);
  addTinyVents(group, 0.48, 6, 0.18, 1.04, -1.08, 0.085, 0.42, dark);

  [[-1.5, -1.0], [1.5, -1.0], [-1.5, 1.0], [1.5, 1.0]].forEach(([x, z]) => {
    group.add(cylinder(0.12, 0.08, black, x, 0.04, z, 28));
  });

  group.rotation.y = 0.18;
  return group;
}

function buildPSP() {
  const group = new THREE.Group();
  const black = material(0x07090c, 0.22, 0.1, { clearcoat: 0.95, clearcoatRoughness: 0.12 });
  const edge = material(0x2c3036, 0.3, 0.28, { clearcoat: 0.75, clearcoatRoughness: 0.15 });
  const rubber = material(0x181b20, 0.82, 0.01);
  const silver = material(0x8d949d, 0.34, 0.72);

  const body = roundedMesh(4.55, 1.86, 0.34, 0.42, black, 0.06);
  body.position.y = 1.15;
  group.add(body);

  const rim = roundedMesh(4.38, 1.72, 0.08, 0.36, edge, 0.035);
  rim.position.set(0, 1.15, 0.20);
  group.add(rim);

  const screenMat = material(0x0b1622, 0.06, 0.02, {
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    emissive: 0x0b1b30,
    emissiveIntensity: 0.48,
  });
  screenMat.map = screenTexture();
  const screen = roundedMesh(2.55, 1.36, 0.055, 0.08, screenMat, 0.018);
  screen.position.set(0, 1.15, 0.29);
  group.add(screen);

  const dpadH = roundedMesh(0.68, 0.22, 0.09, 0.055, rubber, 0.015);
  dpadH.position.set(-1.72, 1.25, 0.31);
  const dpadV = roundedMesh(0.22, 0.68, 0.09, 0.055, rubber, 0.015);
  dpadV.position.set(-1.72, 1.25, 0.31);
  group.add(dpadH, dpadV);

  const analog = cylinder(0.23, 0.10, rubber, -1.62, 0.67, 0.31, 40);
  analog.rotation.x = Math.PI / 2;
  group.add(analog);
  group.add(torus(0.15, 0.018, silver, -1.62, 0.67, 0.37));

  const facePositions = [
    [1.75, 1.53], [2.03, 1.25], [1.75, 0.97], [1.47, 1.25],
  ];
  facePositions.forEach(([x, y], i) => {
    const button = cylinder(0.13, 0.075, material(i % 2 ? 0x22262b : 0x2d3137, 0.32, 0.08, { clearcoat: 0.7 }), x, y, 0.31, 32);
    button.rotation.x = Math.PI / 2;
    group.add(button);
  });

  [-0.38, 0.38].forEach(x => {
    const mini = roundedMesh(0.34, 0.10, 0.05, 0.045, rubber, 0.01);
    mini.position.set(x, 0.46, 0.31);
    group.add(mini);
  });

  [-1.14, 1.14].forEach(x => {
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const hole = cylinder(0.035, 0.028, rubber, x + (col - 1) * 0.11, 0.60 + row * 0.11, 0.33, 16);
        hole.rotation.x = Math.PI / 2;
        group.add(hole);
      }
    }
  });

  const logoBar = roundedMesh(0.42, 0.07, 0.035, 0.02, silver, 0.008);
  logoBar.position.set(0, 0.48, 0.33);
  group.add(logoBar);

  const shoulderL = roundedMesh(1.0, 0.17, 0.28, 0.07, edge, 0.025);
  shoulderL.position.set(-1.72, 2.02, 0);
  const shoulderR = shoulderL.clone();
  shoulderR.position.x = 1.72;
  group.add(shoulderL, shoulderR);

  group.rotation.x = -0.12;
  group.rotation.y = -0.1;
  group.position.y = -0.25;
  return group;
}

function makePedestal(scene) {
  const baseMat = material(0x101722, 0.58, 0.55);
  const trimMat = material(0xb88a4b, 0.32, 0.78);
  const base = cylinder(2.45, 0.18, baseMat, 0, 0.03, 0, 72);
  const top = cylinder(2.16, 0.10, trimMat, 0, 0.15, 0, 72);
  scene.add(base, top);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.8, 64),
    new THREE.MeshPhysicalMaterial({ color: 0x09101a, roughness: 0.86, metalness: 0.08 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.07;
  ground.receiveShadow = true;
  scene.add(ground);
}

function addMuseumLights(scene) {
  scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x08111d, 1.55));

  const key = new THREE.SpotLight(0xffe1bc, 55, 15, Math.PI / 5, 0.55, 1.5);
  key.position.set(3.5, 6.5, 4.5);
  key.target.position.set(0, 0.8, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(512, 512);
  key.shadow.bias = -0.0002;
  scene.add(key, key.target);

  const fill = new THREE.PointLight(0x77aee8, 15, 10, 1.8);
  fill.position.set(-3.6, 2.8, 2.4);
  scene.add(fill);

  const rim = new THREE.PointLight(0xf2b766, 11, 9, 1.8);
  rim.position.set(2.8, 2.2, -3.4);
  scene.add(rim);
}

function createViewport(element, type) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !(mobileQuery.matches || lowMemory),
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileQuery.matches ? 1.15 : 1.55));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.setAttribute('tabindex', '-1');
  element.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = null;
  addMuseumLights(scene);
  makePedestal(scene);

  const camera = new THREE.PerspectiveCamera(type === 'psp' ? 35 : 38, 1, 0.1, 30);
  camera.position.set(type === 'psp' ? 0.2 : 3.2, type === 'psp' ? 2.2 : 2.55, type === 'psp' ? 7.0 : 6.4);
  camera.lookAt(0, type === 'psp' ? 1.0 : 0.62, 0);

  const model = type === 'ps1' ? buildPS1() : type === 'nes' ? buildNES() : buildPSP();
  scene.add(model);

  const state = {
    element,
    renderer,
    scene,
    camera,
    model,
    visible: true,
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    currentX: model.rotation.x,
    currentY: model.rotation.y,
    targetX: model.rotation.x,
    targetY: model.rotation.y,
    lastInteraction: performance.now(),
  };

  function resize() {
    const width = Math.max(1, Math.round(element.clientWidth));
    const height = Math.max(1, Math.round(element.clientHeight));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(element);
  resize();

  element.addEventListener('pointerdown', event => {
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.lastInteraction = performance.now();
    element.setPointerCapture?.(event.pointerId);
    element.classList.add('is-dragging');
  });

  element.addEventListener('pointermove', event => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    state.targetY += dx * 0.009;
    state.targetX = THREE.MathUtils.clamp(state.targetX + dy * 0.006, -0.42, 0.42);
    state.lastInteraction = performance.now();
  });

  const endDrag = event => {
    if (event?.pointerId != null && state.pointerId != null && event.pointerId !== state.pointerId) return;
    state.dragging = false;
    state.pointerId = null;
    state.lastInteraction = performance.now();
    element.classList.remove('is-dragging');
  };
  element.addEventListener('pointerup', endDrag);
  element.addEventListener('pointercancel', endDrag);
  element.addEventListener('lostpointercapture', endDrag);

  const card = element.closest('[data-console-card]');
  card?.addEventListener('keydown', event => {
    const step = 0.16;
    if (event.key === 'ArrowLeft') state.targetY -= step;
    else if (event.key === 'ArrowRight') state.targetY += step;
    else if (event.key === 'ArrowUp') state.targetX = THREE.MathUtils.clamp(state.targetX - step * 0.55, -0.42, 0.42);
    else if (event.key === 'ArrowDown') state.targetX = THREE.MathUtils.clamp(state.targetX + step * 0.55, -0.42, 0.42);
    else return;
    state.lastInteraction = performance.now();
    event.preventDefault();
  });

  if ('IntersectionObserver' in window) {
    const visibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === element) state.visible = entry.isIntersecting;
      });
    }, { threshold: 0.04 });
    visibilityObserver.observe(element);
  }

  instances.push(state);
}

function animate(now) {
  requestAnimationFrame(animate);
  const idleDelay = 1500;

  instances.forEach(state => {
    if (!state.visible) return;

    if (!reducedMotion.matches && !state.dragging && now - state.lastInteraction > idleDelay) {
      state.targetY += 0.00155;
      state.targetX += (0 - state.targetX) * 0.006;
    }

    state.currentX += (state.targetX - state.currentX) * 0.085;
    state.currentY += (state.targetY - state.currentY) * 0.085;
    state.model.rotation.x = state.currentX;
    state.model.rotation.y = state.currentY;
    state.renderer.render(state.scene, state.camera);
  });
}

function initConsoleViewports() {
  document.querySelectorAll('.console-viewport[data-console-model]').forEach(viewport => {
    if (viewport.dataset.webglReady === 'true') return;
    viewport.dataset.webglReady = 'true';
    try {
      createViewport(viewport, viewport.dataset.consoleModel);
      viewport.classList.add('is-ready');
    } catch (error) {
      console.error('Console 3D viewport failed:', error);
      viewport.classList.add('has-fallback');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConsoleViewports, { once: true });
} else {
  initConsoleViewports();
}

document.addEventListener('console-gallery-ready', initConsoleViewports);
requestAnimationFrame(animate);
