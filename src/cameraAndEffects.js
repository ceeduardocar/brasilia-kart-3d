/**
 * Brasília Kart 3D — Eixo Monumental Edition
 * Interactive 3D Drone Camera, 360° Mouse/Touch Free-Look, Street-Level Convertible Vista,
 * Cerrado Golden Dust & High-Speed Wind Lines, Procedural Sun/Sunset God-Ray Corona,
 * and Guided 3D Architectural Tour Sequencer ("Tour Guiado 3D Automático por Brasília").
 */

import { LANDMARKS, MINISTRIES } from './trackData.js';

/**
 * Generates a soft radial glow texture on an offscreen HTML5 canvas
 * for lens flares, sun corona halos, and dust motes.
 */
function createRadialGlowTexture(THREE, innerColor, midColor, outerColor = 'rgba(0,0,0,0)', size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0.0, innerColor);
  grad.addColorStop(0.38, midColor);
  grad.addColorStop(1.0, outerColor);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a procedural starburst / god-ray corona texture for the Brasília sun & sunset halo.
 */
function createSunCoronaTexture(THREE, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Base warm halo
  const baseGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, cx);
  baseGrad.addColorStop(0.0, 'rgba(255, 252, 235, 1.0)');
  baseGrad.addColorStop(0.18, 'rgba(253, 224, 71, 0.85)');
  baseGrad.addColorStop(0.45, 'rgba(249, 115, 22, 0.35)');
  baseGrad.addColorStop(0.78, 'rgba(234, 88, 12, 0.08)');
  baseGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // Architectural Niemeyer-inspired 16-ray starburst (echoing Cathedral of Brasília's 16 columns)
  ctx.save();
  ctx.translate(cx, cy);
  const numRays = 16;
  for (let i = 0; i < numRays; i++) {
    const angle = (i / numRays) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);

    const rayGrad = ctx.createLinearGradient(0, 0, cx * 0.96, 0);
    rayGrad.addColorStop(0.0, 'rgba(255, 255, 240, 0.55)');
    rayGrad.addColorStop(0.35, 'rgba(250, 204, 21, 0.25)');
    rayGrad.addColorStop(1.0, 'rgba(250, 204, 21, 0.0)');

    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(0, -3.5);
    ctx.lineTo(cx * 0.96, 0);
    ctx.lineTo(0, 3.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a floating 3D label banner sprite for the Guided Architectural Tour spotlight.
 */
function createTourBannerTexture(THREE, titleText, subtitleText, accentHex = '#facc15') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  // Glassmorphic pill background
  ctx.fillStyle = 'rgba(10, 18, 34, 0.86)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(14, 16, 612, 128, 32);
  } else {
    ctx.rect(14, 16, 612, 128);
  }
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = accentHex;
  ctx.stroke();

  // Top badge
  ctx.fillStyle = accentHex;
  ctx.font = '800 20px "Outfit", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏛️ TOUR ARQUITETÔNICO 3D • BRASÍLIA', 320, 52);

  // Main monument title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px "Outfit", "Inter", sans-serif';
  ctx.fillText(titleText.slice(0, 34), 320, 92);

  // Subtitle
  ctx.fillStyle = '#93c5fd';
  ctx.font = '700 20px "Outfit", "Inter", sans-serif';
  ctx.fillText((subtitleText || '').slice(0, 48), 320, 124);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Main Factory: Creates the Interactive 3D Camera Controller, Atmospheric Particle Systems,
 * Procedural Brasília Sun/Sunset God-Ray Halo, and Guided Architectural Tour Sequencer.
 */
export function createImmersionCameraAndEffects(THREE, renderer, scene, camera, canvas) {
  const domElement = canvas || (renderer && renderer.domElement) || window;

  // ============================================================================
  // 1. CAMERA & INTERACTIVE 360° FREE-LOOK / DRONE ORBIT STATE
  // ============================================================================
  let cameraMode = 'chase'; // 'chase' | 'cockpit' | 'convertible' | 'helicopter' | 'monument'
  let timeOfDay = 'day'; // 'day' | 'sunset' | 'night'
  let activeLandmark = LANDMARKS[0];

  const smoothCamPos = new THREE.Vector3(-1390, 12, 66);
  const smoothCamLook = new THREE.Vector3(-1320, 7, 66);

  // Interactive Mouse/Touch 360° Orbit & Zoom state
  const orbitState = {
    isDragging: false,
    isPanning: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    // User manual angular offsets (radians)
    yawOffset: 0,
    pitchOffset: 0,
    // Smoothly interpolated angular offsets
    smoothYaw: 0,
    smoothPitch: 0,
    // Zoom multiplier for chase/cockpit/monument and explicit altitude for helicopter
    zoomDistanceScale: 1.0,
    helicopterAltitude: 165, // Clamp 45m .. 850m
    helicopterOrbitYaw: 0,
    helicopterPitch: 0.45,
    // Free 3D Map panning offset in Helicopter mode (WASD / Arrows / Right-drag)
    dronePanOffset: new THREE.Vector3(0, 0, 0),
    // Time since user last dragged/scrolled so we recenter after 2.5s while driving
    idleTimer: 99,
    recenterDelay: 2.5,
    autoOrbitAngle: 0
  };

  // Panning keys for Helicopter 3D Map mode
  const panKeys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  };

  // Pointer / Mouse / Touch Event Handlers for 360° Free-Look & Orbit
  function onPointerDown(e) {
    // Ignore clicks on UI buttons if event came from window
    if (e.target && domElement !== window && e.target !== domElement) return;
    orbitState.isDragging = true;
    orbitState.isPanning = e.button === 2 || e.button === 1 || e.shiftKey;
    orbitState.pointerId = e.pointerId;
    orbitState.lastX = e.clientX;
    orbitState.lastY = e.clientY;
    orbitState.idleTimer = 0;
  }

  function onPointerMove(e) {
    if (!orbitState.isDragging) return;
    const dx = e.clientX - orbitState.lastX;
    const dy = e.clientY - orbitState.lastY;
    orbitState.lastX = e.clientX;
    orbitState.lastY = e.clientY;
    orbitState.idleTimer = 0;

    if (cameraMode === 'helicopter' && orbitState.isPanning) {
      // Pan across the 3D Map of Brasília proportional to altitude
      const panScale = Math.max(0.25, orbitState.helicopterAltitude * 0.0032);
      const cosY = Math.cos(orbitState.helicopterOrbitYaw);
      const sinY = Math.sin(orbitState.helicopterOrbitYaw);
      orbitState.dronePanOffset.x -= (dx * cosY + dy * sinY) * panScale;
      orbitState.dronePanOffset.z -= (-dx * sinY + dy * cosY) * panScale;
      orbitState.dronePanOffset.x = Math.max(-1750, Math.min(1750, orbitState.dronePanOffset.x));
      orbitState.dronePanOffset.z = Math.max(-950, Math.min(950, orbitState.dronePanOffset.z));
      return;
    }

    const sensitivity = cameraMode === 'cockpit' ? 0.0048 : 0.0062;
    orbitState.yawOffset -= dx * sensitivity;

    if (cameraMode === 'helicopter') {
      orbitState.helicopterOrbitYaw -= dx * 0.0065;
      orbitState.helicopterPitch = Math.max(
        0.15,
        Math.min(1.38, orbitState.helicopterPitch + dy * 0.005)
      );
    } else {
      // Allow looking up at towering monuments (224m TV Tower, 28-story Congress)
      orbitState.pitchOffset = Math.max(
        -0.42,
        Math.min(0.85, orbitState.pitchOffset + dy * sensitivity * 0.85)
      );
    }
  }

  function onPointerUp() {
    if (!orbitState.isDragging) return;
    orbitState.isDragging = false;
    orbitState.isPanning = false;
    orbitState.idleTimer = 0;
  }

  function onWheel(e) {
    if (e.target && domElement !== window && e.target !== domElement) return;
    const delta = Math.sign(e.deltaY);
    orbitState.idleTimer = 0;

    if (cameraMode === 'helicopter') {
      // Smooth zoom from altitude = 45m (architectural close-up) to 850m (full Avião Plano Piloto)
      const step = Math.max(14, orbitState.helicopterAltitude * 0.12);
      orbitState.helicopterAltitude = Math.max(
        45,
        Math.min(850, orbitState.helicopterAltitude + delta * step)
      );
    } else {
      orbitState.zoomDistanceScale = Math.max(
        0.48,
        Math.min(2.35, orbitState.zoomDistanceScale + delta * 0.11)
      );
    }
  }

  // Touch fallback for single-finger 360° look and two-finger pinch zoom
  let lastPinchDist = 0;
  function onTouchStart(e) {
    if (e.touches.length === 1) {
      orbitState.isDragging = true;
      orbitState.lastX = e.touches[0].clientX;
      orbitState.lastY = e.touches[0].clientY;
      orbitState.idleTimer = 0;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist = Math.hypot(dx, dy);
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 1 && orbitState.isDragging) {
      const t = e.touches[0];
      const dx = t.clientX - orbitState.lastX;
      const dy = t.clientY - orbitState.lastY;
      orbitState.lastX = t.clientX;
      orbitState.lastY = t.clientY;
      orbitState.idleTimer = 0;

      const sensitivity = 0.006;
      orbitState.yawOffset -= dx * sensitivity;
      if (cameraMode === 'helicopter') {
        orbitState.helicopterOrbitYaw -= dx * 0.0065;
        orbitState.helicopterPitch = Math.max(
          0.15,
          Math.min(1.38, orbitState.helicopterPitch + dy * 0.005)
        );
      } else {
        orbitState.pitchOffset = Math.max(
          -0.42,
          Math.min(0.85, orbitState.pitchOffset + dy * sensitivity * 0.85)
        );
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist > 0) {
        const diff = lastPinchDist - dist;
        if (cameraMode === 'helicopter') {
          orbitState.helicopterAltitude = Math.max(
            45,
            Math.min(850, orbitState.helicopterAltitude + diff * 1.2)
          );
        } else {
          orbitState.zoomDistanceScale = Math.max(
            0.48,
            Math.min(2.35, orbitState.zoomDistanceScale + diff * 0.004)
          );
        }
      }
      lastPinchDist = dist;
      orbitState.idleTimer = 0;
    }
  }

  function onTouchEnd() {
    orbitState.isDragging = false;
    lastPinchDist = 0;
    orbitState.idleTimer = 0;
  }

  function onKeyDown(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.code === 'KeyW' || e.code === 'ArrowUp') panKeys.forward = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') panKeys.backward = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') panKeys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') panKeys.right = true;
    if (e.code === 'KeyQ' || e.code === 'PageUp') panKeys.up = true;
    if (e.code === 'KeyE' || e.code === 'PageDown') panKeys.down = true;
  }

  function onKeyUp(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') panKeys.forward = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') panKeys.backward = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') panKeys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') panKeys.right = false;
    if (e.code === 'KeyQ' || e.code === 'PageUp') panKeys.up = false;
    if (e.code === 'KeyE' || e.code === 'PageDown') panKeys.down = false;
  }

  function onContextMenu(e) {
    if (cameraMode === 'helicopter') {
      e.preventDefault();
    }
  }

  if (domElement && domElement.addEventListener) {
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: true });
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    domElement.addEventListener('touchmove', onTouchMove, { passive: true });
    domElement.addEventListener('touchend', onTouchEnd, { passive: true });
    domElement.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  // ============================================================================
  // 2. PROCEDURAL 3D BRASÍLIA SUN / SUNSET HALO & GOD-RAY CORONA
  // ============================================================================
  const sunHaloGroup = new THREE.Group();
  sunHaloGroup.name = 'BrasiliaAtmosphericSunHalo';
  scene.add(sunHaloGroup);

  const coronaTex = createSunCoronaTexture(THREE, 512);
  const softGlowTex = createRadialGlowTexture(
    THREE,
    'rgba(255, 250, 220, 1.0)',
    'rgba(251, 146, 60, 0.45)',
    'rgba(251, 146, 60, 0.0)',
    256
  );
  const lensGhostTex = createRadialGlowTexture(
    THREE,
    'rgba(253, 224, 71, 0.55)',
    'rgba(56, 189, 248, 0.25)',
    'rgba(0, 0, 0, 0.0)',
    128
  );

  // Inner bright solar core sprite
  const sunCoreMat = new THREE.SpriteMaterial({
    map: softGlowTex,
    color: 0xfffbeb,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const sunCoreSprite = new THREE.Sprite(sunCoreMat);
  sunCoreSprite.scale.set(280, 280, 1);
  sunHaloGroup.add(sunCoreSprite);

  // 16-Ray Niemeyer God-Ray Corona Sprite
  const sunCoronaMat = new THREE.SpriteMaterial({
    map: coronaTex,
    color: 0xfde047,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const sunCoronaSprite = new THREE.Sprite(sunCoronaMat);
  sunCoronaSprite.scale.set(680, 680, 1);
  sunHaloGroup.add(sunCoronaSprite);

  // Outer Cerrado Horizon Warm Atmospheric Scatter Halo
  const horizonHaloMat = new THREE.SpriteMaterial({
    map: softGlowTex,
    color: 0xf97316,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const horizonHaloSprite = new THREE.Sprite(horizonHaloMat);
  horizonHaloSprite.scale.set(1250, 740, 1);
  sunHaloGroup.add(horizonHaloSprite);

  // Dynamic 3D Lens Flare Ghosts that align between the Sun and the Camera look vector
  const flareGhosts = [];
  const ghostConfigs = [
    { factor: 0.35, scale: 42, color: 0xfef08a, opacity: 0.28 },
    { factor: 0.62, scale: 78, color: 0xf97316, opacity: 0.22 },
    { factor: 0.85, scale: 34, color: 0x38bdf8, opacity: 0.24 },
    { factor: 1.15, scale: 95, color: 0xfacc15, opacity: 0.18 }
  ];
  for (const cfg of ghostConfigs) {
    const mat = new THREE.SpriteMaterial({
      map: lensGhostTex,
      color: cfg.color,
      transparent: true,
      opacity: cfg.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(cfg.scale, cfg.scale, 1);
    sp.renderOrder = 15;
    scene.add(sp);
    flareGhosts.push({ sprite: sp, mat, cfg });
  }

  // Canonical sun/moon positions for Brasília's East-West Eixo Monumental axis
  const SUN_CONFIGS = {
    day: {
      position: new THREE.Vector3(650, 780, -520),
      coreColor: 0xfffef0,
      coronaColor: 0xfef08a,
      haloColor: 0x38bdf8,
      coreScale: 310,
      coronaScale: 720,
      haloOpacity: 0.35
    },
    sunset: {
      // Dramatic golden-amber sunset directly behind Praça do Cruzeiro / Memorial JK in the West!
      position: new THREE.Vector3(-1950, 260, -120),
      coreColor: 0xfff7ed,
      coronaColor: 0xfb923c,
      haloColor: 0xea580c,
      coreScale: 420,
      coronaScale: 980,
      haloOpacity: 0.78
    },
    night: {
      // Silver-blue Planalto full moon above Congresso Nacional & Lago Paranoá in the East
      position: new THREE.Vector3(1850, 520, -280),
      coreColor: 0xf8fafc,
      coronaColor: 0x93c5fd,
      haloColor: 0x3b82f6,
      coreScale: 210,
      coronaScale: 520,
      haloOpacity: 0.42
    }
  };

  function applySunTimeOfDay(tod) {
    const cfg = SUN_CONFIGS[tod] || SUN_CONFIGS.day;
    sunHaloGroup.position.copy(cfg.position);
    sunCoreMat.color.setHex(cfg.coreColor);
    sunCoronaMat.color.setHex(cfg.coronaColor);
    horizonHaloMat.color.setHex(cfg.haloColor);
    horizonHaloMat.opacity = cfg.haloOpacity;
    sunCoreSprite.scale.set(cfg.coreScale, cfg.coreScale, 1);
    sunCoronaSprite.scale.set(cfg.coronaScale, cfg.coronaScale, 1);
  }

  applySunTimeOfDay(timeOfDay);

  // ============================================================================
  // 3. CERRADO GOLDEN DUST MOTES & HIGH-SPEED AERODYNAMIC WIND STREAKS
  // ============================================================================
  const effectsGroup = new THREE.Group();
  effectsGroup.name = 'CameraAtmosphericEffects';
  scene.add(effectsGroup);

  // 3A. Floating Cerrado Golden Pollen / Sunset Embers / Night Fireflies around active camera
  const DUST_COUNT = 220;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustColors = new Float32Array(DUST_COUNT * 3);
  const dustSeeds = new Float32Array(DUST_COUNT * 4); // phase, speedX, speedY, speedZ

  const paletteDay = [new THREE.Color(0xfef08a), new THREE.Color(0xfde047), new THREE.Color(0xffffff)];
  const paletteSunset = [new THREE.Color(0xfdba74), new THREE.Color(0xf97316), new THREE.Color(0xfde047)];
  const paletteNight = [new THREE.Color(0x38bdf8), new THREE.Color(0xfacc15), new THREE.Color(0x4ade80)];

  for (let i = 0; i < DUST_COUNT; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 90;
    dustPositions[i * 3 + 1] = Math.random() * 28 + 0.5;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 90;

    dustSeeds[i * 4] = Math.random() * Math.PI * 2;
    dustSeeds[i * 4 + 1] = (Math.random() - 0.5) * 1.8;
    dustSeeds[i * 4 + 2] = 0.35 + Math.random() * 0.9;
    dustSeeds[i * 4 + 3] = (Math.random() - 0.5) * 1.8;

    const c = paletteDay[i % paletteDay.length];
    dustColors[i * 3] = c.r;
    dustColors[i * 3 + 1] = c.g;
    dustColors[i * 3 + 2] = c.b;
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));

  const moteTex = createRadialGlowTexture(
    THREE,
    'rgba(255,255,255,1.0)',
    'rgba(255,240,180,0.6)',
    'rgba(255,240,180,0.0)',
    64
  );

  const dustMat = new THREE.PointsMaterial({
    size: 0.85,
    map: moteTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const dustPoints = new THREE.Points(dustGeo, dustMat);
  dustPoints.frustumCulled = false;
  effectsGroup.add(dustPoints);

  function updateDustColorsForTimeOfDay(tod) {
    const pal = tod === 'sunset' ? paletteSunset : tod === 'night' ? paletteNight : paletteDay;
    const colAttr = dustGeo.getAttribute('color');
    for (let i = 0; i < DUST_COUNT; i++) {
      const c = pal[i % pal.length];
      colAttr.array[i * 3] = c.r;
      colAttr.array[i * 3 + 1] = c.g;
      colAttr.array[i * 3 + 2] = c.b;
    }
    colAttr.needsUpdate = true;
    dustMat.size = tod === 'night' ? 1.1 : 0.88;
    dustMat.opacity = tod === 'night' ? 0.85 : 0.72;
  }

  // 3B. High-Speed Aerodynamic Wind Streaks (> 150 km/h or Turbo Boost / Pequi Dourado Star)
  const WIND_LINE_COUNT = 42;
  const windLinesGroup = new THREE.Group();
  effectsGroup.add(windLinesGroup);

  const windLineMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const windLineGeo = new THREE.CylinderGeometry(0.018, 0.06, 6.5, 6);
  windLineGeo.rotateX(Math.PI / 2);

  const windStreaks = [];
  for (let i = 0; i < WIND_LINE_COUNT; i++) {
    const angle = (i / WIND_LINE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
    const radius = 3.2 + Math.random() * 5.8;
    const mesh = new THREE.Mesh(windLineGeo, windLineMat);
    const zOffset = -6 - Math.random() * 24;
    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.68, zOffset);
    windLinesGroup.add(mesh);
    windStreaks.push({
      mesh,
      angle,
      radius,
      zOffset,
      speedMult: 0.85 + Math.random() * 0.65
    });
  }

  // ============================================================================
  // 4. GUIDED ARCHITECTURAL TOUR SEQUENCER ("TOUR GUIADO 3D AUTOMÁTICO")
  // ============================================================================
  const tourHighlightGroup = new THREE.Group();
  tourHighlightGroup.name = 'GuidedTourMonumentSpotlight';
  tourHighlightGroup.visible = false;
  scene.add(tourHighlightGroup);

  // Outer rotating glowing ground ring around the active monument/ministry
  const outerRingGeo = new THREE.RingGeometry(18, 22.5, 48);
  outerRingGeo.rotateX(-Math.PI / 2);
  const outerRingMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.68,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
  outerRingMesh.position.y = 0.25;
  tourHighlightGroup.add(outerRingMesh);

  // Inner pulsing concentric architectural ring
  const innerRingGeo = new THREE.RingGeometry(10, 12.2, 48);
  innerRingGeo.rotateX(-Math.PI / 2);
  const innerRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRingMesh.position.y = 0.3;
  tourHighlightGroup.add(innerRingMesh);

  // Vertical translucent architectural light beacon cylinder
  const beaconGeo = new THREE.CylinderGeometry(14, 18, 65, 32, 1, true);
  beaconGeo.translate(0, 32.5, 0);
  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.14,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
  tourHighlightGroup.add(beaconMesh);

  // Floating 3D Monument Info Banner Sprite above the highlighted building
  const initialBannerTex = createTourBannerTexture(
    THREE,
    LANDMARKS[0].name,
    `${LANDMARKS[0].architect} • ${LANDMARKS[0].year}`,
    LANDMARKS[0].color
  );
  const tourBannerMat = new THREE.SpriteMaterial({
    map: initialBannerTex,
    transparent: true,
    opacity: 0.95,
    depthTest: false
  });
  const tourBannerSprite = new THREE.Sprite(tourBannerMat);
  tourBannerSprite.scale.set(44, 11, 1);
  tourBannerSprite.position.set(0, 42, 0);
  tourBannerSprite.renderOrder = 12;
  tourHighlightGroup.add(tourBannerSprite);

  // Architectural Spotlight illuminating the monument during the Guided Tour
  const tourSpotLight = new THREE.PointLight(0xfde047, 0, 220);
  tourSpotLight.position.set(0, 36, 0);
  tourHighlightGroup.add(tourSpotLight);

  const tourState = {
    isActive: false,
    onVisitLandmark: null,
    currentTargetId: null,
    currentTarget: null,
    dwellTimer: 0,
    blendWeight: 0 // 0 = pure driving view, 0..1 = smooth architectural framing blend
  };

  function setTourHighlightTarget(targetObj) {
    if (!targetObj) return;
    if (tourState.currentTargetId === targetObj.id) return;

    tourState.currentTargetId = targetObj.id;
    tourState.currentTarget = targetObj;

    const tx = targetObj.position ? targetObj.position.x : targetObj.x || 0;
    const ty = targetObj.position ? targetObj.position.y || 0 : 0;
    const tz = targetObj.position ? targetObj.position.z : targetObj.z || 0;

    tourHighlightGroup.position.set(tx, ty, tz);
    tourHighlightGroup.visible = true;

    const accentColor = targetObj.color || targetObj.accent || '#facc15';
    outerRingMat.color.set(accentColor);
    beaconMat.color.set(accentColor);
    tourSpotLight.color.set(accentColor);
    tourSpotLight.intensity = 2.4;

    const title = targetObj.name || targetObj.shortName || 'Monumento de Brasília';
    const sub = targetObj.architect
      ? `${targetObj.architect} (${targetObj.year || '1960'})`
      : targetObj.code
        ? `${targetObj.code} • Esplanada dos Ministérios`
        : 'Patrimônio Mundial UNESCO';

    if (tourBannerMat.map) {
      tourBannerMat.map.dispose();
    }
    tourBannerMat.map = createTourBannerTexture(THREE, title, sub, accentColor);
    tourBannerMat.needsUpdate = true;

    if (typeof tourState.onVisitLandmark === 'function') {
      tourState.onVisitLandmark(targetObj);
    }
  }

  function findClosestArchitecturalTarget(x, z) {
    let bestTarget = LANDMARKS[0];
    let bestScore = Infinity;

    for (const lm of LANDMARKS) {
      const dx = lm.position.x - x;
      const dz = lm.position.z - z;
      const dist = Math.hypot(dx, dz);
      // Weight by triggerRadius so major monuments grab focus when near
      const score = dist - (lm.triggerRadius || 130) * 0.35;
      if (score < bestScore) {
        bestScore = score;
        bestTarget = lm;
      }
    }

    // If driving through the Esplanada dos Ministérios corridor (720 <= X <= 1320),
    // also check if a specific Ministry or Palace (Itamaraty / Justiça) is right beside the kart!
    if (x >= 720 && x <= 1330) {
      for (const min of MINISTRIES) {
        const dx = min.x - x;
        const dz = min.z - z;
        const dist = Math.hypot(dx, dz);
        if (dist < 85 && dist < bestScore) {
          bestScore = dist;
          bestTarget = {
            id: min.id,
            name: min.name,
            shortName: min.name,
            architect: 'Oscar Niemeyer',
            year: min.isPalace ? '1970' : '1960',
            subtitle: `${min.code} • Esplanada dos Ministérios`,
            description: min.isPalace
              ? 'Palácio monumental de Oscar Niemeyer na Esplanada dos Ministérios.'
              : `Bloco ministerial modernista (${min.code}) na Esplanada dos Ministérios.`,
            position: { x: min.x, y: 0, z: min.z },
            color: min.accent,
            isMinistry: true
          };
        }
      }
    }

    return bestTarget;
  }

  const tourController = {
    get isActive() {
      return tourState.isActive;
    },
    startGuidedTour(onVisitLandmark) {
      tourState.isActive = true;
      if (typeof onVisitLandmark === 'function') {
        tourState.onVisitLandmark = onVisitLandmark;
      }
      tourHighlightGroup.visible = true;
      return true;
    },
    stopGuidedTour() {
      tourState.isActive = false;
      tourHighlightGroup.visible = false;
      tourSpotLight.intensity = 0;
      tourState.currentTargetId = null;
      return false;
    },
    toggleGuidedTour(onVisitLandmark) {
      if (tourState.isActive) {
        return this.stopGuidedTour();
      }
      return this.startGuidedTour(onVisitLandmark);
    },
    highlightLandmark(targetObj) {
      setTourHighlightTarget(targetObj);
    },
    getActiveTarget() {
      return tourState.currentTarget || activeLandmark;
    },
    updateTour(dt, kart, elapsedSec = performance.now() * 0.001) {
      const shouldRun =
        tourState.isActive || Boolean(kart && (kart.cruiseAutopilot || kart.autopilot));

      if (!shouldRun) {
        tourState.blendWeight = Math.max(0, tourState.blendWeight - dt * 2.5);
        if (tourState.blendWeight <= 0.01 && !tourState.isActive) {
          tourHighlightGroup.visible = false;
        }
        return null;
      }

      tourState.blendWeight = Math.min(1, tourState.blendWeight + dt * 2.0);
      tourHighlightGroup.visible = true;

      if (kart && kart.position) {
        const nearest = findClosestArchitecturalTarget(kart.position.x, kart.position.z);
        if (nearest) {
          setTourHighlightTarget(nearest);
          if (!nearest.isMinistry) {
            activeLandmark = nearest;
          }
        }
      }

      // Animate 3D glowing ground rings, beacon & floating monument banner
      outerRingMesh.rotation.z = elapsedSec * 0.65;
      innerRingMesh.rotation.z = -elapsedSec * 1.1;
      const pulse = 1 + Math.sin(elapsedSec * 3.2) * 0.08;
      outerRingMesh.scale.set(pulse, pulse, 1);
      innerRingMesh.scale.set(2 - pulse, 2 - pulse, 1);
      beaconMat.opacity = 0.11 + Math.sin(elapsedSec * 2.4) * 0.04;
      tourBannerSprite.position.y = 41 + Math.sin(elapsedSec * 2.0) * 1.8;

      return tourState.currentTarget;
    }
  };

  // ============================================================================
  // 5. MULTI-MODE ARCHITECTURAL CAMERA UPDATE & STREET-VIEW FRAMING
  // ============================================================================
  function snapToKart(kart) {
    if (!kart || !kart.position) return;
    const heading = kart.heading || 0;
    const backX = -Math.sin(heading) * 14.5;
    const backZ = -Math.cos(heading) * 14.5;
    smoothCamPos.set(
      kart.position.x + backX,
      kart.position.y + 5.8,
      kart.position.z + backZ
    );
    smoothCamLook.set(
      kart.position.x + Math.sin(heading) * 28,
      kart.position.y + 6.4,
      kart.position.z + Math.cos(heading) * 28
    );
    orbitState.yawOffset = 0;
    orbitState.pitchOffset = 0;
    orbitState.smoothYaw = 0;
    orbitState.smoothPitch = 0;
    orbitState.dronePanOffset.set(0, 0, 0);
    camera.position.copy(smoothCamPos);
    camera.lookAt(smoothCamLook);
  }

  function updateCameraAndEffects(dt, elapsedSec, kart, options = {}) {
    if (options.cameraMode && options.cameraMode !== cameraMode) {
      cameraMode = options.cameraMode;
    }
    if (options.timeOfDay && options.timeOfDay !== timeOfDay) {
      timeOfDay = options.timeOfDay;
      applySunTimeOfDay(timeOfDay);
      updateDustColorsForTimeOfDay(timeOfDay);
    }
    if (options.activeLandmark) {
      activeLandmark = options.activeLandmark;
    }

    const px = kart && kart.position ? kart.position.x : 0;
    const py = kart && kart.position ? kart.position.y : 0;
    const pz = kart && kart.position ? kart.position.z : 0;
    const heading = kart ? kart.heading || 0 : 0;
    const speed = kart ? kart.speed || 0 : 0;
    const speedKmh = options.speedKmh !== undefined ? options.speedKmh : Math.abs(speed) * 3.2;
    const isDrifting = Boolean(kart && kart.isDrifting);
    const driftDirection = kart ? kart.driftDirection || 0 : 0;
    const isBoosting = Boolean(
      kart && ((kart.boostTimer && kart.boostTimer > 0) || (kart.starTimer && kart.starTimer > 0))
    );
    const hopHeight = kart ? kart.hopHeight || 0 : 0;

    // 1. Update Idle Recenter Timer (Recenter after 2.5s when driving in chase/cockpit/convertible)
    if (!orbitState.isDragging) {
      orbitState.idleTimer += dt;
      const isDriving = Math.abs(speed) > 2.0;
      const shouldAutoRecenter =
        cameraMode !== 'helicopter' &&
        cameraMode !== 'monument' &&
        isDriving &&
        orbitState.idleTimer >= orbitState.recenterDelay;

      if (shouldAutoRecenter) {
        const recenterRate = Math.min(1, dt * 2.8);
        orbitState.yawOffset += (0 - orbitState.yawOffset) * recenterRate;
        orbitState.pitchOffset += (0 - orbitState.pitchOffset) * recenterRate;
        orbitState.zoomDistanceScale += (1.0 - orbitState.zoomDistanceScale) * recenterRate;
      }
    }

    // Smoothly interpolate manual 360° look offsets
    orbitState.smoothYaw += (orbitState.yawOffset - orbitState.smoothYaw) * Math.min(1, dt * 14);
    orbitState.smoothPitch +=
      (orbitState.pitchOffset - orbitState.smoothPitch) * Math.min(1, dt * 14);

    // 2. Update Guided Tour Sequencer
    const tourTarget = tourController.updateTour(dt, kart, elapsedSec);

    // 3. Compute Target Camera Position, LookAt & Architectural Vista FOV
    const fwdX = Math.sin(heading);
    const fwdZ = Math.cos(heading);
    const lookYaw = heading + orbitState.smoothYaw;
    const lookDirX = Math.sin(lookYaw);
    const lookDirZ = Math.cos(lookYaw);

    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();
    let targetFov = 65;

    if (cameraMode === 'chase' || cameraMode === 'convertible') {
      // Street-Level Architectural Chase & Convertible Mode:
      // Slightly wider horizontal FOV and elevated skyline pitch so the 28-story Congresso,
      // 224m Torre de TV, Cathedral columns, and 17 Ministry roof signs are majestically framed!
      const isConvertible = cameraMode === 'convertible';
      const boostFactor = isBoosting ? 1.15 : 0;
      const baseDist = (isConvertible ? 9.6 : 13.2) * orbitState.zoomDistanceScale;
      const distBack = Math.max(4.5, baseDist - boostFactor * 1.3);
      const driftSide = isDrifting ? driftDirection * 2.1 : 0;

      const camHeight =
        (isConvertible ? 4.3 : 5.4) +
        Math.max(-1.8, -orbitState.smoothPitch * 5.2) * orbitState.zoomDistanceScale;

      targetPos.set(
        px - lookDirX * distBack + Math.cos(lookYaw) * driftSide,
        Math.max(1.2, py + camHeight),
        pz - lookDirZ * distBack - Math.sin(lookYaw) * driftSide
      );

      // Upward skyline tilt (+6.2m base look height) so tall monuments are never clipped at the top
      const lookAheadDist = isConvertible ? 36 : 30;
      const skylinePitchY = (isConvertible ? 7.4 : 6.2) + orbitState.smoothPitch * 22;

      targetLook.set(
        px + lookDirX * lookAheadDist,
        py + skylinePitchY,
        pz + lookDirZ * lookAheadDist
      );

      // Subtle Guided Tour framing nudge toward the active monument while keeping the road centered
      if (tourTarget && tourState.blendWeight > 0.05 && Math.abs(orbitState.smoothYaw) < 0.08) {
        const tx = tourTarget.position ? tourTarget.position.x : tourTarget.x || px;
        const tz = tourTarget.position ? tourTarget.position.z : tourTarget.z || pz;
        const distToMonument = Math.hypot(tx - px, tz - pz);
        if (distToMonument < 260) {
          const nudge = 0.22 * tourState.blendWeight;
          targetLook.x = targetLook.x * (1 - nudge) + tx * nudge;
          targetLook.z = targetLook.z * (1 - nudge) + tz * nudge;
          targetLook.y += 2.2 * tourState.blendWeight;
        }
      }

      const baseFov = isConvertible ? 70 : 66;
      targetFov =
        baseFov + Math.min(14, (Math.abs(speed) / 70) * 10) + boostFactor * 5.5;

      smoothCamPos.lerp(targetPos, Math.min(1, dt * 10.5));
      smoothCamLook.lerp(targetLook, Math.min(1, dt * 14));
    } else if (cameraMode === 'cockpit') {
      // First-Person Open-Top Driver / Street-View Paseo Mode:
      // Wide 76° architectural vista with upward pitch and full 360° head-turn freedom!
      targetPos.set(
        px + fwdX * 0.42,
        py + 1.92 + hopHeight,
        pz + fwdZ * 0.42
      );

      const lookDist = 52;
      const upwardVistaY = 7.6 + orbitState.smoothPitch * 32;
      targetLook.set(
        px + lookDirX * lookDist,
        py + upwardVistaY,
        pz + lookDirZ * lookDist
      );

      targetFov = (76 + (isBoosting ? 6 : 0)) * Math.max(0.75, Math.min(1.18, orbitState.zoomDistanceScale));
      smoothCamPos.copy(targetPos);
      smoothCamLook.lerp(targetLook, Math.min(1, dt * 24));
    } else if (cameraMode === 'helicopter') {
      // "Mapa 3D Vivo do Avião de Brasília" — Interactive 3D Google-Earth-style Drone Camera!
      // Supports altitude zoom from 45m (Ministry & Cathedral close-up) to 850m (Full Avião Plano Piloto)
      const altitude = orbitState.helicopterAltitude;

      // Allow WASD / Arrow panning of the 3D map when kart is parked or in autopilot, or with Q/E altitude
      const isAutopilotOrParked =
        Math.abs(speed) < 1.5 || Boolean(kart && (kart.cruiseAutopilot || kart.autopilot));
      if (isAutopilotOrParked) {
        const panSpeed = Math.max(85, altitude * 0.95) * dt;
        const cosY = Math.cos(orbitState.helicopterOrbitYaw);
        const sinY = Math.sin(orbitState.helicopterOrbitYaw);
        if (panKeys.forward) {
          orbitState.dronePanOffset.x -= sinY * panSpeed;
          orbitState.dronePanOffset.z -= cosY * panSpeed;
        }
        if (panKeys.backward) {
          orbitState.dronePanOffset.x += sinY * panSpeed;
          orbitState.dronePanOffset.z += cosY * panSpeed;
        }
        if (panKeys.left) {
          orbitState.dronePanOffset.x -= cosY * panSpeed;
          orbitState.dronePanOffset.z += sinY * panSpeed;
        }
        if (panKeys.right) {
          orbitState.dronePanOffset.x += cosY * panSpeed;
          orbitState.dronePanOffset.z -= sinY * panSpeed;
        }
      } else {
        // Smoothly pull pan offset back toward player kart when manually driving
        orbitState.dronePanOffset.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, dt * 2.2));
      }

      if (panKeys.up) {
        orbitState.helicopterAltitude = Math.min(850, altitude + 180 * dt);
      }
      if (panKeys.down) {
        orbitState.helicopterAltitude = Math.max(45, altitude - 180 * dt);
      }

      // Gentle slow ambient orbit when idle
      if (!orbitState.isDragging && orbitState.idleTimer > 4.0) {
        orbitState.helicopterOrbitYaw += dt * 0.06;
      }

      const focusX = Math.max(-1650, Math.min(1650, px + orbitState.dronePanOffset.x));
      const focusZ = Math.max(-850, Math.min(850, pz + orbitState.dronePanOffset.z));

      const horizontalRadius =
        altitude * Math.cos(orbitState.helicopterPitch) * 1.15;
      const camX = focusX + Math.sin(orbitState.helicopterOrbitYaw) * horizontalRadius;
      const camZ = focusZ + Math.cos(orbitState.helicopterOrbitYaw) * horizontalRadius;

      targetPos.set(camX, py + altitude, camZ);
      targetLook.set(focusX, py + 8, focusZ);
      targetFov = 56;

      smoothCamPos.lerp(targetPos, Math.min(1, dt * 6.5));
      smoothCamLook.lerp(targetLook, Math.min(1, dt * 8.5));
    } else if (cameraMode === 'monument') {
      // Postcard Architectural Mirante View with 360° user orbit & zoom
      const lm = activeLandmark || LANDMARKS[0];
      orbitState.autoOrbitAngle += dt * 0.22;

      const baseCam = lm.cameraPos || { x: px - 60, y: 40, z: pz + 80 };
      const baseLook = lm.cameraLookAt || { x: lm.position.x, y: 18, z: lm.position.z };

      const dx = baseCam.x - baseLook.x;
      const dz = baseCam.z - baseLook.z;
      const baseRadius = Math.max(35, Math.hypot(dx, dz)) * orbitState.zoomDistanceScale;
      const baseAngle = Math.atan2(dx, dz);
      const totalAngle =
        baseAngle +
        orbitState.smoothYaw +
        (orbitState.idleTimer > 2.5 ? Math.sin(orbitState.autoOrbitAngle) * 0.28 : 0);

      targetPos.set(
        baseLook.x + Math.sin(totalAngle) * baseRadius,
        Math.max(6, baseCam.y * orbitState.zoomDistanceScale - orbitState.smoothPitch * 28),
        baseLook.z + Math.cos(totalAngle) * baseRadius
      );
      targetLook.set(
        baseLook.x * 0.78 + px * 0.22,
        baseLook.y + 4 + orbitState.smoothPitch * 18,
        baseLook.z * 0.78 + pz * 0.22
      );
      targetFov = 56;

      smoothCamPos.lerp(targetPos, Math.min(1, dt * 5.0));
      smoothCamLook.lerp(targetLook, Math.min(1, dt * 6.5));
    }

    camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 8.5);
    camera.updateProjectionMatrix();
    camera.position.copy(smoothCamPos);
    camera.lookAt(smoothCamLook);

    // 4. Update Floating Cerrado Golden Dust Motes around active camera
    const posAttr = dustGeo.getAttribute('position');
    const camPos = camera.position;
    for (let i = 0; i < DUST_COUNT; i++) {
      const idx = i * 3;
      const sIdx = i * 4;
      const phase = dustSeeds[sIdx];
      let x = posAttr.array[idx] + (dustSeeds[sIdx + 1] + Math.sin(elapsedSec * 1.3 + phase) * 0.6) * dt;
      let y = posAttr.array[idx + 1] + (dustSeeds[sIdx + 2] + Math.cos(elapsedSec * 1.7 + phase) * 0.4) * dt;
      let z = posAttr.array[idx + 2] + (dustSeeds[sIdx + 3] + Math.sin(elapsedSec * 1.1 + phase) * 0.6) * dt;

      // Wrap motes within a 90m x 30m x 90m volume centered on the camera
      if (x - camPos.x > 45) x -= 90;
      else if (x - camPos.x < -45) x += 90;

      if (y - camPos.y > 18) y -= 28;
      else if (y - camPos.y < -10) y += 28;

      if (z - camPos.z > 45) z -= 90;
      else if (z - camPos.z < -45) z += 90;

      posAttr.array[idx] = x;
      posAttr.array[idx + 1] = Math.max(0.4, y);
      posAttr.array[idx + 2] = z;
    }
    posAttr.needsUpdate = true;

    // 5. Update High-Speed Aerodynamic Wind Streaks (> 150 km/h or boosting)
    const speedIntensity = Math.max(
      0,
      Math.min(1, (speedKmh - 142) / 55 + (isBoosting ? 0.65 : 0))
    );
    windLineMat.opacity =
      cameraMode === 'helicopter' || cameraMode === 'monument'
        ? 0
        : speedIntensity * 0.42;

    if (windLineMat.opacity > 0.01) {
      windLinesGroup.position.copy(camera.position);
      windLinesGroup.quaternion.copy(camera.quaternion);
      windLineMat.color.setHex(isBoosting ? 0xfef08a : 0xe0f2fe);

      const streakVelocity = 55 + speedKmh * 0.45;
      for (const st of windStreaks) {
        st.zOffset += streakVelocity * st.speedMult * dt;
        if (st.zOffset > -1.5) {
          st.zOffset = -26 - Math.random() * 10;
        }
        st.mesh.position.z = st.zOffset;
      }
    }

    // 6. Update Sun/Moon God-Ray Corona & Dynamic Lens Flare Ghosts
    sunCoronaSprite.material.rotation = elapsedSec * 0.08;
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    const toSun = new THREE.Vector3().subVectors(sunHaloGroup.position, camera.position).normalize();
    const sunAlignment = Math.max(0, camDir.dot(toSun)); // 1.0 when looking directly at the sun

    const flareStrength = Math.pow(sunAlignment, 3.5);
    const centerPoint = new THREE.Vector3()
      .copy(camera.position)
      .addScaledVector(camDir, 120);
    const sunScreenPoint = new THREE.Vector3()
      .copy(camera.position)
      .addScaledVector(toSun, 120);

    for (const fg of flareGhosts) {
      if (flareStrength > 0.02) {
        fg.sprite.visible = true;
        fg.mat.opacity = fg.cfg.opacity * flareStrength;
        fg.sprite.position.lerpVectors(sunScreenPoint, centerPoint, fg.cfg.factor);
      } else {
        fg.sprite.visible = false;
      }
    }
  }

  function dispose() {
    if (domElement && domElement.removeEventListener) {
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      domElement.removeEventListener('touchend', onTouchEnd);
      domElement.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  }

  return {
    get cameraMode() {
      return cameraMode;
    },
    set cameraMode(mode) {
      cameraMode = mode;
    },
    setCameraMode(mode) {
      cameraMode = mode;
      orbitState.idleTimer = 0;
    },
    getCameraMode() {
      return cameraMode;
    },
    setTimeOfDay(tod) {
      timeOfDay = tod;
      applySunTimeOfDay(tod);
      updateDustColorsForTimeOfDay(tod);
    },
    setActiveLandmark(lm) {
      if (lm) activeLandmark = lm;
    },
    snapToKart,
    snapCameraToPlayer: snapToKart,
    resetOrbit() {
      orbitState.yawOffset = 0;
      orbitState.pitchOffset = 0;
      orbitState.zoomDistanceScale = 1.0;
      orbitState.dronePanOffset.set(0, 0, 0);
    },
    update: updateCameraAndEffects,
    updateCamera: updateCameraAndEffects,
    tourController,
    orbitState,
    sunHaloGroup,
    effectsGroup,
    tourHighlightGroup,
    dispose
  };
}
