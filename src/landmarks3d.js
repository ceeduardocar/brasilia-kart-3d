/**
 * Brasília Kart 3D — Eixo Monumental Edition
 * 3D Architectural & World Artist Module (`src/landmarks3d.js`)
 *
 * Builds the entire 3D Plano Piloto ("Avião" of Lúcio Costa), Oscar Niemeyer & Sérgio Bernardes
 * architectural monuments, the 17 Ministry buildings with readable 3D signs, animated fountains
 * and waterfalls, Lago Paranoá & Ponte JK, Estádio Mané Garrincha, Eixão Asa Sul & Asa Norte,
 * multi-lane Eixo Monumental asphalt track, boost pads, Mario Kart item boxes, cerrado flora,
 * and dynamic time-of-day atmosphere ('day', 'sunset', 'night').
 */

import {
  LANDMARKS,
  MINISTRIES,
  BOOST_PAD_FRACTIONS,
  ITEM_BOX_FRACTIONS,
  ROAD_WIDTH
} from './trackData.js';

// ============================================================================
// 1. PROCEDURAL CANVAS TEXTURES & PBR MATERIAL FACTORY
// ============================================================================

function createProceduralTextures(THREE) {
  // 1A. Multi-Lane Asphalt with 4 lanes, dashed dividers & subtle tarmac grain
  const asphaltCanvas = document.createElement('canvas');
  asphaltCanvas.width = 512;
  asphaltCanvas.height = 512;
  const actx = asphaltCanvas.getContext('2d');
  actx.fillStyle = '#242830';
  actx.fillRect(0, 0, 512, 512);

  // Subtle asphalt aggregate noise
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const v = 30 + Math.floor(Math.random() * 26);
    actx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
    actx.fillRect(x, y, 2, 2);
  }

  // Darker tire wear tracks in the 4 lanes
  const laneCenters = [76, 192, 320, 436];
  for (const lc of laneCenters) {
    const grad = actx.createLinearGradient(lc - 35, 0, lc + 35, 0);
    grad.addColorStop(0, 'rgba(15,17,22,0)');
    grad.addColorStop(0.5, 'rgba(15,17,22,0.32)');
    grad.addColorStop(1, 'rgba(15,17,22,0)');
    actx.fillStyle = grad;
    actx.fillRect(lc - 35, 0, 70, 512);
  }

  // Solid outer shoulder lines (Yellow on median side, White on outer curb side)
  actx.fillStyle = '#fbbf24';
  actx.fillRect(14, 0, 8, 512);
  actx.fillStyle = '#f8fafc';
  actx.fillRect(490, 0, 8, 512);

  // Crisp white dashed lane dividers (3 inner dividers for 4 lanes)
  actx.fillStyle = '#f1f5f9';
  const dividerX = [134, 256, 378];
  for (const dx of dividerX) {
    for (let y = 24; y < 512; y += 128) {
      actx.fillRect(dx - 3, y, 6, 68);
    }
  }

  const roadTex = new THREE.CanvasTexture(asphaltCanvas);
  roadTex.wrapS = THREE.ClampToEdgeWrapping;
  roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.anisotropy = 8;

  // 1B. Red & White Brasília Racing Curbs (Zebras)
  const curbCanvas = document.createElement('canvas');
  curbCanvas.width = 64;
  curbCanvas.height = 256;
  const cctx = curbCanvas.getContext('2d');
  cctx.fillStyle = '#ef4444';
  cctx.fillRect(0, 0, 64, 128);
  cctx.fillStyle = '#f8fafc';
  cctx.fillRect(0, 128, 64, 128);
  // Subtle inner bevel line
  cctx.fillStyle = 'rgba(0,0,0,0.18)';
  cctx.fillRect(0, 124, 64, 4);
  cctx.fillRect(0, 252, 64, 4);

  const curbTex = new THREE.CanvasTexture(curbCanvas);
  curbTex.wrapS = THREE.RepeatWrapping;
  curbTex.wrapT = THREE.RepeatWrapping;
  curbTex.anisotropy = 4;

  // 1C. Niemeyer White Travertine Marble & Brutalist Fair-Faced Concrete
  const marbleCanvas = document.createElement('canvas');
  marbleCanvas.width = 256;
  marbleCanvas.height = 256;
  const mctx = marbleCanvas.getContext('2d');
  mctx.fillStyle = '#f5f4ef';
  mctx.fillRect(0, 0, 256, 256);
  // Subtle travertine panel joints & veins
  mctx.strokeStyle = 'rgba(205, 198, 185, 0.45)';
  mctx.lineWidth = 1;
  for (let y = 0; y < 256; y += 32) {
    mctx.beginPath();
    mctx.moveTo(0, y);
    mctx.lineTo(256, y);
    mctx.stroke();
  }
  for (let x = 0; x < 256; x += 64) {
    mctx.beginPath();
    mctx.moveTo(x, 0);
    mctx.lineTo(x, 256);
    mctx.stroke();
  }
  for (let i = 0; i < 600; i++) {
    mctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(210,202,190,0.25)';
    mctx.fillRect(Math.random() * 256, Math.random() * 256, 14, 2);
  }
  const marbleTex = new THREE.CanvasTexture(marbleCanvas);
  marbleTex.wrapS = THREE.RepeatWrapping;
  marbleTex.wrapT = THREE.RepeatWrapping;
  marbleTex.repeat.set(4, 4);

  // 1D. Illuminated Modernist Green-Tinted Glass Curtain Wall (Esplanada Ministries)
  const glassCanvas = document.createElement('canvas');
  glassCanvas.width = 256;
  glassCanvas.height = 256;
  const gctx = glassCanvas.getContext('2d');
  gctx.fillStyle = '#0d4f48';
  gctx.fillRect(0, 0, 256, 256);

  // Window grid with warm lit office rooms and aluminium mullions
  const cols = 16;
  const rows = 8;
  const cw = 256 / cols;
  const rh = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const litChance = ((r * 7 + c * 13) % 11) / 11;
      if (litChance > 0.45) {
        gctx.fillStyle = litChance > 0.75 ? '#5eead4' : '#2dd4bf';
      } else {
        gctx.fillStyle = '#115e59';
      }
      gctx.fillRect(c * cw + 2, r * rh + 3, cw - 4, rh - 6);
    }
    // Horizontal concrete floor slab band
    gctx.fillStyle = '#cbd5e1';
    gctx.fillRect(0, r * rh, 256, 3);
  }
  // Vertical aluminum mullions
  gctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
  for (let c = 0; c < cols; c++) {
    gctx.fillRect(c * cw, 0, 1.5, 256);
  }

  const ministryGlassTex = new THREE.CanvasTexture(glassCanvas);
  ministryGlassTex.wrapS = THREE.RepeatWrapping;
  ministryGlassTex.wrapT = THREE.RepeatWrapping;
  ministryGlassTex.repeat.set(3, 1);

  // 1E. Office Tower Window Emissive Texture (for Congresso Anexo I & Setor Comercial)
  const towerCanvas = document.createElement('canvas');
  towerCanvas.width = 256;
  towerCanvas.height = 512;
  const tctx = towerCanvas.getContext('2d');
  tctx.fillStyle = '#1e293b';
  tctx.fillRect(0, 0, 256, 512);
  for (let r = 0; r < 28; r++) {
    const y = r * (512 / 28);
    for (let c = 0; c < 12; c++) {
      const x = c * (256 / 12);
      const hash = Math.sin(r * 19.3 + c * 7.7) * 0.5 + 0.5;
      if (hash > 0.35) {
        tctx.fillStyle = hash > 0.72 ? '#fef08a' : '#7dd3fc';
      } else {
        tctx.fillStyle = '#0f172a';
      }
      tctx.fillRect(x + 2, y + 3, 256 / 12 - 4, 512 / 28 - 5);
    }
    tctx.fillStyle = '#475569';
    tctx.fillRect(0, y, 256, 2);
  }
  const towerGlassTex = new THREE.CanvasTexture(towerCanvas);
  towerGlassTex.wrapS = THREE.RepeatWrapping;
  towerGlassTex.wrapT = THREE.RepeatWrapping;

  // 1F. Athos Bulcão Aztec Relief Cube Texture (for Teatro Nacional)
  const athosCanvas = document.createElement('canvas');
  athosCanvas.width = 256;
  athosCanvas.height = 256;
  const atctx = athosCanvas.getContext('2d');
  atctx.fillStyle = '#ecebe4';
  atctx.fillRect(0, 0, 256, 256);
  for (let y = 8; y < 248; y += 16) {
    for (let x = 8; x < 248; x += 20) {
      const h = ((x * 3 + y * 5) % 3) === 0 ? 14 : 8;
      // Shadow side
      atctx.fillStyle = '#b6b3a8';
      atctx.fillRect(x + 2, y + 2, h, 10);
      // Lit face
      atctx.fillStyle = '#ffffff';
      atctx.fillRect(x, y, h, 10);
    }
  }
  const athosTex = new THREE.CanvasTexture(athosCanvas);
  athosTex.wrapS = THREE.RepeatWrapping;
  athosTex.wrapT = THREE.RepeatWrapping;
  athosTex.repeat.set(3, 2);

  // 1G. Marianne Peretti Stained Glass Texture (for Catedral Metropolitana)
  const vitralCanvas = document.createElement('canvas');
  vitralCanvas.width = 256;
  vitralCanvas.height = 256;
  const vctx = vitralCanvas.getContext('2d');
  const vgrad = vctx.createLinearGradient(0, 0, 256, 256);
  vgrad.addColorStop(0, '#0284c7');
  vgrad.addColorStop(0.35, '#06b6d4');
  vgrad.addColorStop(0.7, '#10b981');
  vgrad.addColorStop(1, '#e0f2fe');
  vctx.fillStyle = vgrad;
  vctx.fillRect(0, 0, 256, 256);
  vctx.strokeStyle = 'rgba(255,255,255,0.45)';
  vctx.lineWidth = 3;
  for (let i = 0; i < 16; i++) {
    vctx.beginPath();
    vctx.moveTo(128, 0);
    vctx.lineTo(i * 16, 256);
    vctx.stroke();
  }
  const vitralTex = new THREE.CanvasTexture(vitralCanvas);

  // 1H. Brazilian Flag Texture (for Mastro da Bandeira Nacional & Praça do Cruzeiro)
  const flagCanvas = document.createElement('canvas');
  flagCanvas.width = 256;
  flagCanvas.height = 176;
  const fctx = flagCanvas.getContext('2d');
  fctx.fillStyle = '#009b3a';
  fctx.fillRect(0, 0, 256, 176);
  fctx.fillStyle = '#fedf00';
  fctx.beginPath();
  fctx.moveTo(128, 18);
  fctx.lineTo(234, 88);
  fctx.lineTo(128, 158);
  fctx.lineTo(22, 88);
  fctx.closePath();
  fctx.fill();
  fctx.fillStyle = '#002776';
  fctx.beginPath();
  fctx.arc(128, 88, 44, 0, Math.PI * 2);
  fctx.fill();
  // White equatorial band
  fctx.strokeStyle = '#ffffff';
  fctx.lineWidth = 7;
  fctx.beginPath();
  fctx.arc(118, 118, 56, -0.85, -0.12);
  fctx.stroke();
  const flagTex = new THREE.CanvasTexture(flagCanvas);

  // 1I. Boost Pad Neon Chevron Texture
  const boostCanvas = document.createElement('canvas');
  boostCanvas.width = 128;
  boostCanvas.height = 256;
  const bctx = boostCanvas.getContext('2d');
  bctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  bctx.fillRect(0, 0, 128, 256);
  const chevColors = ['#22d3ee', '#38bdf8', '#facc15', '#f97316'];
  for (let i = 0; i < 4; i++) {
    const y = 32 + i * 56;
    bctx.fillStyle = chevColors[i % chevColors.length];
    bctx.beginPath();
    bctx.moveTo(14, y + 36);
    bctx.lineTo(64, y);
    bctx.lineTo(114, y + 36);
    bctx.lineTo(114, y + 52);
    bctx.lineTo(64, y + 18);
    bctx.lineTo(14, y + 52);
    bctx.closePath();
    bctx.fill();
  }
  const boostTex = new THREE.CanvasTexture(boostCanvas);
  boostTex.wrapS = THREE.RepeatWrapping;
  boostTex.wrapT = THREE.RepeatWrapping;

  // 1J. Mario Kart '?' Item Box Texture
  const qCanvas = document.createElement('canvas');
  qCanvas.width = 128;
  qCanvas.height = 128;
  const qctx = qCanvas.getContext('2d');
  const qgrad = qctx.createLinearGradient(0, 0, 128, 128);
  qgrad.addColorStop(0, 'rgba(56, 189, 248, 0.88)');
  qgrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.88)');
  qgrad.addColorStop(1, 'rgba(250, 204, 21, 0.88)');
  qctx.fillStyle = qgrad;
  qctx.fillRect(0, 0, 128, 128);
  qctx.strokeStyle = '#ffffff';
  qctx.lineWidth = 6;
  qctx.strokeRect(6, 6, 116, 116);
  qctx.fillStyle = '#ffffff';
  qctx.font = 'bold 84px sans-serif';
  qctx.textAlign = 'center';
  qctx.textBaseline = 'middle';
  qctx.fillText('?', 64, 68);
  const itemBoxTex = new THREE.CanvasTexture(qCanvas);

  return {
    roadTex,
    curbTex,
    marbleTex,
    ministryGlassTex,
    towerGlassTex,
    athosTex,
    vitralTex,
    flagTex,
    boostTex,
    itemBoxTex
  };
}

/**
 * Helper to create crisp 3D Billboard/Roof Sign Texture with customizable text & accent colors
 */
function createSignTexture(THREE, title, subtitle, accentColor = '#10b981', bgColor = '#0f172a') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background panel
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  // Border frame & top accent bar
  ctx.fillStyle = accentColor;
  ctx.fillRect(0, 0, 512, 14);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 122);

  // Subtitle / Code pill
  if (subtitle) {
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(subtitle.toUpperCase(), 256, 42);
  }

  // Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.toUpperCase(), 256, subtitle ? 92 : 78);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

/**
 * Helper to create painted asphalt road-marking decal texture ("EIXO MONUMENTAL", "VIA S1", etc.)
 */
function createRoadTextDecal(THREE, line1, line2, isCrosswalk = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 256);

  if (isCrosswalk) {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.88)';
    for (let y = 12; y < 244; y += 36) {
      ctx.fillRect(32, y, 448, 20);
    }
  } else {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.78)';
    ctx.font = 'bold 46px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(line1, 256, 110);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(line2, 256, 180);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

// ============================================================================
// 2. MAIN WORLD BUILDER EXPORT
// ============================================================================

export function buildBrasiliaWorld(THREE, scene, trackSpline) {
  const textures = createProceduralTextures(THREE);
  const landmarkGroups = {};
  const animatedObjects = {
    waterMirrors: [],
    fountainJets: [],
    waterfalls: [],
    flags: [],
    spinningSculptures: [],
    emissiveMaterials: [],
    streetLampBulbs: [],
    streetPointLights: [],
    clouds: []
  };
  const boostPads = [];
  const itemBoxes = [];

  // Shared PBR Materials
  const mats = {
    whiteMarble: new THREE.MeshStandardMaterial({
      map: textures.marbleTex,
      color: 0xffffff,
      roughness: 0.28,
      metalness: 0.08
    }),
    brutalistConcrete: new THREE.MeshStandardMaterial({
      map: textures.marbleTex,
      color: 0xd6d3cd,
      roughness: 0.65,
      metalness: 0.05
    }),
    darkConcrete: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.75,
      metalness: 0.1
    }),
    ministryGlass: new THREE.MeshStandardMaterial({
      map: textures.ministryGlassTex,
      color: 0x99f6e4,
      roughness: 0.15,
      metalness: 0.65,
      emissive: new THREE.Color(0x0d9488),
      emissiveMap: textures.ministryGlassTex,
      emissiveIntensity: 0.25
    }),
    towerGlass: new THREE.MeshStandardMaterial({
      map: textures.towerGlassTex,
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.7,
      emissive: new THREE.Color(0xfef08a),
      emissiveMap: textures.towerGlassTex,
      emissiveIntensity: 0.3
    }),
    stainedGlass: new THREE.MeshStandardMaterial({
      map: textures.vitralTex,
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.2,
      emissive: new THREE.Color(0x06b6d4),
      emissiveMap: textures.vitralTex,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    }),
    bronze: new THREE.MeshStandardMaterial({
      color: 0x926c44,
      roughness: 0.35,
      metalness: 0.82
    }),
    goldAccent: new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.25,
      metalness: 0.85,
      emissive: new THREE.Color(0xd97706),
      emissiveIntensity: 0.2
    }),
    waterMirror: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.85,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.22
    }),
    athosRelief: new THREE.MeshStandardMaterial({
      map: textures.athosTex,
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.1
    }),
    steelLattice: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.78
    })
  };

  animatedObjects.emissiveMaterials.push(
    { mat: mats.ministryGlass, day: 0.2, sunset: 0.85, night: 1.35 },
    { mat: mats.towerGlass, day: 0.18, sunset: 0.9, night: 1.45 },
    { mat: mats.stainedGlass, day: 0.45, sunset: 1.0, night: 1.65 }
  );

  // Helper to create an animated water mirror pool
  function addWaterPool(parent, width, depth, x, y, z, isCircular = false) {
    const geom = isCircular
      ? new THREE.CylinderGeometry(width, width, 0.35, 40)
      : new THREE.BoxGeometry(width, 0.35, depth);
    const mesh = new THREE.Mesh(geom, mats.waterMirror);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    animatedObjects.waterMirrors.push({ mesh, baseY: y, phase: x * 0.02 + z * 0.02 });
    return mesh;
  }

  // Helper to register landmark groups
  for (const lm of LANDMARKS) {
    const g = new THREE.Group();
    g.name = `landmark_${lm.id}`;
    scene.add(g);
    landmarkGroups[lm.id] = g;
  }

  // ==========================================================================
  // 3. SKY DOME, SUN/MOON, CLOUDS, STARS & LIGHTING SYSTEM
  // ==========================================================================
  const envGroup = new THREE.Group();
  envGroup.name = 'BrasiliaEnvironment';
  scene.add(envGroup);

  const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x3f6212, 0.75);
  hemiLight.position.set(0, 300, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
  dirLight.position.set(420, 520, 260);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 20;
  dirLight.shadow.camera.far = 2200;
  const dCam = 900;
  dirLight.shadow.camera.left = -dCam;
  dirLight.shadow.camera.right = dCam;
  dirLight.shadow.camera.top = dCam;
  dirLight.shadow.camera.bottom = -dCam;
  scene.add(dirLight);

  // Monumental Spotlight accents for Night & Sunset
  const congressGlowLight = new THREE.PointLight(0xfff7ed, 0, 420);
  congressGlowLight.position.set(1435, 55, 0);
  scene.add(congressGlowLight);

  const tvTowerGlowLight = new THREE.PointLight(0x38bdf8, 0, 380);
  tvTowerGlowLight.position.set(-210, 85, 0);
  scene.add(tvTowerGlowLight);

  const cathedralGlowLight = new THREE.PointLight(0x22d3ee, 0, 260);
  cathedralGlowLight.position.set(625, 28, 125);
  scene.add(cathedralGlowLight);

  animatedObjects.streetPointLights.push(congressGlowLight, tvTowerGlowLight, cathedralGlowLight);

  // Sky Dome Shader / Procedural Gradient Sphere
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 32;
  skyCanvas.height = 256;
  const skyTex = new THREE.CanvasTexture(skyCanvas);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTex,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(3800, 32, 24), skyMat);
  envGroup.add(skyDome);

  // Sun / Moon Disc in the sky
  const sunDiscMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false });
  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(75, 24, 24), sunDiscMat);
  sunDisc.position.set(1600, 720, -450);
  envGroup.add(sunDisc);

  // Starfield for Night Mode
  const starCount = 1200;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.46;
    const r = 3400;
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi) + 80;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeom = new THREE.BufferGeometry();
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 9,
    transparent: true,
    opacity: 0.0,
    fog: false
  });
  const starField = new THREE.Points(starGeom, starMat);
  envGroup.add(starField);

  // Fluffy Cerrado Cumulus Clouds
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.88
  });
  for (let i = 0; i < 26; i++) {
    const cg = new THREE.Group();
    const cx = -2200 + (i * 185) + (Math.sin(i * 4.1) * 120);
    const cz = (i % 2 === 0 ? 1 : -1) * (320 + (i % 5) * 190);
    const cy = 260 + (i % 4) * 45;
    cg.position.set(cx, cy, cz);

    const puffs = 3 + (i % 3);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(
        new THREE.DodecahedronGeometry(28 + (p % 2) * 14, 1),
        cloudMat
      );
      puff.position.set((p - 1.2) * 26, (p % 2) * 8, (p % 3 - 1) * 10);
      puff.scale.set(1.5, 0.62, 1.1);
      cg.add(puff);
    }
    envGroup.add(cg);
    animatedObjects.clouds.push({ mesh: cg, speed: 3.5 + (i % 4) * 1.2 });
  }

  // ==========================================================================
  // 4. TERRAIN, GRAMADO CENTRAL & 3D PLANO PILOTO ("AVIÃO DE BRASÍLIA")
  // ==========================================================================
  const terrainGroup = new THREE.Group();
  terrainGroup.name = 'PlanoPilotoTerrain';
  scene.add(terrainGroup);

  // 4A. Wide Cerrado Red-Earth Base & Outer Lawn
  const cerradoBaseMat = new THREE.MeshStandardMaterial({
    color: 0x3b5323,
    roughness: 0.92,
    metalness: 0.02
  });
  const outerGround = new THREE.Mesh(new THREE.PlaneGeometry(7600, 7600), cerradoBaseMat);
  outerGround.rotation.x = -Math.PI / 2;
  outerGround.position.y = -1.2;
  outerGround.receiveShadow = true;
  terrainGroup.add(outerGround);

  // Cerrado Terracotta Red-Earth Shoulder Strips
  const redEarthMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412,
    roughness: 0.9,
    metalness: 0.02
  });
  const redEarthStrip = new THREE.Mesh(new THREE.PlaneGeometry(3600, 340), redEarthMat);
  redEarthStrip.rotation.x = -Math.PI / 2;
  redEarthStrip.position.set(20, -0.75, 0);
  redEarthStrip.receiveShadow = true;
  terrainGroup.add(redEarthStrip);

  // 4B. Gramado Central do Eixo Monumental (Undulating elevation matching track profile)
  const lawnSegX = 120;
  const lawnSegZ = 8;
  const lawnGeom = new THREE.PlaneGeometry(3040, 88, lawnSegX, lawnSegZ);
  lawnGeom.rotateX(-Math.PI / 2);
  const lPos = lawnGeom.attributes.position;
  for (let i = 0; i < lPos.count; i++) {
    const vx = lPos.getX(i) + 40; // shifted center
    lPos.setX(i, vx);
    // Match elevation profile of the Eixo Monumental (Praça do Cruzeiro peak at X = -840)
    let h = -0.15;
    if (vx < 100 && vx > -1420) {
      const distCruzeiro = Math.abs(vx - (-830));
      if (distCruzeiro < 600) {
        h += Math.cos((distCruzeiro / 600) * (Math.PI / 2)) * 3.35;
      }
    }
    if (vx > -10 && vx < 210) {
      // Slight dip at Rodoviária underpass level
      const distRodo = Math.abs(vx - 95);
      if (distRodo < 110) {
        h -= Math.cos((distRodo / 110) * (Math.PI / 2)) * 0.35;
      }
    }
    lPos.setY(i, h);
  }
  lawnGeom.computeVertexNormals();

  const gramadoMat = new THREE.MeshStandardMaterial({
    color: 0x2e6f40,
    roughness: 0.85,
    metalness: 0.03
  });
  const gramadoMesh = new THREE.Mesh(lawnGeom, gramadoMat);
  gramadoMesh.receiveShadow = true;
  terrainGroup.add(gramadoMesh);

  // Central Pedestrian Promenade & Ornamental Ponds along the Gramado Central
  const walkwayMat = new THREE.MeshStandardMaterial({
    color: 0xe2dcd0,
    roughness: 0.7
  });
  for (let x = -1320; x <= 1250; x += 60) {
    let wy = 0.02;
    const distCruzeiro = Math.abs(x - (-830));
    if (x < 100 && x > -1420 && distCruzeiro < 600) {
      wy += Math.cos((distCruzeiro / 600) * (Math.PI / 2)) * 3.35;
    }
    const tile = new THREE.Mesh(new THREE.BoxGeometry(58, 0.14, 5.5), walkwayMat);
    tile.position.set(x, wy, 0);
    terrainGroup.add(tile);
  }

  // 4C. THE 3D "AVIÃO" PLANO PILOTO WINGS (EIXÃO ASA SUL & EIXÃO ASA NORTE)
  // Crosses the Eixo Monumental at Rodoviária (X = 95) and curves gently westward like swept airplane wings!
  function buildPlanoPilotoWings() {
    const wingsGroup = new THREE.Group();
    wingsGroup.name = 'AsaSul_AsaNorte_Wings';

    const wingHighwayMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.65
    });
    const superquadraMat = new THREE.MeshStandardMaterial({
      map: textures.towerGlassTex,
      color: 0xf1f5f9,
      roughness: 0.3,
      metalness: 0.4,
      emissive: new THREE.Color(0xfef08a),
      emissiveMap: textures.towerGlassTex,
      emissiveIntensity: 0.25
    });
    animatedObjects.emissiveMaterials.push({
      mat: superquadraMat,
      day: 0.12,
      sunset: 0.75,
      night: 1.25
    });

    const commercialTowerMat = new THREE.MeshStandardMaterial({
      map: textures.ministryGlassTex,
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.75,
      emissive: new THREE.Color(0x0284c7),
      emissiveMap: textures.ministryGlassTex,
      emissiveIntensity: 0.3
    });
    animatedObjects.emissiveMaterials.push({
      mat: commercialTowerMat,
      day: 0.18,
      sunset: 0.85,
      night: 1.35
    });

    // Build Both Wings: dir = +1 (Asa Sul, Z > 0) and dir = -1 (Asa Norte, Z < 0)
    for (const dir of [1, -1]) {
      const wingPoints = [];
      for (let i = 0; i <= 24; i++) {
        const zDist = i * 75; // out to Z = ±1800m!
        // Iconic curved bow shape of the Eixão ("Asas do Avião")
        const xSweep = 95 - Math.pow(zDist / 380, 1.65) * 22;
        const yElev = i === 0 ? 6.5 : Math.max(0.2, 6.5 - i * 0.9);
        wingPoints.push(new THREE.Vector3(xSweep, yElev, dir * zDist));
      }

      const wingCurve = new THREE.CatmullRomCurve3(wingPoints);
      const wingSamples = wingCurve.getPoints(120);

      // Build Eixão Dual Highway Deck + Eixinhos L/W
      for (let i = 0; i < wingSamples.length - 1; i++) {
        const p1 = wingSamples[i];
        const p2 = wingSamples[i + 1];
        const segLen = p1.distanceTo(p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const segMesh = new THREE.Mesh(new THREE.BoxGeometry(34, 0.7, segLen + 1.2), wingHighwayMat);
        segMesh.position.copy(mid);
        segMesh.lookAt(p2);
        wingsGroup.add(segMesh);

        // Glowing central highway divider strip on the Eixão
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.85, segLen + 1.0),
          mats.goldAccent
        );
        strip.position.copy(mid);
        strip.lookAt(p2);
        wingsGroup.add(strip);

        // Viaduct support pillars near Rodoviária overpass
        if (mid.y > 1.0 && i % 3 === 0) {
          const col = new THREE.Mesh(
            new THREE.CylinderGeometry(1.4, 1.6, mid.y, 12),
            mats.brutalistConcrete
          );
          col.position.set(mid.x - 10, mid.y / 2 - 0.3, mid.z);
          wingsGroup.add(col);
          const col2 = col.clone();
          col2.position.x = mid.x + 10;
          wingsGroup.add(col2);
        }
      }

      // Setor Comercial Sul & Norte (SCS / SCN) & Setor Bancário Skyscrapers (Z = 140..420)
      for (let b = 0; b < 14; b++) {
        const zOff = dir * (145 + b * 24);
        const xSide = (b % 2 === 0 ? -1 : 1) * (42 + (b % 3) * 28);
        const bx = 95 + xSide - Math.pow(Math.abs(zOff) / 380, 1.65) * 22;
        const h = 38 + ((b * 17) % 48);
        const w = 18 + (b % 3) * 6;
        const d = 16 + (b % 2) * 8;

        const tower = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          b % 2 === 0 ? commercialTowerMat : superquadraMat
        );
        tower.position.set(bx, h / 2, zOff);
        tower.castShadow = true;
        wingsGroup.add(tower);

        // Modernist rooftop helipad or concrete crown
        const crown = new THREE.Mesh(
          new THREE.BoxGeometry(w + 1.5, 2.2, d + 1.5),
          mats.whiteMarble
        );
        crown.position.set(bx, h + 1.1, zOff);
        wingsGroup.add(crown);
      }

      // Superquadras (SQS 101-116 / SQN 101-116 & 201-216): 6-story modernist blocks on Pilotis!
      for (let q = 3; q <= 21; q++) {
        const zQuadra = dir * (q * 80);
        const xCurve = 95 - Math.pow((q * 80) / 380, 1.65) * 22;

        for (const side of [-1, 1]) {
          const sqX = xCurve + side * (68 + (q % 2) * 38);
          const blockGroup = new THREE.Group();
          blockGroup.position.set(sqX, 0, zQuadra);

          // Pilotis base (open ground floor with white columns)
          const pilotisSlab = new THREE.Mesh(
            new THREE.BoxGeometry(44, 0.8, 14),
            mats.whiteMarble
          );
          pilotisSlab.position.y = 3.5;
          blockGroup.add(pilotisSlab);

          for (let px = -18; px <= 18; px += 9) {
            const pCol = new THREE.Mesh(
              new THREE.CylinderGeometry(0.45, 0.45, 3.5, 8),
              mats.whiteMarble
            );
            pCol.position.set(px, 1.75, 0);
            blockGroup.add(pCol);
          }

          // 6-story apartment body above pilotis
          const aptBody = new THREE.Mesh(
            new THREE.BoxGeometry(44, 16, 14),
            superquadraMat
          );
          aptBody.position.y = 11.8;
          aptBody.castShadow = true;
          blockGroup.add(aptBody);

          // White concrete roof slab
          const roof = new THREE.Mesh(
            new THREE.BoxGeometry(45, 1.0, 15),
            mats.whiteMarble
          );
          roof.position.y = 20.2;
          blockGroup.add(roof);

          // Rotate slightly to follow wing curvature
          blockGroup.rotation.y = dir * (q * 0.015);
          wingsGroup.add(blockGroup);
        }
      }
    }

    terrainGroup.add(wingsGroup);
  }
  buildPlanoPilotoWings();

  // ==========================================================================
  // 5. CONTINUOUS TRACK RIBBON, CURBS, MARKINGS, STREET LAMPS, BOOSTS & ITEMS
  // ==========================================================================
  function buildTrackAndRoadside() {
    const trackGroup = new THREE.Group();
    trackGroup.name = 'EixoMonumentalRoad';
    scene.add(trackGroup);

    const samples = trackSpline.samples;
    const N = samples.length;
    const halfW = (trackSpline.roadWidth || ROAD_WIDTH) * 0.5;
    const curbW = 1.45;

    // Build custom indexed BufferGeometry for the continuous closed-loop road ribbon
    const roadPositions = new Float32Array((N + 1) * 2 * 3);
    const roadNormals = new Float32Array((N + 1) * 2 * 3);
    const roadUVs = new Float32Array((N + 1) * 2 * 2);
    const roadIndices = [];

    const curbPositions = new Float32Array((N + 1) * 4 * 3);
    const curbNormals = new Float32Array((N + 1) * 4 * 3);
    const curbUVs = new Float32Array((N + 1) * 4 * 2);
    const curbIndices = [];

    for (let i = 0; i <= N; i++) {
      const s = samples[i % N];
      const dist = i === N ? trackSpline.totalLength : s.distance;
      const p = s.point;
      const r = s.right;

      // Left and right asphalt edges
      const lx = p.x - r.x * halfW;
      const ly = p.y + 0.08;
      const lz = p.z - r.z * halfW;

      const rx = p.x + r.x * halfW;
      const ry = p.y + 0.08;
      const rz = p.z + r.z * halfW;

      const vIdx = i * 2;
      roadPositions[vIdx * 3] = lx;
      roadPositions[vIdx * 3 + 1] = ly;
      roadPositions[vIdx * 3 + 2] = lz;
      roadPositions[(vIdx + 1) * 3] = rx;
      roadPositions[(vIdx + 1) * 3 + 1] = ry;
      roadPositions[(vIdx + 1) * 3 + 2] = rz;

      roadNormals[vIdx * 3] = 0;
      roadNormals[vIdx * 3 + 1] = 1;
      roadNormals[vIdx * 3 + 2] = 0;
      roadNormals[(vIdx + 1) * 3] = 0;
      roadNormals[(vIdx + 1) * 3 + 1] = 1;
      roadNormals[(vIdx + 1) * 3 + 2] = 0;

      const vRepeat = dist / 18;
      roadUVs[vIdx * 2] = 0;
      roadUVs[vIdx * 2 + 1] = vRepeat;
      roadUVs[(vIdx + 1) * 2] = 1;
      roadUVs[(vIdx + 1) * 2 + 1] = vRepeat;

      if (i < N) {
        const a = i * 2;
        const b = a + 1;
        const c = (i + 1) * 2;
        const d = c + 1;
        roadIndices.push(a, c, b, b, c, d);
      }

      // Left & Right raised red/white racing curbs (zebras)
      const cIdx = i * 4;
      const lOutX = p.x - r.x * (halfW + curbW);
      const lOutZ = p.z - r.z * (halfW + curbW);
      const rOutX = p.x + r.x * (halfW + curbW);
      const rOutZ = p.z + r.z * (halfW + curbW);
      const cy = p.y + 0.16;

      // Left curb (inner, outer)
      curbPositions[cIdx * 3] = lOutX;
      curbPositions[cIdx * 3 + 1] = cy;
      curbPositions[cIdx * 3 + 2] = lOutZ;
      curbPositions[(cIdx + 1) * 3] = lx;
      curbPositions[(cIdx + 1) * 3 + 1] = cy;
      curbPositions[(cIdx + 1) * 3 + 2] = lz;

      // Right curb (inner, outer)
      curbPositions[(cIdx + 2) * 3] = rx;
      curbPositions[(cIdx + 2) * 3 + 1] = cy;
      curbPositions[(cIdx + 2) * 3 + 2] = rz;
      curbPositions[(cIdx + 3) * 3] = rOutX;
      curbPositions[(cIdx + 3) * 3 + 1] = cy;
      curbPositions[(cIdx + 3) * 3 + 2] = rOutZ;

      for (let k = 0; k < 4; k++) {
        curbNormals[(cIdx + k) * 3] = 0;
        curbNormals[(cIdx + k) * 3 + 1] = 1;
        curbNormals[(cIdx + k) * 3 + 2] = 0;
      }

      const curbV = dist / 6;
      curbUVs[cIdx * 2] = 0;
      curbUVs[cIdx * 2 + 1] = curbV;
      curbUVs[(cIdx + 1) * 2] = 1;
      curbUVs[(cIdx + 1) * 2 + 1] = curbV;
      curbUVs[(cIdx + 2) * 2] = 0;
      curbUVs[(cIdx + 2) * 2 + 1] = curbV;
      curbUVs[(cIdx + 3) * 2] = 1;
      curbUVs[(cIdx + 3) * 2 + 1] = curbV;

      if (i < N) {
        const L0 = i * 4;
        const L1 = L0 + 1;
        const L2 = (i + 1) * 4;
        const L3 = L2 + 1;
        curbIndices.push(L0, L2, L1, L1, L2, L3);

        const R0 = i * 4 + 2;
        const R1 = R0 + 1;
        const R2 = (i + 1) * 4 + 2;
        const R3 = R2 + 1;
        curbIndices.push(R0, R2, R1, R1, R2, R3);
      }
    }

    const roadGeom = new THREE.BufferGeometry();
    roadGeom.setAttribute('position', new THREE.BufferAttribute(roadPositions, 3));
    roadGeom.setAttribute('normal', new THREE.BufferAttribute(roadNormals, 3));
    roadGeom.setAttribute('uv', new THREE.BufferAttribute(roadUVs, 2));
    roadGeom.setIndex(roadIndices);

    const roadMat = new THREE.MeshStandardMaterial({
      map: textures.roadTex,
      roughness: 0.72,
      metalness: 0.1
    });
    const roadMesh = new THREE.Mesh(roadGeom, roadMat);
    roadMesh.receiveShadow = true;
    trackGroup.add(roadMesh);

    const curbGeom = new THREE.BufferGeometry();
    curbGeom.setAttribute('position', new THREE.BufferAttribute(curbPositions, 3));
    curbGeom.setAttribute('normal', new THREE.BufferAttribute(curbNormals, 3));
    curbGeom.setAttribute('uv', new THREE.BufferAttribute(curbUVs, 2));
    curbGeom.setIndex(curbIndices);

    const curbMat = new THREE.MeshStandardMaterial({
      map: textures.curbTex,
      roughness: 0.55
    });
    const curbMesh = new THREE.Mesh(curbGeom, curbMat);
    curbMesh.receiveShadow = true;
    trackGroup.add(curbMesh);

    // 5B. Asphalt Road Stencils ("EIXO MONUMENTAL / S1 / N1") & Crosswalks
    const s1DecalTex = createRoadTextDecal(THREE, 'EIXO MONUMENTAL', 'VIA S1 — LESTE ▶');
    const n1DecalTex = createRoadTextDecal(THREE, 'EIXO MONUMENTAL', '◀ VIA N1 — OESTE');
    const crosswalkTex = createRoadTextDecal(THREE, '', '', true);

    const decalFractions = [
      { f: 0.02, tex: s1DecalTex },
      { f: 0.14, tex: s1DecalTex },
      { f: 0.23, tex: crosswalkTex }, // Rodoviária crosswalk S1
      { f: 0.31, tex: s1DecalTex },
      { f: 0.38, tex: crosswalkTex }, // Esplanada crosswalk S1
      { f: 0.45, tex: crosswalkTex }, // Congresso crosswalk S1
      { f: 0.54, tex: crosswalkTex }, // Congresso crosswalk N1
      { f: 0.62, tex: n1DecalTex },
      { f: 0.72, tex: crosswalkTex }, // Rodoviária crosswalk N1
      { f: 0.84, tex: n1DecalTex }
    ];

    for (const d of decalFractions) {
      const s = trackSpline.getSampleAtFraction(d.f);
      const decalMat = new THREE.MeshBasicMaterial({
        map: d.tex,
        transparent: true,
        depthWrite: false
      });
      const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), decalMat);
      decalMesh.position.set(s.point.x, s.point.y + 0.14, s.point.z);
      const angle = Math.atan2(s.tangent.x, s.tangent.z);
      decalMesh.rotation.set(-Math.PI / 2, 0, -angle + Math.PI / 2);
      trackGroup.add(decalMesh);
    }

    // 5C. Start / Finish Line Gantry at samples[0]
    const s0 = samples[0];
    const startGantry = new THREE.Group();
    startGantry.position.copy(s0.point);
    const startAngle = Math.atan2(s0.tangent.x, s0.tangent.z);
    startGantry.rotation.y = startAngle;

    // Checkered asphalt strip
    const checkerCanvas = document.createElement('canvas');
    checkerCanvas.width = 256;
    checkerCanvas.height = 64;
    const chCtx = checkerCanvas.getContext('2d');
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 16; c++) {
        chCtx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#0f172a';
        chCtx.fillRect(c * 16, r * 16, 16, 16);
      }
    }
    const checkerTex = new THREE.CanvasTexture(checkerCanvas);
    const startLineMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_WIDTH, 4.5),
      new THREE.MeshBasicMaterial({ map: checkerTex })
    );
    startLineMesh.rotation.x = -Math.PI / 2;
    startLineMesh.position.y = 0.15;
    startGantry.add(startLineMesh);

    // Modernist Niemeyer curved white arch gantry over Start Line
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 12.5, 2.2),
        mats.whiteMarble
      );
      pillar.position.set(side * (halfW + 2.2), 6.25, 0);
      startGantry.add(pillar);
    }
    const bannerTex = createSignTexture(
      THREE,
      'BRASÍLIA KART 3D',
      'CIRCUITO EIXO MONUMENTAL — LARGADA',
      '#facc15',
      '#064e3b'
    );
    const bannerMat = new THREE.MeshStandardMaterial({
      map: bannerTex,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: bannerTex,
      emissiveIntensity: 0.45
    });
    animatedObjects.emissiveMaterials.push({
      mat: bannerMat,
      day: 0.35,
      sunset: 0.75,
      night: 1.2
    });
    const bannerBeam = new THREE.Mesh(new THREE.BoxGeometry(ROAD_WIDTH + 6, 3.8, 1.4), bannerMat);
    bannerBeam.position.set(0, 12.2, 0);
    startGantry.add(bannerBeam);
    trackGroup.add(startGantry);

    // 5D. Curved Modernist Brasília Street Lamps along the Track
    const lampBulbMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: new THREE.Color(0xfacc15),
      emissiveIntensity: 0.2
    });
    animatedObjects.streetLampBulbs.push(lampBulbMat);

    const lampStep = 22; // ~55 pairs of street lamps along the loop
    for (let i = 0; i < N; i += lampStep) {
      const s = samples[i];
      const angle = Math.atan2(s.tangent.x, s.tangent.z);

      for (const side of [-1, 1]) {
        const lampGroup = new THREE.Group();
        const lx = s.point.x + s.right.x * side * (halfW + 3.2);
        const lz = s.point.z + s.right.z * side * (halfW + 3.2);
        lampGroup.position.set(lx, s.point.y, lz);
        lampGroup.rotation.y = angle;

        // Vertical pole
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.26, 9.5, 8),
          mats.steelLattice
        );
        pole.position.y = 4.75;
        lampGroup.add(pole);

        // Curved horizontal cantilever arm reaching over the road
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.22, 0.22),
          mats.steelLattice
        );
        arm.position.set(-side * 1.4, 9.4, 0);
        arm.rotation.z = side * 0.18;
        lampGroup.add(arm);

        // Glowing LED fixture bulb
        const bulb = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.25, 0.55),
          lampBulbMat
        );
        bulb.position.set(-side * 2.7, 9.55, 0);
        lampGroup.add(bulb);

        trackGroup.add(lampGroup);
      }
    }

    // 5E. Interactive Turbo Boost Pads (`BOOST_PAD_FRACTIONS`)
    const boostMat = new THREE.MeshStandardMaterial({
      map: textures.boostTex,
      emissive: new THREE.Color(0x38bdf8),
      emissiveMap: textures.boostTex,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.94
    });

    for (let idx = 0; idx < BOOST_PAD_FRACTIONS.length; idx++) {
      const frac = BOOST_PAD_FRACTIONS[idx];
      const s = trackSpline.getSampleAtFraction(frac);
      const angle = Math.atan2(s.tangent.x, s.tangent.z);

      // Place 2 parallel boost strips across the road width so player can easily hit them
      const padGroup = new THREE.Group();
      padGroup.position.set(s.point.x, s.point.y + 0.14, s.point.z);
      padGroup.rotation.y = angle;

      for (const laneOffset of [-5.2, 5.2]) {
        const padMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 11.5), boostMat);
        padMesh.rotation.x = -Math.PI / 2;
        padMesh.position.set(laneOffset, 0.02, 0);
        padGroup.add(padMesh);
      }

      trackGroup.add(padGroup);
      boostPads.push({
        id: `boost_${idx}`,
        fraction: frac,
        position: s.point.clone(),
        tangent: s.tangent.clone(),
        radius: 11.5,
        mesh: padGroup
      });
    }

    // 5F. Floating Rotating Mario Kart Item Boxes (`ITEM_BOX_FRACTIONS`)
    const itemCubeMat = new THREE.MeshStandardMaterial({
      map: textures.itemBoxTex,
      roughness: 0.1,
      metalness: 0.3,
      emissive: new THREE.Color(0xc084fc),
      emissiveMap: textures.itemBoxTex,
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.92
    });

    for (let rIdx = 0; rIdx < ITEM_BOX_FRACTIONS.length; rIdx++) {
      const frac = ITEM_BOX_FRACTIONS[rIdx];
      const s = trackSpline.getSampleAtFraction(frac);
      const laneOffsets = [-7.8, -2.6, 2.6, 7.8];

      for (let cIdx = 0; cIdx < laneOffsets.length; cIdx++) {
        const offset = laneOffsets[cIdx];
        const bx = s.point.x + s.right.x * offset;
        const by = s.point.y + 1.85;
        const bz = s.point.z + s.right.z * offset;

        const boxHolder = new THREE.Group();
        boxHolder.position.set(bx, by, bz);

        const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.75, 1.75), itemCubeMat);
        boxHolder.add(cubeMesh);

        // Glowing wireframe crystal cage around item box
        const ringMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(1.45, 0),
          new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            wireframe: true,
            transparent: true,
            opacity: 0.45
          })
        );
        boxHolder.add(ringMesh);

        trackGroup.add(boxHolder);
        itemBoxes.push({
          id: `item_${rIdx}_${cIdx}`,
          fraction: frac,
          position: new THREE.Vector3(bx, by, bz),
          baseY: by,
          radius: 2.35,
          active: true,
          respawnTimer: 0,
          mesh: boxHolder,
          cube: cubeMesh,
          phase: rIdx * 0.9 + cIdx * 0.6
        });
      }
    }
  }
  buildTrackAndRoadside();

  // ==========================================================================
  // 6. EVERY SINGLE LANDMARK ALONG THE EIXO MONUMENTAL (WEST TO EAST)
  // ==========================================================================

  // --------------------------------------------------------------------------
  // 6.1 RODOFERROVIÁRIA DE BRASÍLIA (`X = -1545, Z = 0`) + WELCOME ARCH
  // --------------------------------------------------------------------------
  function buildRodoferroviaria() {
    const g = landmarkGroups.rodoferroviaria;
    const base = new THREE.Group();
    base.position.set(-1545, 0, 0);

    // Monumental Brutalist Horizontal Terminal Platform
    const mainHall = new THREE.Mesh(
      new THREE.BoxGeometry(44, 11, 130),
      mats.brutalistConcrete
    );
    mainHall.position.set(0, 5.5, 0);
    mainHall.castShadow = true;
    base.add(mainHall);

    // Long Cantilevered Brutalist Concrete Roof Slabs extending East and West
    const upperRoof = new THREE.Mesh(
      new THREE.BoxGeometry(68, 2.4, 156),
      mats.whiteMarble
    );
    upperRoof.position.set(4, 12.2, 0);
    upperRoof.castShadow = true;
    base.add(upperRoof);

    const mezzanineSlab = new THREE.Mesh(
      new THREE.BoxGeometry(58, 1.5, 144),
      mats.brutalistConcrete
    );
    mezzanineSlab.position.set(6, 7.2, 0);
    base.add(mezzanineSlab);

    // Glowing terminal concourse windows
    const hallGlass = new THREE.Mesh(
      new THREE.BoxGeometry(45.2, 5.2, 122),
      mats.towerGlass
    );
    hallGlass.position.set(0.5, 4.2, 0);
    base.add(hallGlass);

    // Brutalist Clock Tower rising at the north-east corner of the Rodoferroviária
    const clockTower = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 36, 7.5),
      mats.brutalistConcrete
    );
    clockTower.position.set(16, 18, -54);
    clockTower.castShadow = true;
    base.add(clockTower);

    const clockFace = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 8.0, 20),
      mats.goldAccent
    );
    clockFace.rotation.z = Math.PI / 2;
    clockFace.position.set(16, 31, -54);
    base.add(clockFace);

    // Colorful Articulated Buses parked at the East platforms
    const busColors = [0xf59e0b, 0x10b981, 0x3b82f6, 0xef4444, 0x8b5cf6];
    for (let b = 0; b < 5; b++) {
      const busZ = -48 + b * 24;
      const busGroup = new THREE.Group();
      busGroup.position.set(32, 1.8, busZ);

      const busBody = new THREE.Mesh(
        new THREE.BoxGeometry(13.5, 3.2, 3.4),
        new THREE.MeshStandardMaterial({ color: busColors[b], roughness: 0.3 })
      );
      busGroup.add(busBody);

      const windshield = new THREE.Mesh(
        new THREE.BoxGeometry(13.7, 1.3, 3.5),
        mats.ministryGlass
      );
      windshield.position.y = 0.5;
      busGroup.add(windshield);
      base.add(busGroup);
    }

    // Terminal Roof Sign
    const rodoSignTex = createSignTexture(
      THREE,
      'RODOFERROVIÁRIA DE BRASÍLIA',
      'MARCO ZERO OESTE — LÚCIO COSTA & SÉRGIO BERNARDES',
      '#f59e0b'
    );
    const rodoSign = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 7.5, 48),
      new THREE.MeshStandardMaterial({
        map: rodoSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: rodoSignTex,
        emissiveIntensity: 0.6
      })
    );
    rodoSign.position.set(34, 17.2, 0);
    base.add(rodoSign);
    g.add(base);

    // Monumental 3D Welcome Arch across the Western Turnaround ("BEM-VINDO A BRASÍLIA — EIXO MONUMENTAL")
    const welcomeArch = new THREE.Group();
    welcomeArch.position.set(-1445, 0, 0);
    for (const zSide of [-88, 88]) {
      const archPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.5, 22, 16),
        mats.whiteMarble
      );
      archPillar.position.set(0, 11, zSide);
      welcomeArch.add(archPillar);
    }
    const archBeam = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 3.0, 182),
      mats.whiteMarble
    );
    archBeam.position.set(0, 21.5, 0);
    welcomeArch.add(archBeam);

    const welcomeTex = createSignTexture(
      THREE,
      'BEM-VINDO A BRASÍLIA',
      'PATRIMÔNIO CULTURAL DA HUMANIDADE — EIXO MONUMENTAL',
      '#10b981',
      '#0f172a'
    );
    const welcomeSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 5.5, 64),
      new THREE.MeshStandardMaterial({
        map: welcomeTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: welcomeTex,
        emissiveIntensity: 0.55
      })
    );
    welcomeSign.position.set(0, 22.2, 0);
    welcomeArch.add(welcomeSign);
    g.add(welcomeArch);
  }
  buildRodoferroviaria();

  // --------------------------------------------------------------------------
  // 6.2 MEMORIAL JK (`X = -1180, Z = -5`)
  // --------------------------------------------------------------------------
  function buildMemorialJK() {
    const g = landmarkGroups.memorial_jk;
    const base = new THREE.Group();
    base.position.set(-1180, 0.5, -5);

    // Reflecting Pool around the Memorial
    addWaterPool(base, 88, 54, 0, 0.2, 0);

    // Raised Ceremonial Granite Plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(72, 2.2, 38),
      mats.brutalistConcrete
    );
    plinth.position.set(0, 1.1, 0);
    base.add(plinth);

    // Pure White Marble Modernist Trapezoid Mausoleum
    const mausoleum = new THREE.Mesh(
      new THREE.CylinderGeometry(16, 21, 9.5, 4),
      mats.whiteMarble
    );
    mausoleum.rotation.y = Math.PI / 4;
    mausoleum.scale.set(1.55, 1, 0.85);
    mausoleum.position.set(-4, 6.8, 0);
    mausoleum.castShadow = true;
    base.add(mausoleum);

    // Exterior Ceremonial White Ramps leading up the East facade
    const rampLeft = new THREE.Mesh(
      new THREE.BoxGeometry(22, 1.0, 3.6),
      mats.whiteMarble
    );
    rampLeft.position.set(18, 4.2, 11);
    rampLeft.rotation.z = -0.22;
    base.add(rampLeft);

    const rampRight = rampLeft.clone();
    rampRight.position.z = -11;
    base.add(rampRight);

    // Iconic 28m Vertical Sickle / Hood Shell Tower holding President JK Statue
    const towerGroup = new THREE.Group();
    towerGroup.position.set(20, 2.0, 0);

    const pedestalShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.4, 24, 20),
      mats.whiteMarble
    );
    pedestalShaft.position.y = 12;
    pedestalShaft.castShadow = true;
    towerGroup.add(pedestalShaft);

    // Curved Conch / Sickle Hood at the top of the tower
    const hoodShell = new THREE.Mesh(
      new THREE.SphereGeometry(5.6, 24, 20, 0, Math.PI),
      mats.whiteMarble
    );
    hoodShell.rotation.y = -Math.PI / 2;
    hoodShell.scale.set(1.0, 1.65, 0.85);
    hoodShell.position.set(-0.5, 25.5, 0);
    towerGroup.add(hoodShell);

    // Bronze Statue of President Juscelino Kubitschek waving from inside the shell
    const jkStatue = new THREE.Group();
    jkStatue.position.set(0.8, 23.2, 0);
    const jkTorso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.55, 3.6, 12),
      mats.bronze
    );
    jkTorso.position.y = 1.8;
    jkStatue.add(jkTorso);
    const jkHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), mats.bronze);
    jkHead.position.y = 4.1;
    jkStatue.add(jkHead);
    // Waving right arm
    const jkArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 2.2, 8),
      mats.bronze
    );
    jkArm.position.set(0, 3.6, 1.1);
    jkArm.rotation.x = -0.75;
    jkStatue.add(jkArm);
    towerGroup.add(jkStatue);

    base.add(towerGroup);

    // Signboard
    const jkSignTex = createSignTexture(
      THREE,
      'MEMORIAL JK',
      'OSCAR NIEMEYER (1981) — PRESIDENTE JUSCELINO KUBITSCHEK',
      '#fbbf24'
    );
    const jkSign = new THREE.Mesh(
      new THREE.BoxGeometry(22, 3.8, 0.8),
      new THREE.MeshStandardMaterial({
        map: jkSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: jkSignTex,
        emissiveIntensity: 0.5
      })
    );
    jkSign.position.set(0, 13.8, 16);
    base.add(jkSign);

    g.add(base);
  }
  buildMemorialJK();

  // --------------------------------------------------------------------------
  // 6.3 PARÓQUIA MILITAR RAINHA DA PAZ (`X = -965, Z = -122`)
  // --------------------------------------------------------------------------
  function buildRainhaDaPaz() {
    const g = landmarkGroups.rainha_da_paz;
    const base = new THREE.Group();
    base.position.set(-965, 2.0, -122);

    // Ceremonial Stone Plaza alongside Via N1
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(72, 1.0, 56),
      mats.brutalistConcrete
    );
    plaza.position.y = 0.5;
    base.add(plaza);

    // Oscar Niemeyer's Striking Triangular Tent Prism Church
    const tentGeom = new THREE.CylinderGeometry(0.5, 26, 28, 3);
    const tentMesh = new THREE.Mesh(tentGeom, mats.whiteMarble);
    tentMesh.position.set(0, 14.5, 0);
    tentMesh.scale.set(1.25, 1.0, 1.35);
    tentMesh.castShadow = true;
    base.add(tentMesh);

    // Glowing Stained-Glass Cross Slit on the facade facing Via N1
    const vSlit = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 19, 1.4),
      mats.stainedGlass
    );
    vSlit.position.set(0, 11, 14);
    vSlit.rotation.x = -0.38;
    base.add(vSlit);

    const hSlit = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 1.5, 1.4),
      mats.stainedGlass
    );
    hSlit.position.set(0, 14.5, 12.2);
    hSlit.rotation.x = -0.38;
    base.add(hSlit);

    // Standalone Modernist Bell Tower & Cross
    const bellTower = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 26, 2.2),
      mats.whiteMarble
    );
    bellTower.position.set(24, 13, 12);
    bellTower.castShadow = true;
    base.add(bellTower);

    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.8, 7.5, 0.8), mats.bronze);
    crossV.position.set(24, 29, 12);
    base.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, 0.8), mats.bronze);
    crossH.position.set(24, 30.2, 12);
    base.add(crossH);

    g.add(base);
  }
  buildRainhaDaPaz();

  // --------------------------------------------------------------------------
  // 6.4 PRAÇA DO CRUZEIRO & CRUZ DE BRASÍLIA (`X = -820, Z = 0`)
  // --------------------------------------------------------------------------
  function buildPracaDoCruzeiro() {
    const g = landmarkGroups.catedral_militar_cruz;
    const base = new THREE.Group();
    base.position.set(-820, 3.3, 0);

    // Stepped Elevated Stone Lookout Plaza (Highest point of Eixo Monumental: 1,172m)
    for (let step = 0; step < 4; step++) {
      const s = 54 - step * 10;
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(s, 1.1, s * 0.78),
        step % 2 === 0 ? mats.brutalistConcrete : mats.whiteMarble
      );
      slab.position.y = step * 1.1 + 0.55;
      base.add(slab);
    }

    // Monumental Cross of the First Mass of Brasília (1957)
    const crossGroup = new THREE.Group();
    crossGroup.position.set(0, 4.4, 0);

    const verticalBeam = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 26, 2.2),
      mats.bronze
    );
    verticalBeam.position.y = 13;
    verticalBeam.castShadow = true;
    crossGroup.add(verticalBeam);

    const horizontalBeam = new THREE.Mesh(
      new THREE.BoxGeometry(15, 2.2, 2.2),
      mats.bronze
    );
    horizontalBeam.position.y = 19.5;
    horizontalBeam.castShadow = true;
    crossGroup.add(horizontalBeam);

    // Golden halo ring at the cross intersection
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.3, 12, 28),
      mats.goldAccent
    );
    halo.position.y = 19.5;
    crossGroup.add(halo);
    base.add(crossGroup);

    // Panoramic Concrete Pergolas flanking the sunset viewpoint
    for (const zSide of [-16, 16]) {
      for (let px = -18; px <= 18; px += 9) {
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 6.5, 0.9),
          mats.whiteMarble
        );
        col.position.set(px, 5.2, zSide);
        base.add(col);
      }
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(40, 0.8, 2.4),
        mats.whiteMarble
      );
      beam.position.set(0, 8.6, zSide);
      base.add(beam);
    }

    g.add(base);
  }
  buildPracaDoCruzeiro();

  // --------------------------------------------------------------------------
  // 6.5 PLANETÁRIO DE BRASÍLIA, CENTRO DE CONVENÇÕES & ESTÁDIO MANÉ GARRINCHA
  // --------------------------------------------------------------------------
  function buildPlanetarioAndManeGarrincha() {
    const g = landmarkGroups.planetario_centro_convencoes;

    // 6.5A. Planetário de Brasília (Sérgio Bernardes' 16-sided Brutalist UFO Dome at X = -575, Z = -12)
    const planetario = new THREE.Group();
    planetario.position.set(-575, 2.0, -12);

    addWaterPool(planetario, 28, 28, 0, 0.2, 0, true);

    // Glowing Cyan Glass Ring Core
    const glassCore = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 15, 6.5, 16),
      mats.stainedGlass
    );
    glassCore.position.y = 3.5;
    planetario.add(glassCore);

    // Upper & Lower UFO Saucer Cones
    const upperSaucer = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 23, 6.5, 16),
      mats.whiteMarble
    );
    upperSaucer.position.y = 9.2;
    upperSaucer.castShadow = true;
    planetario.add(upperSaucer);

    const lowerSaucer = new THREE.Mesh(
      new THREE.CylinderGeometry(23, 12, 3.5, 16),
      mats.brutalistConcrete
    );
    lowerSaucer.position.y = 4.2;
    planetario.add(lowerSaucer);

    // 16 Angled Brutalist Structural Ribs radiating around the dome
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const ribGroup = new THREE.Group();
      ribGroup.rotation.y = a;

      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 10.5, 4.5),
        mats.whiteMarble
      );
      rib.position.set(0, 5.5, 19.5);
      rib.rotation.x = -0.35;
      ribGroup.add(rib);
      planetario.add(ribGroup);
    }
    g.add(planetario);

    // 6.5B. Centro de Convenções Ulysses Guimarães (`X = -565, Z = +22`)
    const convencoes = new THREE.Group();
    convencoes.position.set(-565, 2.0, 22);

    const convBody = new THREE.Mesh(
      new THREE.BoxGeometry(68, 9.5, 22),
      mats.ministryGlass
    );
    convBody.position.y = 5.0;
    convencoes.add(convBody);

    for (let h = 1; h <= 3; h++) {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(74 - h * 2, 1.3, 26 - h * 1.5),
        mats.whiteMarble
      );
      slab.position.y = h * 3.4;
      convencoes.add(slab);
    }
    g.add(convencoes);

    // 6.5C. Estádio Nacional Mané Garrincha (`X = -460, Z = -280`)
    // Massive circular white columned arena visible north-west of Torre de TV!
    const stadium = new THREE.Group();
    stadium.position.set(-460, 0, -280);

    // Outer white bowl & inner pitch glow
    const bowlInner = new THREE.Mesh(
      new THREE.CylinderGeometry(118, 96, 38, 48),
      mats.towerGlass
    );
    bowlInner.position.y = 19;
    stadium.add(bowlInner);

    // 48 Monumental Slender White Columns encircling the stadium facade
    const numCols = 48;
    for (let i = 0; i < numCols; i++) {
      const a = (i / numCols) * Math.PI * 2;
      const cx = Math.cos(a) * 130;
      const cz = Math.sin(a) * 130;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.6, 44, 10),
        mats.whiteMarble
      );
      col.position.set(cx, 22, cz);
      stadium.add(col);
    }

    // Compression Ring Roof Canopy
    const stadiumRoof = new THREE.Mesh(
      new THREE.TorusGeometry(118, 16, 16, 48),
      mats.whiteMarble
    );
    stadiumRoof.rotation.x = Math.PI / 2;
    stadiumRoof.scale.set(1, 1, 0.25);
    stadiumRoof.position.y = 43.5;
    stadium.add(stadiumRoof);

    // Sign facing Via N1
    const stadSignTex = createSignTexture(
      THREE,
      'ARENA BRB MANÉ GARRINCHA',
      'ESTÁDIO NACIONAL DE BRASÍLIA — 72.000 LUGARES',
      '#22c55e'
    );
    const stadSign = new THREE.Mesh(
      new THREE.BoxGeometry(58, 7.5, 2.0),
      new THREE.MeshStandardMaterial({
        map: stadSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: stadSignTex,
        emissiveIntensity: 0.65
      })
    );
    stadSign.position.set(0, 48, 122);
    stadium.add(stadSign);

    g.add(stadium);
  }
  buildPlanetarioAndManeGarrincha();

  // --------------------------------------------------------------------------
  // 6.6 TORRE DE TV DE BRASÍLIA, FONTE LUMINOSA & "EU ❤️ BRASÍLIA" (`X = -210, Z = 0`)
  // --------------------------------------------------------------------------
  function buildTorreDeTV() {
    const g = landmarkGroups.torre_de_tv;
    const base = new THREE.Group();
    base.position.set(-210, 0.5, 0);

    // 6.6A. Brutalist 3-Legged Concrete V-Base (25m tall concrete tripod)
    const tripodBase = new THREE.Mesh(
      new THREE.CylinderGeometry(9.5, 17, 26, 3),
      mats.brutalistConcrete
    );
    tripodBase.position.y = 13;
    tripodBase.castShadow = true;
    base.add(tripodBase);

    // Glass Panoramic Mirante Lookout Platform at height Y = 28
    const mirantePod = new THREE.Mesh(
      new THREE.CylinderGeometry(14.5, 12.5, 5.5, 6),
      mats.ministryGlass
    );
    mirantePod.position.y = 28;
    base.add(mirantePod);

    const miranteRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(15.5, 15.5, 1.2, 6),
      mats.whiteMarble
    );
    miranteRoof.position.y = 31.2;
    base.add(miranteRoof);

    // 6.6B. Towering 150-unit Metallic Lattice Tower & Red Aviation Beacon
    const latticeTiers = [
      { y: 52, rBot: 8.5, rTop: 5.5, h: 42 },
      { y: 92, rBot: 5.5, rTop: 2.8, h: 38 },
      { y: 126, rBot: 2.8, rTop: 0.9, h: 30 }
    ];
    for (const tier of latticeTiers) {
      // Solid inner structural core
      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(tier.rTop * 0.65, tier.rBot * 0.65, tier.h, 6),
        mats.steelLattice
      );
      core.position.y = tier.y;
      core.castShadow = true;
      base.add(core);

      // Outer metallic lattice truss cage
      const cage = new THREE.Mesh(
        new THREE.CylinderGeometry(tier.rTop, tier.rBot, tier.h, 6, 6, true),
        new THREE.MeshStandardMaterial({
          color: 0xcbd5e1,
          wireframe: true,
          roughness: 0.3,
          metalness: 0.85
        })
      );
      cage.position.y = tier.y;
      base.add(cage);
    }

    // Antenna mast & Glowing Red Beacon at Y = 152
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.7, 16, 8),
      mats.whiteMarble
    );
    antenna.position.y = 148;
    base.add(antenna);

    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: new THREE.Color(0xff0000),
      emissiveIntensity: 1.8
    });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(1.8, 12, 12), beaconMat);
    beacon.position.y = 156.5;
    base.add(beacon);

    // 6.6C. Fonte Luminosa da Torre de TV (East of Tower, X = +46 relative -> world X = -164)
    addWaterPool(base, 26, 26, 48, 0.2, 0, true);

    const jetMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.82
    });
    // Central high geyser jet + 12 ring jets
    for (let j = 0; j < 13; j++) {
      const isCenter = j === 0;
      const angle = ((j - 1) / 12) * Math.PI * 2;
      const rad = isCenter ? 0 : 12.5;
      const jx = 48 + Math.cos(angle) * rad;
      const jz = Math.sin(angle) * rad;
      const maxH = isCenter ? 26 : 14;

      const jetMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(isCenter ? 1.4 : 0.7, isCenter ? 0.5 : 0.3, 1, 10),
        jetMat
      );
      jetMesh.position.set(jx, 5, jz);
      base.add(jetMesh);
      animatedObjects.fountainJets.push({
        mesh: jetMesh,
        baseX: jx,
        baseZ: jz,
        maxH,
        phase: j * 0.55
      });
    }

    // 6.6D. Colorful "EU ❤️ BRASÍLIA" 3D Sculpture Sign facing the track
    const euAmoGroup = new THREE.Group();
    euAmoGroup.position.set(48, 0.5, 29);

    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(28, 1.2, 3.2),
      mats.whiteMarble
    );
    pedestal.position.y = 0.6;
    euAmoGroup.add(pedestal);

    // 3D Heart Sculpture in the center
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: new THREE.Color(0xdc2626),
      emissiveIntensity: 0.45,
      roughness: 0.2
    });
    const heartL = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 16), heartMat);
    heartL.position.set(-7.2, 3.6, 0);
    euAmoGroup.add(heartL);
    const heartR = new THREE.Mesh(new THREE.SphereGeometry(1.7, 16, 16), heartMat);
    heartR.position.set(-5.0, 3.6, 0);
    euAmoGroup.add(heartR);
    const heartBot = new THREE.Mesh(new THREE.ConeGeometry(2.7, 3.2, 16), heartMat);
    heartBot.rotation.x = Math.PI;
    heartBot.position.set(-6.1, 2.2, 0);
    euAmoGroup.add(heartBot);

    // Crisp 3D Letter Blocks for "EU" and "BRASÍLIA"
    const euAmoTex = createSignTexture(
      THREE,
      'EU ❤️ BRASÍLIA',
      'TORRE DE TV & FONTE LUMINOSA',
      '#ef4444',
      '#1e1b4b'
    );
    const euAmoBoard = new THREE.Mesh(
      new THREE.BoxGeometry(26, 4.4, 1.4),
      new THREE.MeshStandardMaterial({
        map: euAmoTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: euAmoTex,
        emissiveIntensity: 0.65
      })
    );
    euAmoBoard.position.set(0, 3.4, -1.2);
    euAmoGroup.add(euAmoBoard);
    base.add(euAmoGroup);

    // 6.6E. Feirinha da Torre Pavilions (West of Tower, X = -42 relative)
    const stallColors = [0xf97316, 0x06b6d4, 0xeab308, 0xec4899, 0x10b981, 0x8b5cf6];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const sx = -32 - r * 14;
        const sz = -21 + c * 14;
        const stall = new THREE.Group();
        stall.position.set(sx, 0, sz);

        const booth = new THREE.Mesh(
          new THREE.BoxGeometry(8, 3.2, 8),
          mats.whiteMarble
        );
        booth.position.y = 1.6;
        stall.add(booth);

        const canopy = new THREE.Mesh(
          new THREE.ConeGeometry(6.8, 3.2, 4),
          new THREE.MeshStandardMaterial({
            color: stallColors[(r * 4 + c) % stallColors.length],
            roughness: 0.4
          })
        );
        canopy.rotation.y = Math.PI / 4;
        canopy.position.y = 4.8;
        stall.add(canopy);
        base.add(stall);
      }
    }

    g.add(base);
  }
  buildTorreDeTV();

  // --------------------------------------------------------------------------
  // 6.7 RODOVIÁRIA DO PLANO PILOTO (`X = +95, Z = 0`) & TEATRO NACIONAL (`X = +240, Z = -115`)
  // --------------------------------------------------------------------------
  function buildRodoviariaAndTeatroNacional() {
    const g = landmarkGroups.rodoviaria_plano_piloto;

    // 6.7A. Rodoviária do Plano Piloto (Upper & Lower Viaduct Decks at X = +95, Z = 0)
    const rodo = new THREE.Group();
    rodo.position.set(95, 0, 0);

    // Central Bus Terminal Concourse & Glowing Bus Bays
    const lowerTerminal = new THREE.Mesh(
      new THREE.BoxGeometry(64, 5.2, 74),
      mats.towerGlass
    );
    lowerTerminal.position.y = 2.6;
    rodo.add(lowerTerminal);

    // Sweeping Upper Viaduct Platform connecting Asa Sul and Asa Norte across the Gramado Central
    const upperViaduct = new THREE.Mesh(
      new THREE.BoxGeometry(72, 2.2, 92),
      mats.whiteMarble
    );
    upperViaduct.position.y = 6.3;
    upperViaduct.castShadow = true;
    rodo.add(upperViaduct);

    // Overpass Bridges spanning cleanly over Via S1 (Z = +62) and Via N1 (Z = -62)
    // Clearance height Y = 8.5m so karts drive right underneath the Eixão bridges!
    for (const zBridge of [-62, 62]) {
      const overpassDeck = new THREE.Mesh(
        new THREE.BoxGeometry(36, 1.8, 42),
        mats.whiteMarble
      );
      overpassDeck.position.set(0, 8.8, zBridge);
      overpassDeck.castShadow = true;
      rodo.add(overpassDeck);

      // Bridge support piers flanking the track curbs
      for (const zPier of [zBridge - 18, zBridge + 18]) {
        for (const xPier of [-12, 12]) {
          const pier = new THREE.Mesh(
            new THREE.CylinderGeometry(1.3, 1.5, 8.5, 12),
            mats.brutalistConcrete
          );
          pier.position.set(xPier, 4.25, zPier);
          rodo.add(pier);
        }
      }
    }

    // Rodoviária Illuminated Sign
    const rodoSignTex = createSignTexture(
      THREE,
      'RODOVIÁRIA DO PLANO PILOTO',
      'CRUZAMENTO EIXO MONUMENTAL × EIXÃO ASA SUL / ASA NORTE',
      '#10b981'
    );
    const rodoSign = new THREE.Mesh(
      new THREE.BoxGeometry(44, 5.0, 1.5),
      new THREE.MeshStandardMaterial({
        map: rodoSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: rodoSignTex,
        emissiveIntensity: 0.65
      })
    );
    rodoSign.position.set(0, 11.2, 44);
    rodo.add(rodoSign);
    g.add(rodo);

    // 6.7B. Teatro Nacional Cláudio Santoro (`X = +240, Z = -115`)
    // Oscar Niemeyer's iconic Truncated Aztec Pyramid covered in Athos Bulcão relief cubes!
    const teatro = new THREE.Group();
    teatro.position.set(240, 0, -115);

    const pyramidGeom = new THREE.CylinderGeometry(20, 38, 28, 4);
    const pyramidMesh = new THREE.Mesh(pyramidGeom, mats.athosRelief);
    pyramidMesh.rotation.y = Math.PI / 4;
    pyramidMesh.scale.set(1.35, 1.0, 0.95);
    pyramidMesh.position.y = 14;
    pyramidMesh.castShadow = true;
    teatro.add(pyramidMesh);

    // Glass entrance foyer facing the Eixo
    const foyer = new THREE.Mesh(
      new THREE.BoxGeometry(36, 4.8, 12),
      mats.ministryGlass
    );
    foyer.position.set(0, 2.4, 24);
    teatro.add(foyer);

    const teatroSignTex = createSignTexture(
      THREE,
      'TEATRO NACIONAL CLÁUDIO SANTORO',
      'OSCAR NIEMEYER & RELEVOS DE ATHOS BULCÃO',
      '#f59e0b'
    );
    const teatroSign = new THREE.Mesh(
      new THREE.BoxGeometry(32, 4.2, 1.0),
      new THREE.MeshStandardMaterial({
        map: teatroSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: teatroSignTex,
        emissiveIntensity: 0.55
      })
    );
    teatroSign.position.set(0, 30.5, 0);
    teatro.add(teatroSign);

    g.add(teatro);
  }
  buildRodoviariaAndTeatroNacional();

  // --------------------------------------------------------------------------
  // 6.8 MUSEU NACIONAL DA REPÚBLICA & BIBLIOTECA NACIONAL (`X = +435, Z = +122`)
  // --------------------------------------------------------------------------
  function buildComplexoCulturalRepublica() {
    const g = landmarkGroups.complexo_cultural_republica;
    const base = new THREE.Group();
    base.position.set(435, 0, 122);

    // Expansive White Modernist Plaza
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(135, 0.6, 84),
      mats.whiteMarble
    );
    plaza.position.set(-18, 0.3, 0);
    base.add(plaza);

    // Pure-White Hemisphere Dome of the Museu Nacional da República
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(28, 36, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      mats.whiteMarble
    );
    dome.position.set(16, 0.5, 0);
    dome.castShadow = true;
    base.add(dome);

    // Dramatic Floating Curved Planetary Ramp / Ring ("Anel de Saturno")
    const ringRamp = new THREE.Mesh(
      new THREE.TorusGeometry(33.5, 2.3, 14, 48),
      mats.whiteMarble
    );
    ringRamp.rotation.x = Math.PI / 2 + 0.14;
    ringRamp.rotation.y = -0.1;
    ringRamp.scale.set(1.08, 1.0, 0.42);
    ringRamp.position.set(16, 11.5, 0);
    ringRamp.castShadow = true;
    base.add(ringRamp);

    // sweeping exterior promenade ramp leading from the plaza into the dome
    const entryRamp = new THREE.Mesh(
      new THREE.BoxGeometry(24, 1.2, 4.6),
      mats.whiteMarble
    );
    entryRamp.position.set(-8, 6.0, -24);
    entryRamp.rotation.z = 0.24;
    base.add(entryRamp);

    // Biblioteca Nacional Leonel de Moura Brizola & Reflecting Pool (West side of the plaza)
    addWaterPool(base, 48, 32, -48, 0.65, -14);

    const biblioteca = new THREE.Mesh(
      new THREE.BoxGeometry(46, 16, 26),
      mats.whiteMarble
    );
    biblioteca.position.set(-48, 9.5, 14);
    biblioteca.castShadow = true;
    base.add(biblioteca);

    const bibGlass = new THREE.Mesh(
      new THREE.BoxGeometry(44, 11, 27),
      mats.ministryGlass
    );
    bibGlass.position.set(-48, 9.0, 14);
    base.add(bibGlass);

    g.add(base);
  }
  buildComplexoCulturalRepublica();

  // --------------------------------------------------------------------------
  // 6.9 CATEDRAL METROPOLITANA NOSSA SENHORA APARECIDA (`X = +625, Z = +125`)
  // --------------------------------------------------------------------------
  function buildCatedralBrasilia() {
    const g = landmarkGroups.catedral_brasilia;
    const base = new THREE.Group();
    base.position.set(625, 0, 125);

    // Circular Water Moat (Espelho d'Água da Catedral)
    addWaterPool(base, 36, 36, 0, 0.25, 0, true);

    // Inner Glowing Stained-Glass Cone (Marianne Peretti's blue/turquoise/emerald ceiling)
    const vitralCone = new THREE.Mesh(
      new THREE.CylinderGeometry(8.5, 25.5, 25, 16, 1, true),
      mats.stainedGlass
    );
    vitralCone.position.y = 13;
    base.add(vitralCone);

    // 16 Curved Hyperbolic White Concrete Boomerang Columns rising into a crown
    const colCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(27, 0, 0),
      new THREE.Vector3(17, 11, 0),
      new THREE.Vector3(8.5, 22, 0),
      new THREE.Vector3(14.5, 31, 0),
      new THREE.Vector3(18.5, 35, 0)
    ]);
    const colTubeGeom = new THREE.TubeGeometry(colCurve, 20, 1.15, 8, false);

    for (let i = 0; i < 16; i++) {
      const colMesh = new THREE.Mesh(colTubeGeom, mats.whiteMarble);
      colMesh.rotation.y = (i / 16) * Math.PI * 2;
      colMesh.castShadow = true;
      base.add(colMesh);
    }

    // Crown Compression Ring & Cathedral Cross at the Apex
    const crownRing = new THREE.Mesh(
      new THREE.TorusGeometry(9.2, 0.85, 12, 32),
      mats.whiteMarble
    );
    crownRing.rotation.x = Math.PI / 2;
    crownRing.position.y = 24.5;
    base.add(crownRing);

    const apexCrossV = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 8.5, 8),
      mats.goldAccent
    );
    apexCrossV.position.y = 38.5;
    base.add(apexCrossV);
    const apexCrossH = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.6, 0.6),
      mats.goldAccent
    );
    apexCrossH.position.y = 39.8;
    base.add(apexCrossH);

    // The 4 Bronze Evangelist Statues by Alfredo Ceschiatti along the North entrance path
    for (let e = 0; e < 4; e++) {
      const ex = (e % 2 === 0 ? -1 : 1) * 5.5;
      const ez = -33 - Math.floor(e / 2) * 8.5;
      const evGroup = new THREE.Group();
      evGroup.position.set(ex, 0, ez);

      const ped = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 1.5, 2.0),
        mats.brutalistConcrete
      );
      ped.position.y = 0.75;
      evGroup.add(ped);

      const statue = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.75, 4.2, 10),
        mats.bronze
      );
      statue.position.y = 3.6;
      evGroup.add(statue);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), mats.bronze);
      head.position.y = 6.1;
      evGroup.add(head);
      base.add(evGroup);
    }

    // Ovoid Baptistery Dome (West of the Cathedral)
    const baptistery = new THREE.Mesh(
      new THREE.SphereGeometry(8.5, 24, 20),
      mats.whiteMarble
    );
    baptistery.scale.set(1.15, 0.85, 1.15);
    baptistery.position.set(-34, 4.5, -10);
    base.add(baptistery);

    // Standalone Modernist Bell Tower (Campanário) with 4 Bronze Bells (East of the Cathedral)
    const campanario = new THREE.Group();
    campanario.position.set(34, 0, -18);
    const campPillar = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 25, 1.8),
      mats.whiteMarble
    );
    campPillar.position.y = 12.5;
    campanario.add(campPillar);

    for (let b = 0; b < 4; b++) {
      const bell = new THREE.Mesh(
        new THREE.ConeGeometry(1.3 - b * 0.12, 2.0, 12),
        mats.bronze
      );
      bell.position.set((b % 2 === 0 ? -1 : 1) * 2.4, 13 + b * 2.8, 0);
      campanario.add(bell);
    }
    base.add(campanario);

    g.add(base);
  }
  buildCatedralBrasilia();

  // --------------------------------------------------------------------------
  // 6.10 ESPLANADA DOS MINISTÉRIOS (17 MINISTRIES + ITAMARATY + PALÁCIO DA JUSTIÇA)
  // --------------------------------------------------------------------------
  function buildEsplanadaMinisterios() {
    const g = landmarkGroups.esplanada_ministerios;

    for (const min of MINISTRIES) {
      if (min.isPalace === 'itamaraty') {
        buildPalacioItamaraty(g, min);
      } else if (min.isPalace === 'justica') {
        buildPalacioDaJustica(g, min);
      } else {
        buildMinistryBlock(g, min);
      }
    }
  }

  // Standard Modernist Ministry Building on Pilotis with Crisp Readable 3D Roof Sign
  function buildMinistryBlock(parentGroup, min) {
    const bGroup = new THREE.Group();
    bGroup.position.set(min.x, 0, min.z);

    // White concrete pilotis ground-floor columns (8 pairs)
    for (let px = -16; px <= 16; px += 4.5) {
      for (const pz of [-4.2, 4.2]) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.55, 0.55, 4.5, 10),
          mats.whiteMarble
        );
        col.position.set(px, 2.25, pz);
        bGroup.add(col);
      }
    }

    // First-floor horizontal pilotis slab
    const floorSlab = new THREE.Mesh(
      new THREE.BoxGeometry(39, 1.1, 14.5),
      mats.whiteMarble
    );
    floorSlab.position.y = 4.6;
    bGroup.add(floorSlab);

    // 8-story Modernist Green-Tinted Glass Curtain Wall Prism
    const glassBody = new THREE.Mesh(
      new THREE.BoxGeometry(37.5, 22, 13.2),
      mats.ministryGlass
    );
    glassBody.position.y = 16.0;
    glassBody.castShadow = true;
    bGroup.add(glassBody);

    // White Marble Brise-Soleil End Walls (East & West Gables)
    for (const endX of [-18.9, 18.9]) {
      const endWall = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 23.2, 14.2),
        mats.whiteMarble
      );
      endWall.position.set(endX, 16.2, 0);
      bGroup.add(endWall);
    }

    // Roof Overhang Slab
    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(40, 1.3, 15.2),
      mats.whiteMarble
    );
    roofSlab.position.y = 27.6;
    bGroup.add(roofSlab);

    // Lower Connecting Annex Building behind each Ministry
    const annexZ = min.side === 'north' ? -18 : 18;
    const annex = new THREE.Mesh(
      new THREE.BoxGeometry(34, 9.5, 14),
      mats.brutalistConcrete
    );
    annex.position.set(0, 4.75, annexZ);
    bGroup.add(annex);

    // LARGE CRISP 3D ROOF SIGNBOARD showing exact Ministry Name & Block Code
    // Readable from both Via S1 and Via N1!
    const signTex = createSignTexture(
      THREE,
      min.name.toUpperCase(),
      `ESPLANADA DOS MINISTÉRIOS — ${min.code}`,
      min.accent
    );
    const signMat = new THREE.MeshStandardMaterial({
      map: signTex,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: signTex,
      emissiveIntensity: 0.72
    });
    animatedObjects.emissiveMaterials.push({
      mat: signMat,
      day: 0.45,
      sunset: 0.95,
      night: 1.45
    });

    const signZ = min.side === 'north' ? 5.5 : -5.5;
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(36, 7.2, 1.5), signMat);
    signBoard.position.set(0, 32.0, signZ);
    bGroup.add(signBoard);

    // Accent Neon Pillar Strip facing the road
    const accentStrip = new THREE.Mesh(
      new THREE.BoxGeometry(38, 0.7, 0.8),
      new THREE.MeshStandardMaterial({
        color: min.accent,
        emissive: new THREE.Color(min.accent),
        emissiveIntensity: 0.9
      })
    );
    accentStrip.position.set(0, 28.3, signZ);
    bGroup.add(accentStrip);

    parentGroup.add(bGroup);
  }

  // Palácio do Itamaraty (`X = +1295, Z = +116`) — Arcos do Itamaraty & Escultura Meteoro
  function buildPalacioItamaraty(parentGroup, min) {
    const itamaraty = new THREE.Group();
    itamaraty.position.set(min.x, 0, min.z);

    // Broad Reflecting Pool with Lush Tropical Islands
    addWaterPool(itamaraty, 76, 56, 0, 0.25, -4);

    // Inner Glass Box of the Palace
    const glassBox = new THREE.Mesh(
      new THREE.BoxGeometry(48, 15.5, 36),
      mats.ministryGlass
    );
    glassBox.position.set(0, 8.2, 2);
    itamaraty.add(glassBox);

    // Roof & Base Slabs
    const baseSlab = new THREE.Mesh(
      new THREE.BoxGeometry(58, 1.4, 44),
      mats.whiteMarble
    );
    baseSlab.position.set(0, 0.7, 2);
    itamaraty.add(baseSlab);

    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(60, 1.8, 46),
      mats.whiteMarble
    );
    roofSlab.position.set(0, 16.8, 2);
    roofSlab.castShadow = true;
    itamaraty.add(roofSlab);

    // Iconic Rhythmic Concrete Perimeter Columns & Arches (Arcos do Itamaraty)
    for (let ix = -27; ix <= 27; ix += 6) {
      for (const iz of [-19, 23]) {
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 15.5, 1.6),
          mats.whiteMarble
        );
        col.position.set(ix, 8.2, iz);
        itamaraty.add(col);

        if (ix < 27) {
          const archTop = new THREE.Mesh(
            new THREE.CylinderGeometry(3.0, 3.0, 1.6, 12, 1, false, 0, Math.PI),
            mats.whiteMarble
          );
          archTop.rotation.x = Math.PI / 2;
          archTop.rotation.y = Math.PI / 2;
          archTop.position.set(ix + 3.0, 13.8, iz);
          itamaraty.add(archTop);
        }
      }
    }

    // Bruno Giorgi's White Marble "Meteoro" Sculpture floating on the reflecting pool
    const meteoroGroup = new THREE.Group();
    meteoroGroup.position.set(0, 3.2, -24);

    const meteoroPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.6, 3.2, 12),
      mats.brutalistConcrete
    );
    meteoroPedestal.position.y = -1.4;
    meteoroGroup.add(meteoroPedestal);

    const meteoroCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 1),
      mats.whiteMarble
    );
    meteoroGroup.add(meteoroCore);

    for (let r = 0; r < 3; r++) {
      const shellRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.8, 0.55, 10, 24),
        mats.whiteMarble
      );
      shellRing.rotation.set(r * 1.1, r * 0.8, 0);
      meteoroGroup.add(shellRing);
    }
    itamaraty.add(meteoroGroup);
    animatedObjects.spinningSculptures.push(meteoroCore);

    // Palace Signboard
    const signTex = createSignTexture(
      THREE,
      'PALÁCIO DO ITAMARATY',
      'MINISTÉRIO DAS RELAÇÕES EXTERIORES — ESCULTURA METEORO',
      '#fbbf24'
    );
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(46, 6.2, 1.4),
      new THREE.MeshStandardMaterial({
        map: signTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: signTex,
        emissiveIntensity: 0.7
      })
    );
    signBoard.position.set(0, 21.2, -18);
    itamaraty.add(signBoard);

    parentGroup.add(itamaraty);
  }

  // Palácio da Justiça (`X = +1295, Z = -114`) — Vertical Arches & Cascading Waterfalls
  function buildPalacioDaJustica(parentGroup, min) {
    const justica = new THREE.Group();
    justica.position.set(min.x, 0, min.z);

    // Reflecting Pool in front (South side facing Via N1)
    addWaterPool(justica, 72, 52, 0, 0.25, 4);

    const glassBox = new THREE.Mesh(
      new THREE.BoxGeometry(50, 16, 34),
      mats.ministryGlass
    );
    glassBox.position.set(0, 8.5, -2);
    justica.add(glassBox);

    const roofSlab = new THREE.Mesh(
      new THREE.BoxGeometry(58, 1.8, 42),
      mats.whiteMarble
    );
    roofSlab.position.set(0, 17.2, -2);
    justica.add(roofSlab);

    // Rhythmic Gothic-Modernist Vertical Arches on the facade
    for (let jx = -24; jx <= 24; jx += 4.8) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 16.5, 2.2),
        mats.whiteMarble
      );
      pillar.position.set(jx, 8.5, 16.5);
      justica.add(pillar);
    }

    // Protruding Concrete Water-Curtain Spouts pouring Animated Waterfalls into the pool!
    const waterfallMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.82
    });
    const spoutHeights = [6.5, 10.2, 8.0, 11.5, 7.2];
    for (let s = 0; s < 5; s++) {
      const sx = -16 + s * 8;
      const sh = spoutHeights[s];

      // Concrete trough shelf
      const spout = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.9, 6.5),
        mats.whiteMarble
      );
      spout.position.set(sx, sh, 19.5);
      justica.add(spout);

      // Animated cascading water column
      const cascade = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, sh, 0.55),
        waterfallMat
      );
      cascade.position.set(sx, sh / 2, 22.4);
      justica.add(cascade);
      animatedObjects.waterfalls.push({
        mesh: cascade,
        baseH: sh,
        phase: s * 0.9
      });
    }

    // Palace Signboard
    const signTex = createSignTexture(
      THREE,
      'PALÁCIO DA JUSTIÇA',
      'OSCAR NIEMEYER — ARCOS E CASCATAS MONUMENTAIS',
      '#0ea5e9'
    );
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(46, 6.2, 1.4),
      new THREE.MeshStandardMaterial({
        map: signTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: signTex,
        emissiveIntensity: 0.7
      })
    );
    signBoard.position.set(0, 21.4, 16);
    justica.add(signBoard);

    parentGroup.add(justica);
  }

  buildEsplanadaMinisterios();

  // --------------------------------------------------------------------------
  // 6.11 CONGRESSO NACIONAL, PRAÇA DOS TRÊS PODERES & PONTE JK (`X = +1435..1950`)
  // --------------------------------------------------------------------------
  function buildCongressoAndTresPoderes() {
    const g = landmarkGroups.congresso_nacional;

    // ========================================================================
    // A. CONGRESSO NACIONAL (`X = +1435, Z = 0`)
    // ========================================================================
    const congresso = new THREE.Group();
    congresso.position.set(1435, 0, 0);

    // Grand Reflecting Pool (Espelho d'Água do Congresso)
    addWaterPool(congresso, 52, 118, -52, 0.25, 0);

    // Long Horizontal White Travertine Marble Platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(42, 7.5, 128),
      mats.whiteMarble
    );
    platform.position.set(0, 3.75, 0);
    platform.castShadow = true;
    platform.receiveShadow = true;
    congresso.add(platform);

    // Recessed Glass Facade Strip along the Platform
    const platformGlass = new THREE.Mesh(
      new THREE.BoxGeometry(42.6, 3.8, 122),
      mats.ministryGlass
    );
    platformGlass.position.set(0, 3.8, 0);
    congresso.add(platformGlass);

    // 1. Concave Dome of the Senado Federal (North side, Z = -36)
    const senadoDome = new THREE.Mesh(
      new THREE.SphereGeometry(20, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      mats.whiteMarble
    );
    senadoDome.scale.set(1.0, 0.65, 1.0);
    senadoDome.position.set(0, 7.4, -36);
    senadoDome.castShadow = true;
    congresso.add(senadoDome);

    // 2. Convex Bowl of the Câmara dos Deputados (South side, Z = +36)
    const camaraBowlGroup = new THREE.Group();
    camaraBowlGroup.position.set(0, 7.5, 36);

    const camaraOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(24, 15, 9.5, 40),
      mats.whiteMarble
    );
    camaraOuter.position.y = 4.75;
    camaraOuter.castShadow = true;
    camaraBowlGroup.add(camaraOuter);

    const camaraInner = new THREE.Mesh(
      new THREE.CylinderGeometry(21.5, 14, 2.2, 36),
      mats.brutalistConcrete
    );
    camaraInner.position.y = 8.8;
    camaraBowlGroup.add(camaraInner);
    congresso.add(camaraBowlGroup);

    // 3. Twin 28-Story Anexo I Towers rising between the domes (`X = +1435, Z = ±7.8`)
    const towerH = 98;
    for (const zTower of [-7.8, 7.8]) {
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(20, towerH, 11.2),
        mats.towerGlass
      );
      tower.position.set(0, 7.5 + towerH / 2, zTower);
      tower.castShadow = true;
      congresso.add(tower);

      // White Marble East/West Gable Slabs
      for (const xEnd of [-10.2, 10.2]) {
        const gable = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, towerH + 0.5, 11.6),
          mats.whiteMarble
        );
        gable.position.set(xEnd, 7.5 + towerH / 2, zTower);
        congresso.add(gable);
      }
    }

    // Pentagonal H-Bridge connecting the twin towers at mid-upper height
    const connectorBridge = new THREE.Mesh(
      new THREE.BoxGeometry(12, 8.5, 5.5),
      mats.whiteMarble
    );
    connectorBridge.position.set(0, 72, 0);
    congresso.add(connectorBridge);

    // Wide Ceremonial White Concrete Ramp leading from the lawn up to the platform
    const rampLower = new THREE.Mesh(
      new THREE.BoxGeometry(34, 1.0, 14),
      mats.whiteMarble
    );
    rampLower.position.set(-36, 3.8, 12);
    rampLower.rotation.z = 0.22;
    congresso.add(rampLower);

    g.add(congresso);

    // ========================================================================
    // B. PRAÇA DOS TRÊS PODERES (`X = +1610..1720`, around the Eastern Loop)
    // ========================================================================
    const tresPoderes = new THREE.Group();
    tresPoderes.name = 'PracaDosTresPoderes';

    // White Portuguese Stone Plaza Platform East of the turnaround loop
    const pracaFloor = new THREE.Mesh(
      new THREE.BoxGeometry(155, 0.8, 220),
      mats.brutalistConcrete
    );
    pracaFloor.position.set(1645, 0.4, 0);
    pracaFloor.receiveShadow = true;
    tresPoderes.add(pracaFloor);

    // Helper to build Niemeyer's iconic feather-like Sail Column (Coluna do Planalto / STF)
    function createNiemeyerSailColumn() {
      const colGroup = new THREE.Group();
      const upperSail = new THREE.Mesh(
        new THREE.ConeGeometry(2.6, 7.5, 4),
        mats.whiteMarble
      );
      upperSail.rotation.x = Math.PI;
      upperSail.scale.set(0.35, 1, 1.2);
      upperSail.position.y = 9.5;
      colGroup.add(upperSail);

      const lowerSail = new THREE.Mesh(
        new THREE.ConeGeometry(2.6, 7.5, 4),
        mats.whiteMarble
      );
      lowerSail.scale.set(0.35, 1, 1.2);
      lowerSail.position.y = 3.5;
      colGroup.add(lowerSail);
      return colGroup;
    }

    // 1. PALÁCIO DO PLANALTO (North side of Praça dos Três Poderes, X = +1625, Z = -82)
    const planalto = new THREE.Group();
    planalto.position.set(1625, 0.8, -82);

    addWaterPool(planalto, 62, 26, 0, 0.1, 20);

    const planaltoGlass = new THREE.Mesh(
      new THREE.BoxGeometry(52, 12.5, 30),
      mats.ministryGlass
    );
    planaltoGlass.position.y = 7.0;
    planalto.add(planaltoGlass);

    const planaltoBase = new THREE.Mesh(
      new THREE.BoxGeometry(60, 1.2, 36),
      mats.whiteMarble
    );
    planaltoBase.position.y = 0.6;
    planalto.add(planaltoBase);

    const planaltoRoof = new THREE.Mesh(
      new THREE.BoxGeometry(62, 1.5, 38),
      mats.whiteMarble
    );
    planaltoRoof.position.y = 13.8;
    planaltoRoof.castShadow = true;
    planalto.add(planaltoRoof);

    // Feather-like Niemeyer columns along the facade
    for (let cx = -25; cx <= 25; cx += 6.25) {
      const colFront = createNiemeyerSailColumn();
      colFront.position.set(cx, 0, 18);
      planalto.add(colFront);
      const colBack = createNiemeyerSailColumn();
      colBack.position.set(cx, 0, -18);
      planalto.add(colBack);
    }

    // Famous Presidential White Ramp (Rampa do Planalto)
    const presidentialRamp = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.8, 22),
      mats.whiteMarble
    );
    presidentialRamp.position.set(12, 3.6, 26);
    presidentialRamp.rotation.x = 0.32;
    planalto.add(presidentialRamp);

    const planaltoSignTex = createSignTexture(
      THREE,
      'PALÁCIO DO PLANALTO',
      'PODER EXECUTIVO — PRESIDÊNCIA DA REPÚBLICA',
      '#10b981'
    );
    const planaltoSign = new THREE.Mesh(
      new THREE.BoxGeometry(44, 5.5, 1.2),
      new THREE.MeshStandardMaterial({
        map: planaltoSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: planaltoSignTex,
        emissiveIntensity: 0.7
      })
    );
    planaltoSign.position.set(0, 17.5, 16);
    planalto.add(planaltoSign);
    tresPoderes.add(planalto);

    // 2. SUPREMO TRIBUNAL FEDERAL — STF (South side of Praça, X = +1625, Z = +82)
    const stf = new THREE.Group();
    stf.position.set(1625, 0.8, 82);

    const stfGlass = new THREE.Mesh(
      new THREE.BoxGeometry(46, 12, 28),
      mats.ministryGlass
    );
    stfGlass.position.y = 6.8;
    stf.add(stfGlass);

    const stfRoof = new THREE.Mesh(
      new THREE.BoxGeometry(56, 1.5, 36),
      mats.whiteMarble
    );
    stfRoof.position.y = 13.5;
    stf.add(stfRoof);

    for (let cx = -22.5; cx <= 22.5; cx += 6.4) {
      const colFront = createNiemeyerSailColumn();
      colFront.position.set(cx, 0, -17);
      stf.add(colFront);
    }

    // Blindfolded Granite Statue "A Justiça" by Alfredo Ceschiatti in front of STF
    const justicaStatue = new THREE.Group();
    justicaStatue.position.set(0, 0, -26);
    const jPed = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.2, 3.8),
      mats.brutalistConcrete
    );
    jPed.position.y = 1.1;
    justicaStatue.add(jPed);
    const jBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 3.8, 2.2),
      mats.whiteMarble
    );
    jBody.position.y = 4.0;
    justicaStatue.add(jBody);
    const jHead = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), mats.whiteMarble);
    jHead.position.y = 6.5;
    justicaStatue.add(jHead);
    // Sword across lap
    const jSword = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 0.35), mats.bronze);
    jSword.position.set(0, 3.8, -1.2);
    justicaStatue.add(jSword);
    stf.add(justicaStatue);

    const stfSignTex = createSignTexture(
      THREE,
      'SUPREMO TRIBUNAL FEDERAL (STF)',
      'PODER JUDICIÁRIO — ESTÁTUA A JUSTIÇA',
      '#3b82f6'
    );
    const stfSign = new THREE.Mesh(
      new THREE.BoxGeometry(44, 5.5, 1.2),
      new THREE.MeshStandardMaterial({
        map: stfSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: stfSignTex,
        emissiveIntensity: 0.7
      })
    );
    stfSign.position.set(0, 17.2, -15);
    stf.add(stfSign);
    tresPoderes.add(stf);

    // 3. PANTEÃO DA PÁTRIA TANCREDO NEVES (Dove-like White Geometry at X = +1675, Z = +15)
    const panteao = new THREE.Group();
    panteao.position.set(1675, 0.8, 15);

    const wingLeft = new THREE.Mesh(
      new THREE.BoxGeometry(22, 13, 18),
      mats.whiteMarble
    );
    wingLeft.position.set(0, 7.5, -8);
    wingLeft.rotation.x = 0.28;
    wingLeft.castShadow = true;
    panteao.add(wingLeft);

    const wingRight = new THREE.Mesh(
      new THREE.BoxGeometry(22, 15, 20),
      mats.whiteMarble
    );
    wingRight.position.set(0, 8.5, 8);
    wingRight.rotation.x = -0.32;
    wingRight.castShadow = true;
    panteao.add(wingRight);

    // Eternal Flame Beacon (Pira da Liberdade)
    const pyreTower = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 14, 3.5),
      mats.brutalistConcrete
    );
    pyreTower.position.set(-16, 7, -14);
    pyreTower.rotation.z = 0.18;
    panteao.add(pyreTower);

    const eternalFlame = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 3.6, 10),
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: new THREE.Color(0xff5500),
        emissiveIntensity: 1.8
      })
    );
    eternalFlame.position.set(-17.2, 15.2, -14);
    panteao.add(eternalFlame);
    tresPoderes.add(panteao);

    // 4. ESCULTURA "OS CANDANGOS" (Dois Guerreiros by Bruno Giorgi at X = +1608, Z = -18)
    const candangos = new THREE.Group();
    candangos.position.set(1608, 0.8, -18);

    const candBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 2.2, 4.0),
      mats.brutalistConcrete
    );
    candBase.position.y = 1.1;
    candangos.add(candBase);

    for (const wx of [-1.3, 1.3]) {
      const warrior = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.65, 8.5, 10),
        mats.bronze
      );
      warrior.position.set(wx, 6.4, 0);
      candangos.add(warrior);

      const wHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 10), mats.bronze);
      wHead.position.set(wx, 11.0, 0);
      candangos.add(wHead);

      const spear = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 12.5, 6),
        mats.bronze
      );
      spear.position.set(wx * 1.45, 7.5, 0.6);
      candangos.add(spear);
    }
    tresPoderes.add(candangos);

    // 5. MASTRO DA BANDEIRA NACIONAL (`X = +1675, Z = -28`) — 100m High Mast + Waving Flag!
    const mastroGroup = new THREE.Group();
    mastroGroup.position.set(1675, 0.8, -28);

    // Bundle of 24 slender tapered shafts forming the 100m obelisk mast
    const mastPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 2.8, 96, 16),
      mats.steelLattice
    );
    mastPole.position.y = 48;
    mastPole.castShadow = true;
    mastroGroup.add(mastPole);

    // Animated Waving Brazilian Flag at the top of the Mastro
    const flagGeom = new THREE.PlaneGeometry(24, 16, 16, 8);
    const flagMat = new THREE.MeshStandardMaterial({
      map: textures.flagTex,
      roughness: 0.4,
      side: THREE.DoubleSide
    });
    const flagMesh = new THREE.Mesh(flagGeom, flagMat);
    flagMesh.position.set(12.5, 88, 0);
    mastroGroup.add(flagMesh);
    animatedObjects.flags.push({
      mesh: flagMesh,
      basePositions: flagGeom.attributes.position.array.slice()
    });

    tresPoderes.add(mastroGroup);
    g.add(tresPoderes);

    // ========================================================================
    // C. LAGO PARANOÁ & PONTE JK (Eastern Horizon at `X = +1950`)
    // ========================================================================
    const lagoGroup = new THREE.Group();
    lagoGroup.name = 'LagoParanoa_PonteJK';
    lagoGroup.position.set(1950, -0.4, 0);

    // Expansive Shimmering Blue Lake Surface across the entire Eastern Horizon
    const lakeWater = new THREE.Mesh(
      new THREE.PlaneGeometry(650, 2400),
      mats.waterMirror
    );
    lakeWater.rotation.x = -Math.PI / 2;
    lagoGroup.add(lakeWater);

    // Ponte Juscelino Kubitschek (Ponte JK): 3 Soaring Diagonal White Steel Arches!
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(28, 2.6, 780),
      mats.whiteMarble
    );
    bridgeDeck.position.set(0, 14, 0);
    lagoGroup.add(bridgeDeck);

    // Bridge piers in the water
    for (let pz = -300; pz <= 300; pz += 150) {
      const pier = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 6.0, 15, 16),
        mats.brutalistConcrete
      );
      pier.position.set(0, 7.0, pz);
      lagoGroup.add(pier);
    }

    // The 3 Iconic Soaring Asymmetrical Arches of Ponte JK
    const archCentersZ = [-150, 0, 150];
    for (let aIdx = 0; aIdx < 3; aIdx++) {
      const az = archCentersZ[aIdx];
      const archCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-14, 14, az - 75),
        new THREE.Vector3(-6, 52, az - 35),
        new THREE.Vector3(0, 68, az),
        new THREE.Vector3(6, 52, az + 35),
        new THREE.Vector3(14, 14, az + 75)
      ]);
      const archGeom = new THREE.TubeGeometry(archCurve, 32, 2.2, 12, false);
      const archMesh = new THREE.Mesh(archGeom, mats.whiteMarble);
      lagoGroup.add(archMesh);

      // Vertical suspension cables dropping from the arch to the deck
      for (let c = -50; c <= 50; c += 20) {
        const hCable = 48 - Math.abs(c) * 0.45;
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, hCable, 6),
          mats.steelLattice
        );
        cable.position.set(0, 14 + hCable / 2, az + c);
        lagoGroup.add(cable);
      }
    }

    g.add(lagoGroup);
  }
  buildCongressoAndTresPoderes();

  // ==========================================================================
  // 7. FLORA DO CERRADO: IPÊS AMARELOS, ROXOS, ROSA & PALMEIRAS IMPERIAIS
  // ==========================================================================
  function buildCerradoFlora() {
    const floraGroup = new THREE.Group();
    floraGroup.name = 'FloraDoCerrado';
    scene.add(floraGroup);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const ipeYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0xca8a04),
      emissiveIntensity: 0.18,
      roughness: 0.7
    });
    const ipePurpleMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: new THREE.Color(0x7e22ce),
      emissiveIntensity: 0.18,
      roughness: 0.7
    });
    const ipePinkMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: new THREE.Color(0xdb2777),
      emissiveIntensity: 0.18,
      roughness: 0.7
    });
    const palmLeafMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.65
    });

    const canopyMats = [ipeYellowMat, ipePurpleMat, ipePinkMat, palmLeafMat];

    function getGroundElevation(x) {
      let h = -0.15;
      if (x < 100 && x > -1420) {
        const distCruzeiro = Math.abs(x - (-830));
        if (distCruzeiro < 600) {
          h += Math.cos((distCruzeiro / 600) * (Math.PI / 2)) * 3.35;
        }
      }
      return h;
    }

    // 7A. Populate Ipê Trees along the Gramado Central edges & outer avenues
    for (let i = 0; i < 160; i++) {
      const tx = -1380 + (i * 17.5) + Math.sin(i * 3.7) * 8;
      // Skip monument footprints on the central lawn
      if (
        (tx > -1240 && tx < -1120) || // Memorial JK
        (tx > -870 && tx < -770) ||   // Praça do Cruzeiro
        (tx > -630 && tx < -510) ||   // Planetário
        (tx > -265 && tx < -135) ||   // Torre de TV
        (tx > 40 && tx < 155) ||      // Rodoviária
        (tx > 1340)                   // Congresso pool
      ) {
        continue;
      }

      const isOuter = i % 3 === 0;
      const side = i % 2 === 0 ? 1 : -1;
      const tz = isOuter
        ? side * (94 + (i % 4) * 8)
        : side * (24 + (i % 3) * 6);
      const ty = isOuter ? -0.4 : getGroundElevation(tx);

      const tree = new THREE.Group();
      tree.position.set(tx, ty, tz);

      const scale = 0.85 + (i % 4) * 0.18;
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35 * scale, 0.55 * scale, 5.2 * scale, 7),
        trunkMat
      );
      trunk.position.y = 2.6 * scale;
      tree.add(trunk);

      const cMat = canopyMats[i % canopyMats.length];
      const mainCrown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(3.8 * scale, 1),
        cMat
      );
      mainCrown.position.y = 6.2 * scale;
      mainCrown.scale.set(1.15, 0.82, 1.15);
      tree.add(mainCrown);

      const subCrown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2.6 * scale, 1),
        cMat
      );
      subCrown.position.set(1.6 * scale, 5.4 * scale, 0.8 * scale);
      tree.add(subCrown);

      floraGroup.add(tree);
    }

    // 7B. Iconic Rows of Palmeiras Imperiais along the Esplanada dos Ministérios & Congresso Pool
    for (let px = 740; px <= 1410; px += 24) {
      for (const pz of [-34, 34]) {
        const palm = new THREE.Group();
        palm.position.set(px, 0, pz);

        const pTrunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.52, 13.5, 8),
          mats.brutalistConcrete
        );
        pTrunk.position.y = 6.75;
        palm.add(pTrunk);

        // Crown of 6 arching palm fronds
        for (let f = 0; f < 6; f++) {
          const frond = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.2, 4.6),
            palmLeafMat
          );
          const fa = (f / 6) * Math.PI * 2;
          frond.position.set(Math.cos(fa) * 2.1, 13.4, Math.sin(fa) * 2.1);
          frond.rotation.y = -fa + Math.PI / 2;
          frond.rotation.x = 0.35;
          palm.add(frond);
        }

        floraGroup.add(palm);
      }
    }
  }
  buildCerradoFlora();

  // ==========================================================================
  // 8. TIME-OF-DAY ATMOSPHERE & LIGHTING CONTROLLER (`setTimeOfDay`)
  // ==========================================================================
  let currentTimeMode = 'day';

  function updateSkyGradient(topColor, midColor, horizonColor, bottomColor) {
    const sctx = skyCanvas.getContext('2d');
    const grad = sctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, topColor);
    grad.addColorStop(0.42, midColor);
    grad.addColorStop(0.54, horizonColor);
    grad.addColorStop(1.0, bottomColor);
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 256);
    skyTex.needsUpdate = true;
  }

  function setTimeOfDay(mode = 'day') {
    currentTimeMode = mode;

    if (mode === 'sunset') {
      // Pôr do Sol Lendário do Cerrado (Vibrant Magenta / Orange / Gold Sky)
      updateSkyGradient('#1e1b4b', '#9333ea', '#f97316', '#fde047');
      scene.fog = new THREE.FogExp2(0xfb923c, 0.00028);

      ambientLight.color.setHex(0xfed7aa);
      ambientLight.intensity = 0.72;
      hemiLight.color.setHex(0xf97316);
      hemiLight.groundColor.setHex(0x451a03);
      hemiLight.intensity = 0.75;

      dirLight.color.setHex(0xfb923c);
      dirLight.intensity = 1.65;
      dirLight.position.set(-1400, 210, -120); // Golden sunset rays from the West!

      sunDiscMat.color.setHex(0xf97316);
      sunDisc.position.set(-2400, 310, -180);
      starMat.opacity = 0.28;
      cloudMat.color.setHex(0xfdba74);

      for (const em of animatedObjects.emissiveMaterials) {
        em.mat.emissiveIntensity = em.sunset;
      }
      for (const bulb of animatedObjects.streetLampBulbs) {
        bulb.emissiveIntensity = 1.2;
      }
      congressGlowLight.intensity = 2.2;
      tvTowerGlowLight.intensity = 1.8;
      cathedralGlowLight.intensity = 2.0;
    } else if (mode === 'night') {
      // Noite Cívica Iluminada (Deep Starfield Sky, Floodlit Monuments, Glowing Ministries)
      updateSkyGradient('#020617', '#0f172a', '#1e1b4b', '#020617');
      scene.fog = new THREE.FogExp2(0x090d16, 0.00025);

      ambientLight.color.setHex(0x93c5fd);
      ambientLight.intensity = 0.48;
      hemiLight.color.setHex(0x38bdf8);
      hemiLight.groundColor.setHex(0x0f172a);
      hemiLight.intensity = 0.52;

      dirLight.color.setHex(0xbae6fd);
      dirLight.intensity = 0.65;
      dirLight.position.set(300, 520, -250);

      sunDiscMat.color.setHex(0xe2e8f0); // Full Moon over Brasília
      sunDisc.position.set(1400, 680, -600);
      starMat.opacity = 0.95;
      cloudMat.color.setHex(0x334155);

      for (const em of animatedObjects.emissiveMaterials) {
        em.mat.emissiveIntensity = em.night;
      }
      for (const bulb of animatedObjects.streetLampBulbs) {
        bulb.emissiveIntensity = 2.2;
      }
      congressGlowLight.intensity = 4.5;
      tvTowerGlowLight.intensity = 3.8;
      cathedralGlowLight.intensity = 4.0;
    } else {
      // 'day' — Céu Azul Brigadeiro de Brasília
      updateSkyGradient('#0284c7', '#38bdf8', '#bae6fd', '#e0f2fe');
      scene.fog = new THREE.FogExp2(0xbae6fd, 0.00022);

      ambientLight.color.setHex(0xe0f2fe);
      ambientLight.intensity = 0.92;
      hemiLight.color.setHex(0x38bdf8);
      hemiLight.groundColor.setHex(0x365314);
      hemiLight.intensity = 0.8;

      dirLight.color.setHex(0xfffbeb);
      dirLight.intensity = 1.6;
      dirLight.position.set(420, 580, 280);

      sunDiscMat.color.setHex(0xfef08a);
      sunDisc.position.set(1600, 820, -450);
      starMat.opacity = 0.0;
      cloudMat.color.setHex(0xffffff);

      for (const em of animatedObjects.emissiveMaterials) {
        em.mat.emissiveIntensity = em.day;
      }
      for (const bulb of animatedObjects.streetLampBulbs) {
        bulb.emissiveIntensity = 0.15;
      }
      congressGlowLight.intensity = 0;
      tvTowerGlowLight.intensity = 0;
      cathedralGlowLight.intensity = 0;
    }
  }

  // Initialize default daytime sky & lighting
  setTimeOfDay('day');

  // ==========================================================================
  // 9. REAL-TIME WORLD ANIMATION LOOP (`updateWorld(time, dt)`)
  // ==========================================================================
  function updateWorld(time = 0, dt = 0.016) {
    // 9A. Animate Fonte Luminosa da Torre de TV water jets
    for (const jet of animatedObjects.fountainJets) {
      const wave = 0.55 + 0.45 * Math.sin(time * 2.8 + jet.phase);
      const h = Math.max(2.0, jet.maxH * wave);
      jet.mesh.scale.y = h;
      jet.mesh.position.y = h * 0.5;
    }

    // 9B. Animate Palácio da Justiça cascading waterfalls
    for (const wf of animatedObjects.waterfalls) {
      const pulse = 0.92 + 0.08 * Math.sin(time * 7.5 + wf.phase);
      wf.mesh.scale.x = pulse;
    }

    // 9C. Animate Water Mirrors (Espelhos d'Água subtle shimmer)
    mats.waterMirror.emissiveIntensity =
      (currentTimeMode === 'night' ? 0.42 : 0.22) + 0.06 * Math.sin(time * 2.2);

    // 9D. Animate Waving Brazilian Flag on the Mastro da Bandeira Nacional
    for (const fl of animatedObjects.flags) {
      const posAttr = fl.mesh.geometry.attributes.position;
      const base = fl.basePositions;
      for (let i = 0; i < posAttr.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        // Distance from flag mast edge (bx ranges -12..+12)
        const distFromPole = (bx + 12) / 24;
        const waveZ =
          Math.sin(time * 4.5 - distFromPole * 5.0 + by * 0.15) * (2.4 * distFromPole);
        posAttr.setZ(i, waveZ);
      }
      posAttr.needsUpdate = true;
    }

    // 9E. Animate Rotating Mario Kart Item Boxes & Respawn Timers
    for (const box of itemBoxes) {
      if (!box.active) {
        box.respawnTimer -= dt;
        if (box.respawnTimer <= 0) {
          box.active = true;
          box.mesh.visible = true;
        }
      }
      if (box.active) {
        box.mesh.rotation.y = time * 1.8 + box.phase;
        box.cube.rotation.x = time * 1.3 + box.phase;
        box.cube.rotation.z = time * 1.1;
        box.mesh.position.y = box.baseY + Math.sin(time * 3.2 + box.phase) * 0.35;
      }
    }

    // 9F. Scroll Boost Pad Neon Chevrons forward
    textures.boostTex.offset.y = -((time * 1.8) % 1);

    // 9G. Drift Cerrado Cumulus Clouds gently across the sky
    for (const cl of animatedObjects.clouds) {
      cl.mesh.position.x += cl.speed * dt;
      if (cl.mesh.position.x > 2500) {
        cl.mesh.position.x = -2500;
      }
    }
  }

  return {
    landmarkGroups,
    animatedObjects,
    boostPads,
    itemBoxes,
    setTimeOfDay,
    updateWorld
  };
}
