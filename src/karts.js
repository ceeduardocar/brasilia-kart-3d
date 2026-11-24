/**
 * Brasília Kart 3D — Eixo Monumental Edition
 * Kart Physics, AI Racers, Procedural 3D Karts & Drivers, and Mario Kart Item System
 */

import { ROAD_WIDTH, BOOST_PAD_FRACTIONS, ITEM_BOX_FRACTIONS, LANDMARKS } from './trackData.js';

export const KART_ROSTER = [
  {
    id: 'capivara',
    name: 'Capivara do Lago',
    title: 'Embaixadora do Paranoá',
    number: '61',
    primaryColor: '#10b981',
    secondaryColor: '#fbbf24',
    accentColor: '#065f46',
    skinColor: '#8d5524',
    emoji: '🦫',
    description: 'Equilíbrio perfeito para dominar tanto as curvas da Torre de TV quanto as retas da Esplanada.',
    stats: { speed: 88, accel: 90, handling: 92, drift: 90 }
  },
  {
    id: 'lobo_guara',
    name: 'Lobo-Guará Turbo',
    title: 'Relâmpago do Cerrado',
    number: '01',
    primaryColor: '#f97316',
    secondaryColor: '#1e293b',
    accentColor: '#fef08a',
    skinColor: '#c2410c',
    emoji: '🦊',
    description: 'Pernas longas e motor V8 de alta velocidade final nas longas avenidas N1 e S1.',
    stats: { speed: 96, accel: 84, handling: 82, drift: 88 }
  },
  {
    id: 'caramelo',
    name: 'Vira-Lata Caramelo',
    title: 'Rei do Eixão',
    number: '10',
    primaryColor: '#d97706',
    secondaryColor: '#fef3c7',
    accentColor: '#92400e',
    skinColor: '#d97706',
    emoji: '🐕',
    description: 'Patrimônio nacional! Arrancada explosiva e o melhor Mini-Turbo de derrapagem de Brasília.',
    stats: { speed: 90, accel: 95, handling: 88, drift: 96 }
  },
  {
    id: 'arara_azul',
    name: 'Arara-Canindé',
    title: 'Voo da Esplanada',
    number: '21',
    primaryColor: '#0284c7',
    secondaryColor: '#facc15',
    accentColor: '#0369a1',
    skinColor: '#0284c7',
    emoji: '🦜',
    description: 'Aerodinâmica inspirada nas curvas de Niemeyer com direção leve e precisa.',
    stats: { speed: 92, accel: 88, handling: 94, drift: 90 }
  },
  {
    id: 'calango',
    name: 'Calango Voador',
    title: 'Derrapada da Torre',
    number: '77',
    primaryColor: '#059669',
    secondaryColor: '#22d3ee',
    accentColor: '#064e3b',
    skinColor: '#10b981',
    emoji: '🦎',
    description: 'Agilidade máxima nas chicanes e recuperação instantânea mesmo na grama do Eixo.',
    stats: { speed: 86, accel: 96, handling: 96, drift: 94 }
  },
  {
    id: 'onca_pintada',
    name: 'Onça-Pintada GT',
    title: 'Fera dos Três Poderes',
    number: '99',
    primaryColor: '#f59e0b',
    secondaryColor: '#0f172a',
    accentColor: '#fbbf24',
    skinColor: '#eab308',
    emoji: '🐆',
    description: 'Força bruta e velocidade máxima insuperável para cruzar o Congresso Nacional na frente.',
    stats: { speed: 98, accel: 82, handling: 80, drift: 85 }
  }
];

export const ITEMS_CATALOG = [
  {
    id: 'cafezinho',
    name: 'Turbo Guaraná & Café',
    shortName: 'Turbo Café',
    icon: '☕',
    color: '#f59e0b',
    description: 'Explosão tripla de velocidade com rastro dourado do Cerrado!'
  },
  {
    id: 'pequi_dourado',
    name: 'Pequi Dourado Suprema',
    shortName: 'Pequi Dourado',
    icon: '🌟',
    color: '#fde047',
    description: 'Invencibilidade por 7s, aura arco-íris, +35% de velocidade e derruba rivais no caminho!'
  },
  {
    id: 'jato_fonte',
    name: 'Jato da Fonte da Torre',
    shortName: 'Jato da Fonte',
    icon: '🌊',
    color: '#38bdf8',
    description: 'Dispara uma esfera d’água teleguiada pela pista que faz o kart à frente rodar!'
  },
  {
    id: 'casca_pequi',
    name: 'Casca de Pequi Escorregadia',
    shortName: 'Casca de Pequi',
    icon: '🟡',
    color: '#eab308',
    description: 'Solta um pequi espinhoso no asfalto que faz qualquer rival girar 360°!'
  },
  {
    id: 'sirene_comboio',
    name: 'Sirene da Esplanada',
    shortName: 'Sirene Cívica',
    icon: '🚨',
    color: '#ef4444',
    description: 'Onda eletromagnética que encolhe e desacelera todos os rivais enquanto te dá impulso!'
  }
];

const ITEM_MAP = Object.fromEntries(ITEMS_CATALOG.map(it => [it.id, it]));

/**
 * Helper to create a canvas-backed texture for number plates & floating AI badges
 */
function createNumberPlateTexture(THREE, numberText, bgColor, textColor = '#0f172a') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = '900 62px "Inter", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(numberText), 64, 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createNameBadgeSprite(THREE, driver) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  // Pill background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
  ctx.beginPath();
  ctx.roundRect(12, 14, 360, 68, 34);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = driver.primaryColor;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${driver.emoji} ${driver.name}`, 192, 48);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(3.8, 0.95, 1);
  sprite.position.set(0, 2.75, 0);
  sprite.renderOrder = 10;
  return sprite;
}

/**
 * Builds an authentic, detailed procedural 3D Kart + Stylized Character Head/Driver
 */
export function buildKartMesh(THREE, rosterEntry, isPlayer = false) {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group(); // tilts, hops, and spins independently
  root.add(bodyGroup);

  const primaryMat = new THREE.MeshStandardMaterial({
    color: rosterEntry.primaryColor,
    roughness: 0.25,
    metalness: 0.35
  });
  const secondaryMat = new THREE.MeshStandardMaterial({
    color: rosterEntry.secondaryColor,
    roughness: 0.3,
    metalness: 0.2
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.75
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.15,
    metalness: 0.92
  });
  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.7
  });

  // 1. Main chassis floor pan
  const floorGeo = new THREE.BoxGeometry(1.75, 0.22, 3.15);
  const floorMesh = new THREE.Mesh(floorGeo, darkMetalMat);
  floorMesh.position.set(0, 0.35, 0);
  floorMesh.castShadow = true;
  floorMesh.receiveShadow = true;
  bodyGroup.add(floorMesh);

  // 2. Front aerodynamic nose cone (+Z is forward in local kart space)
  const noseGeo = new THREE.BoxGeometry(1.3, 0.36, 1.15);
  const noseMesh = new THREE.Mesh(noseGeo, primaryMat);
  noseMesh.position.set(0, 0.52, 1.15);
  noseMesh.rotation.x = 0.14;
  noseMesh.castShadow = true;
  bodyGroup.add(noseMesh);

  // Front spoiler wing
  const frontWingGeo = new THREE.BoxGeometry(1.95, 0.12, 0.42);
  const frontWing = new THREE.Mesh(frontWingGeo, secondaryMat);
  frontWing.position.set(0, 0.32, 1.65);
  frontWing.castShadow = true;
  bodyGroup.add(frontWing);

  // Number plate disc on nose
  const plateTex = createNumberPlateTexture(THREE, rosterEntry.number || '61', rosterEntry.secondaryColor);
  const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });
  const plateGeo = new THREE.CircleGeometry(0.32, 24);
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  plateMesh.position.set(0, 0.67, 1.28);
  plateMesh.rotation.x = -Math.PI * 0.38;
  bodyGroup.add(plateMesh);

  // 3. Side Pods (Left & Right aerodynamic pontoons)
  const podGeo = new THREE.BoxGeometry(0.42, 0.38, 1.65);
  const leftPod = new THREE.Mesh(podGeo, primaryMat);
  leftPod.position.set(0.88, 0.48, -0.05);
  leftPod.castShadow = true;
  bodyGroup.add(leftPod);

  const rightPod = new THREE.Mesh(podGeo, primaryMat);
  rightPod.position.set(-0.88, 0.48, -0.05);
  rightPod.castShadow = true;
  bodyGroup.add(rightPod);

  // Side accent stripes
  const stripeGeo = new THREE.BoxGeometry(0.45, 0.12, 1.45);
  const leftStripe = new THREE.Mesh(stripeGeo, secondaryMat);
  leftStripe.position.set(0.88, 0.56, -0.05);
  bodyGroup.add(leftStripe);

  const rightStripe = new THREE.Mesh(stripeGeo, secondaryMat);
  rightStripe.position.set(-0.88, 0.56, -0.05);
  bodyGroup.add(rightStripe);

  // 4. Racing Bucket Seat & Steering Column
  const seatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.2, 0.8), seatMat);
  seatBottom.position.set(0, 0.52, -0.2);
  bodyGroup.add(seatBottom);

  const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.85, 0.2), seatMat);
  seatBack.position.set(0, 0.9, -0.58);
  seatBack.rotation.x = -0.15;
  seatBack.castShadow = true;
  bodyGroup.add(seatBack);

  const columnGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.75, 10);
  const columnMesh = new THREE.Mesh(columnGeo, darkMetalMat);
  columnMesh.position.set(0, 0.78, 0.52);
  columnMesh.rotation.x = -0.65;
  bodyGroup.add(columnMesh);

  const steeringWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.04, 10, 20),
    secondaryMat
  );
  steeringWheel.position.set(0, 1.02, 0.28);
  steeringWheel.rotation.x = 0.85;
  bodyGroup.add(steeringWheel);

  // 5. Rear Engine Block & Dual Chrome Exhaust Pipes + Flame Cones
  const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 0.8), darkMetalMat);
  engineBlock.position.set(0, 0.68, -1.15);
  engineBlock.castShadow = true;
  bodyGroup.add(engineBlock);

  const exhaustFlames = [];
  const pipeGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.85, 12);
  const flameGeo = new THREE.ConeGeometry(0.16, 0.9, 12);
  flameGeo.translate(0, 0.45, 0);

  for (const side of [-1, 1]) {
    const pipe = new THREE.Mesh(pipeGeo, chromeMat);
    pipe.position.set(side * 0.34, 0.88, -1.48);
    pipe.rotation.x = -Math.PI * 0.38;
    bodyGroup.add(pipe);

    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.85
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(side * 0.34, 0.98, -1.82);
    flame.rotation.x = -Math.PI * 0.42;
    flame.scale.set(0.5, 0.4, 0.5);
    bodyGroup.add(flame);
    exhaustFlames.push(flame);
  }

  // 6. Rear Spoiler Wing with Brasília Modernist Pillars
  const strutGeo = new THREE.BoxGeometry(0.08, 0.65, 0.22);
  for (const side of [-1, 1]) {
    const strut = new THREE.Mesh(strutGeo, darkMetalMat);
    strut.position.set(side * 0.55, 1.08, -1.35);
    bodyGroup.add(strut);
  }
  const wingMesh = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.1, 0.46), secondaryMat);
  wingMesh.position.set(0, 1.42, -1.4);
  wingMesh.rotation.x = -0.12;
  wingMesh.castShadow = true;
  bodyGroup.add(wingMesh);

  // 7. 4 Rotating Wheels (Front wheels pivot for steering)
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.75 });
  const rimMat = new THREE.MeshStandardMaterial({
    color: rosterEntry.secondaryColor,
    roughness: 0.25,
    metalness: 0.65
  });

  const wheelPositions = [
    { x: 0.98, y: 0.38, z: 1.08, isFront: true },
    { x: -0.98, y: 0.38, z: 1.08, isFront: true },
    { x: 1.04, y: 0.44, z: -1.05, isFront: false },
    { x: -1.04, y: 0.44, z: -1.05, isFront: false }
  ];

  const frontPivots = [];
  const wheelMeshes = [];

  for (const wp of wheelPositions) {
    const pivot = new THREE.Group();
    pivot.position.set(wp.x, wp.y, wp.z);
    bodyGroup.add(pivot);

    const radius = wp.isFront ? 0.38 : 0.44;
    const width = wp.isFront ? 0.34 : 0.44;
    const wheelGroup = new THREE.Group();

    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 20);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, width + 0.02, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    wheelGroup.add(rim);

    // Hub spoke bar so wheel rotation is clearly visible
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.04, radius * 1.1, 0.1),
      darkMetalMat
    );
    wheelGroup.add(spoke);

    pivot.add(wheelGroup);
    wheelMeshes.push(wheelGroup);
    if (wp.isFront) {
      frontPivots.push(pivot);
    }
  }

  // 8. Stylized Driver Character Torso, Arms & Iconic Brazilian Animal/Mascot Head
  const driverGroup = new THREE.Group();
  driverGroup.position.set(0, 0.85, -0.15);
  bodyGroup.add(driverGroup);

  const suitMat = new THREE.MeshStandardMaterial({
    color: rosterEntry.primaryColor,
    roughness: 0.4
  });
  const characterMat = new THREE.MeshStandardMaterial({
    color: rosterEntry.skinColor || rosterEntry.primaryColor,
    roughness: 0.5
  });
  const goggleMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.9
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.62, 14), suitMat);
  torso.position.set(0, 0.25, 0);
  torso.castShadow = true;
  driverGroup.add(torso);

  // Arms reaching to steering wheel
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.56, 10), suitMat);
    arm.position.set(side * 0.26, 0.32, 0.24);
    arm.rotation.x = Math.PI * 0.36;
    arm.rotation.z = -side * 0.22;
    driverGroup.add(arm);
  }

  // Head group (bobs slightly with speed and turns with steering)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.78, 0.02);
  driverGroup.add(headGroup);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 16), characterMat);
  headSphere.castShadow = true;
  headGroup.add(headSphere);

  // Racing goggles / visor
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.24), goggleMat);
  visor.position.set(0, 0.06, 0.24);
  headGroup.add(visor);

  // Distinct character features by roster ID
  if (rosterEntry.id === 'capivara') {
    // Broad friendly Capybara snout + rounded ears
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.32), characterMat);
    snout.position.set(0, -0.06, 0.3);
    headGroup.add(snout);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), characterMat);
      ear.position.set(s * 0.24, 0.28, -0.05);
      headGroup.add(ear);
    }
  } else if (rosterEntry.id === 'lobo_guara' || rosterEntry.id === 'onca_pintada') {
    // Tall pointed ears + sleek snout
    const earGeo = new THREE.ConeGeometry(0.12, 0.34, 10);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, characterMat);
      ear.position.set(s * 0.22, 0.4, -0.02);
      ear.rotation.z = -s * 0.18;
      headGroup.add(ear);
    }
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 10), characterMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.06, 0.36);
    headGroup.add(snout);
  } else if (rosterEntry.id === 'caramelo') {
    // Cute floppy caramel ears + happy snout
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.18), characterMat);
      ear.position.set(s * 0.32, 0.12, 0.04);
      ear.rotation.z = s * 0.35;
      headGroup.add(ear);
    }
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.28), characterMat);
    snout.position.set(0, -0.07, 0.3);
    headGroup.add(snout);
  } else if (rosterEntry.id === 'arara_azul') {
    // Canary yellow beak & blue crest feather
    const beakMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 10), beakMat);
    beak.rotation.x = Math.PI * 0.55;
    beak.position.set(0, -0.05, 0.38);
    headGroup.add(beak);

    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.36), secondaryMat);
    crest.position.set(0, 0.34, -0.04);
    headGroup.add(crest);
  } else {
    // Calango aerodynamic dorsal fin helmet crest
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.48), secondaryMat);
    fin.position.set(0, 0.34, -0.05);
    headGroup.add(fin);
  }

  // 9. Drift Sparks (Left & Right Rear Tires) + Star Invincibility Aura Ring
  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.0
  });
  const sparkSpheres = [];
  for (const side of [-1, 1]) {
    const sparkGroup = new THREE.Group();
    sparkGroup.position.set(side * 0.95, 0.22, -1.15);
    for (let j = 0; j < 4; j++) {
      const sp = new THREE.Mesh(new THREE.OctahedronGeometry(0.13 + j * 0.03, 0), sparkMat);
      sp.position.set((Math.random() - 0.5) * 0.3, j * 0.08, -j * 0.22);
      sparkGroup.add(sp);
    }
    bodyGroup.add(sparkGroup);
    sparkSpheres.push(sparkGroup);
  }

  // Pequi Dourado Star Aura Ring
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide
  });
  const auraRing = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.1, 10, 32), auraMat);
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.set(0, 0.55, 0);
  bodyGroup.add(auraRing);

  // Floating AI Name Badge
  let badgeSprite = null;
  if (!isPlayer) {
    badgeSprite = createNameBadgeSprite(THREE, rosterEntry);
    root.add(badgeSprite);
  }

  return {
    root,
    bodyGroup,
    headGroup,
    steeringWheel,
    frontPivots,
    wheelMeshes,
    exhaustFlames,
    sparkSpheres,
    sparkMat,
    auraRing,
    auraMat,
    badgeSprite,
    primaryMat
  };
}

/**
 * Creates the full Kart Physics, AI Racer, Track Pickups & Item Projectile System
 */
export function createKartSystem(THREE, scene, trackSpline, soundEngine = null) {
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    drift: false
  };

  let gameMode = 'race'; // 'race' | 'cruise'
  let cruiseAutopilot = false;
  let totalLaps = 3;
  let raceStarted = true;
  let raceFinished = false;
  let raceTime = 0;

  // Event callbacks that UI or main loop can subscribe to
  let onItemPickupCallback = null;
  let onLandmarkEnterCallback = null;
  let onLapChangeCallback = null;
  let onRaceFinishCallback = null;

  // Build visual 3D Boost Pads & Floating Mario Kart Item Boxes along the track
  const boostPads = [];
  const itemBoxes = [];
  const worldPickupsGroup = new THREE.Group();
  scene.add(worldPickupsGroup);

  function buildTrackPickups() {
    // 1. Glowing Chevron Boost Pads on the asphalt
    const padGeo = new THREE.PlaneGeometry(5.2, 7.5);
    padGeo.rotateX(-Math.PI / 2);

    BOOST_PAD_FRACTIONS.forEach((frac, idx) => {
      const sample = trackSpline.getSampleAtFraction(frac);
      const laneOffset = ((idx % 3) - 1) * 5.2;
      const pos = sample.point.clone().addScaledVector(sample.right, laneOffset);
      pos.y += 0.08;

      const padGroup = new THREE.Group();
      padGroup.position.copy(pos);
      const angle = Math.atan2(sample.tangent.x, sample.tangent.z);
      padGroup.rotation.y = angle;

      const baseMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.78
      });
      const baseMesh = new THREE.Mesh(padGeo, baseMat);
      padGroup.add(baseMesh);

      // Inner bright yellow chevron strip
      const innerGeo = new THREE.PlaneGeometry(3.4, 5.2);
      innerGeo.rotateX(-Math.PI / 2);
      const innerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      innerMesh.position.y = 0.02;
      padGroup.add(innerMesh);

      worldPickupsGroup.add(padGroup);
      boostPads.push({
        position: pos,
        mesh: padGroup,
        baseMat,
        radius: 4.5
      });
    });

    // 2. Floating Rotating Crystal Item Boxes (Rows of 3 or 4 across the road)
    const boxGeo = new THREE.OctahedronGeometry(1.15, 0);
    const wireGeo = new THREE.BoxGeometry(1.55, 1.55, 1.55);

    ITEM_BOX_FRACTIONS.forEach((frac, rowIdx) => {
      const sample = trackSpline.getSampleAtFraction(frac);
      const lanes = [-7.2, -2.4, 2.4, 7.2];
      lanes.forEach((laneOffset, colIdx) => {
        const pos = sample.point.clone().addScaledVector(sample.right, laneOffset);
        pos.y += 1.55;

        const holder = new THREE.Group();
        holder.position.copy(pos);

        const hueColor = new THREE.Color().setHSL(((rowIdx * 4 + colIdx) * 0.13) % 1, 0.9, 0.55);
        const coreMat = new THREE.MeshStandardMaterial({
          color: hueColor,
          emissive: hueColor,
          emissiveIntensity: 0.45,
          roughness: 0.15,
          metalness: 0.3,
          transparent: true,
          opacity: 0.9
        });
        const coreMesh = new THREE.Mesh(boxGeo, coreMat);
        holder.add(coreMesh);

        const outerMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.55
        });
        const outerMesh = new THREE.Mesh(wireGeo, outerMat);
        holder.add(outerMesh);

        worldPickupsGroup.add(holder);
        itemBoxes.push({
          position: pos,
          baseY: pos.y,
          mesh: holder,
          active: true,
          respawnTimer: 0,
          phase: rowIdx * 1.1 + colIdx * 0.7
        });
      });
    });
  }

  buildTrackPickups();

  // Active projectiles & hazards (Jato da Fonte, Casca de Pequi, Sirene shockwave)
  const activeHazards = [];
  const hazardsGroup = new THREE.Group();
  scene.add(hazardsGroup);

  /**
   * Creates a Kart instance state (Player or AI)
   */
  function createKartEntity(rosterEntry, startFraction, lateralOffset, isPlayer = false) {
    const meshParts = buildKartMesh(THREE, rosterEntry, isPlayer);
    scene.add(meshParts.root);

    const sample = trackSpline.getSampleAtFraction(startFraction);
    const startPos = sample.point.clone().addScaledVector(sample.right, lateralOffset);
    const startHeading = Math.atan2(sample.tangent.x, sample.tangent.z);

    meshParts.root.position.copy(startPos);
    meshParts.root.rotation.y = startHeading;

    // Derive physical max speed & acceleration from stats
    const baseMaxSpeed = 52 + (rosterEntry.stats.speed - 80) * 0.55; // ~56 - 62 units/sec (~200 km/h scale)
    const baseAccel = 30 + (rosterEntry.stats.accel - 80) * 0.5;
    const baseHandling = 2.05 + (rosterEntry.stats.handling - 80) * 0.025;
    const driftBonus = 1.0 + (rosterEntry.stats.drift - 80) * 0.015;

    return {
      id: rosterEntry.id,
      roster: rosterEntry,
      isPlayer,
      meshParts,
      position: startPos.clone(),
      heading: startHeading,
      speed: 0,
      baseMaxSpeed,
      baseAccel,
      baseHandling,
      driftBonus,
      // Drift & Hop state
      isDrifting: false,
      driftDirection: 0, // -1 (right) or +1 (left)
      driftCharge: 0,
      driftLevel: 0, // 0, 1 (Blue), 2 (Orange), 3 (Purple)
      hopHeight: 0,
      hopVelocity: 0,
      visualRoll: 0,
      visualYawOffset: 0,
      wheelRotation: 0,
      // Boost, Invincibility, Hit Spin & Shrink states
      boostTimer: 0,
      boostPower: 0,
      starTimer: 0,
      spinOutTimer: 0,
      shrinkTimer: 0,
      // Items
      heldItem: null,
      heldItemCharges: 0,
      rouletteTimer: 0,
      // Track Progress & Lap counting
      splineFraction: startFraction,
      lastSplineFraction: startFraction,
      lap: 1,
      totalProgress: startFraction,
      raceRank: 1,
      finished: false,
      finishTime: 0,
      currentSectionId: sample.sectionId,
      // AI specific properties
      aiTargetLane: lateralOffset,
      aiLaneTimer: 1.5 + Math.random() * 2.5,
      aiSkillOffset: (Math.random() - 0.5) * 2.5
    };
  }

  // Initialize Player Kart + 5 AI Rivals
  const karts = [];
  let playerKart = null;

  function spawnRacers(selectedKartId = 'capivara') {
    // Clean up existing kart meshes if respawning
    for (const k of karts) {
      scene.remove(k.meshParts.root);
    }
    karts.length = 0;

    const playerRoster = KART_ROSTER.find(r => r.id === selectedKartId) || KART_ROSTER[0];
    const aiRosters = KART_ROSTER.filter(r => r.id !== playerRoster.id);

    // Grid formation near West S1 start line (Rodoferroviária -> Memorial JK)
    playerKart = createKartEntity(playerRoster, 0.008, 3.2, true);
    karts.push(playerKart);

    aiRosters.forEach((aiRoster, idx) => {
      const frac = 0.012 + idx * 0.0045;
      const lane = (idx % 2 === 0 ? -1 : 1) * (3.5 + (idx % 3) * 1.6);
      const aiKart = createKartEntity(aiRoster, frac, lane, false);
      karts.push(aiKart);
    });
  }

  spawnRacers('capivara');

  /**
   * Keyboard bindings
   */
  function onKeyDown(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const code = e.code;

    if (code === 'KeyW' || code === 'ArrowUp') {
      keys.up = true;
      if (cruiseAutopilot) cruiseAutopilot = false; // Manual override seamlessly
    }
    if (code === 'KeyS' || code === 'ArrowDown') {
      keys.down = true;
    }
    if (code === 'KeyA' || code === 'ArrowLeft') {
      keys.left = true;
    }
    if (code === 'KeyD' || code === 'ArrowRight') {
      keys.right = true;
    }
    if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
      if (!keys.drift && playerKart && playerKart.hopHeight <= 0.01) {
        // Trigger Mario Kart Hop!
        playerKart.hopVelocity = 5.2;
        if (soundEngine && typeof soundEngine.playDriftHop === 'function') {
          soundEngine.playDriftHop();
        }
      }
      keys.drift = true;
    }
    if (code === 'KeyE' || code === 'Enter' || code === 'KeyF') {
      useKartItem(playerKart);
    }
    if (code === 'KeyR') {
      resetKartToTrack(playerKart);
    }
  }

  function onKeyUp(e) {
    const code = e.code;
    if (code === 'KeyW' || code === 'ArrowUp') keys.up = false;
    if (code === 'KeyS' || code === 'ArrowDown') keys.down = false;
    if (code === 'KeyA' || code === 'ArrowLeft') keys.left = false;
    if (code === 'KeyD' || code === 'ArrowRight') keys.right = false;
    if (code === 'Space' || code === 'ShiftLeft' || code === 'ShiftRight') {
      keys.drift = false;
      if (playerKart && playerKart.isDrifting) {
        releaseDriftMiniTurbo(playerKart);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  function releaseDriftMiniTurbo(kart) {
    if (kart.driftLevel >= 1) {
      const durations = [0, 0.9, 1.5, 2.3];
      const powers = [0, 14, 20, 27];
      kart.boostTimer = Math.max(kart.boostTimer, durations[kart.driftLevel]);
      kart.boostPower = Math.max(kart.boostPower, powers[kart.driftLevel]);
      if (kart.isPlayer && soundEngine) {
        if (typeof soundEngine.playBoost === 'function') soundEngine.playBoost(kart.driftLevel);
      }
    }
    kart.isDrifting = false;
    kart.driftDirection = 0;
    kart.driftCharge = 0;
    kart.driftLevel = 0;
  }

  /**
   * Assigns a weighted Mario Kart item based on current race rank
   */
  function rollRandomItem(kart) {
    const rank = kart.raceRank || 1;
    let pool = [];
    if (rank === 1) {
      pool = ['casca_pequi', 'casca_pequi', 'cafezinho', 'jato_fonte'];
    } else if (rank <= 3) {
      pool = ['cafezinho', 'jato_fonte', 'jato_fonte', 'casca_pequi', 'pequi_dourado'];
    } else {
      pool = ['pequi_dourado', 'sirene_comboio', 'cafezinho', 'jato_fonte', 'pequi_dourado'];
    }
    const chosenId = pool[Math.floor(Math.random() * pool.length)];
    kart.heldItem = ITEM_MAP[chosenId] || ITEMS_CATALOG[0];
    kart.heldItemCharges = chosenId === 'cafezinho' ? 3 : 1;

    if (kart.isPlayer && onItemPickupCallback) {
      onItemPickupCallback(kart.heldItem, kart.heldItemCharges);
    }
  }

  /**
   * Activates the currently held Mario Kart item for either Player or AI
   */
  function useKartItem(kart) {
    if (!kart || !kart.heldItem || kart.rouletteTimer > 0) return null;

    const item = kart.heldItem;

    if (item.id === 'cafezinho') {
      // 3x Guaraná & Café Turbo Boost
      kart.boostTimer = 1.65;
      kart.boostPower = 24;
      kart.heldItemCharges--;
      if (kart.isPlayer && soundEngine && typeof soundEngine.playBoost === 'function') {
        soundEngine.playBoost(2);
      }
      if (kart.heldItemCharges <= 0) {
        kart.heldItem = null;
      }
    } else if (item.id === 'pequi_dourado') {
      // 7 seconds of Star Invincibility + +35% speed + rainbow glow
      kart.starTimer = 7.0;
      kart.boostTimer = 7.0;
      kart.boostPower = 22;
      kart.heldItem = null;
      kart.heldItemCharges = 0;
      if (kart.isPlayer && soundEngine && typeof soundEngine.playStarPower === 'function') {
        soundEngine.playStarPower();
      }
    } else if (item.id === 'jato_fonte') {
      // Homing Water Jet Orb from Fonte da Torre de TV
      spawnWaterJetProjectile(kart);
      kart.heldItem = null;
      kart.heldItemCharges = 0;
    } else if (item.id === 'casca_pequi') {
      // Drop spiky Pequi Peel behind kart
      spawnPequiHazard(kart);
      kart.heldItem = null;
      kart.heldItemCharges = 0;
    } else if (item.id === 'sirene_comboio') {
      // Electromagnetic Shockwave across the Esplanada
      triggerSireneShockwave(kart);
      kart.heldItem = null;
      kart.heldItemCharges = 0;
    }

    if (kart.isPlayer && onItemPickupCallback) {
      onItemPickupCallback(kart.heldItem, kart.heldItemCharges);
    }
    return item;
  }

  function spawnWaterJetProjectile(ownerKart) {
    const orbGroup = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.1
      })
    );
    orbGroup.add(core);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.12, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
    );
    ring.rotation.x = Math.PI / 2;
    orbGroup.add(ring);

    const forward = new THREE.Vector3(Math.sin(ownerKart.heading), 0, Math.cos(ownerKart.heading));
    const startPos = ownerKart.position.clone().addScaledVector(forward, 3.2);
    startPos.y += 0.9;
    orbGroup.position.copy(startPos);
    hazardsGroup.add(orbGroup);

    if (ownerKart.isPlayer && soundEngine && typeof soundEngine.playItemUse === 'function') {
      soundEngine.playItemUse('jato_fonte');
    }

    activeHazards.push({
      type: 'jato_fonte',
      owner: ownerKart,
      mesh: orbGroup,
      position: startPos,
      splineFraction: (ownerKart.splineFraction + 0.003) % 1,
      speed: 96,
      life: 6.5,
      radius: 2.3
    });
  }

  function spawnPequiHazard(ownerKart) {
    const pequiGroup = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.82, 0),
      new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xca8a04,
        emissiveIntensity: 0.35,
        roughness: 0.3
      })
    );
    pequiGroup.add(body);

    const backward = new THREE.Vector3(-Math.sin(ownerKart.heading), 0, -Math.cos(ownerKart.heading));
    const dropPos = ownerKart.position.clone().addScaledVector(backward, 3.0);
    dropPos.y += 0.65;
    pequiGroup.position.copy(dropPos);
    hazardsGroup.add(pequiGroup);

    if (ownerKart.isPlayer && soundEngine && typeof soundEngine.playItemUse === 'function') {
      soundEngine.playItemUse('casca_pequi');
    }

    activeHazards.push({
      type: 'casca_pequi',
      owner: ownerKart,
      mesh: pequiGroup,
      position: dropPos,
      life: 22.0,
      radius: 1.9
    });
  }

  function triggerSireneShockwave(ownerKart) {
    // Visual expanding ring around ownerKart
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 2.6, 36),
      new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      })
    );
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.copy(ownerKart.position);
    ringMesh.position.y += 0.8;
    hazardsGroup.add(ringMesh);

    activeHazards.push({
      type: 'sirene_wave',
      owner: ownerKart,
      mesh: ringMesh,
      position: ownerKart.position.clone(),
      life: 1.2,
      radius: 0
    });

    // Give owner a surge and shrink/slow all rival karts
    ownerKart.boostTimer = Math.max(ownerKart.boostTimer, 2.2);
    ownerKart.boostPower = Math.max(ownerKart.boostPower, 18);

    for (const other of karts) {
      if (other !== ownerKart && other.starTimer <= 0) {
        other.shrinkTimer = 5.5;
        other.speed *= 0.55;
      }
    }

    if (soundEngine && typeof soundEngine.playItemUse === 'function') {
      soundEngine.playItemUse('sirene_comboio');
    }
  }

  /**
   * Resets a kart cleanly onto the nearest point on the Eixo Monumental road
   */
  function resetKartToTrack(kart) {
    if (!kart) return;
    const { sample } = trackSpline.getClosestSample(kart.position.x, kart.position.z);
    kart.position.copy(sample.point);
    kart.heading = Math.atan2(sample.tangent.x, sample.tangent.z);
    kart.speed = 0;
    kart.spinOutTimer = 0;
    kart.isDrifting = false;
    kart.driftLevel = 0;
    kart.driftCharge = 0;
    kart.meshParts.root.position.copy(kart.position);
    kart.meshParts.root.rotation.y = kart.heading;
  }

  /**
   * Teleports the Player Kart directly to any of the 11 Brasília Landmarks (or Ministries)
   */
  function teleportPlayerToLandmark(landmarkOrId) {
    if (!playerKart) return null;
    const landmark =
      typeof landmarkOrId === 'string'
        ? LANDMARKS.find(l => l.id === landmarkOrId)
        : landmarkOrId;
    if (!landmark || !landmark.position) return null;

    const { sample } = trackSpline.getClosestSample(landmark.position.x, landmark.position.z);
    playerKart.position.copy(sample.point);
    playerKart.heading = Math.atan2(sample.tangent.x, sample.tangent.z);
    playerKart.speed = cruiseAutopilot ? 36 : 0;
    playerKart.spinOutTimer = 0;
    playerKart.isDrifting = false;
    playerKart.driftCharge = 0;
    playerKart.driftLevel = 0;
    playerKart.splineFraction = sample.t;
    playerKart.lastSplineFraction = sample.t;
    playerKart.meshParts.root.position.copy(playerKart.position);
    playerKart.meshParts.root.rotation.y = playerKart.heading;

    return sample;
  }

  /**
   * Updates a single kart's physics, spline progress, drift sparks, and 3D animations
   */
  function updateSingleKart(kart, dt, elapsedTime) {
    // 1. Timers
    if (kart.boostTimer > 0) kart.boostTimer = Math.max(0, kart.boostTimer - dt);
    if (kart.starTimer > 0) kart.starTimer = Math.max(0, kart.starTimer - dt);
    if (kart.spinOutTimer > 0) kart.spinOutTimer = Math.max(0, kart.spinOutTimer - dt);
    if (kart.shrinkTimer > 0) kart.shrinkTimer = Math.max(0, kart.shrinkTimer - dt);

    if (kart.rouletteTimer > 0) {
      kart.rouletteTimer -= dt;
      if (kart.rouletteTimer <= 0) {
        kart.rouletteTimer = 0;
        rollRandomItem(kart);
      }
    }

    // Hop physics
    if (kart.hopHeight > 0 || kart.hopVelocity !== 0) {
      kart.hopHeight += kart.hopVelocity * dt;
      kart.hopVelocity -= 24 * dt;
      if (kart.hopHeight <= 0) {
        kart.hopHeight = 0;
        kart.hopVelocity = 0;
      }
    }

    // Closest track spline sample for road elevation, normal, and lateral offset
    const closest = trackSpline.getClosestSample(kart.position.x, kart.position.z);
    const sample = closest.sample;
    const toKartX = kart.position.x - sample.point.x;
    const toKartZ = kart.position.z - sample.point.z;
    const lateralDist = toKartX * sample.right.x + toKartZ * sample.right.z;
    const absLat = Math.abs(lateralDist);

    // Check if off-road on the Gramado Central
    const isOffRoad = absLat > ROAD_WIDTH * 0.56;

    // 2. Determine Throttle & Steering Input (Player Manual, Cruise Autopilot, or AI)
    let throttle = 0;
    let steerInput = 0;

    if (kart.isPlayer && !cruiseAutopilot) {
      if (keys.up) throttle = 1;
      else if (keys.down) throttle = -0.65;

      if (keys.left) steerInput += 1;
      if (keys.right) steerInput -= 1;

      // Initiate or maintain drift
      if (keys.drift && Math.abs(kart.speed) > 22 && !isOffRoad) {
        if (!kart.isDrifting && Math.abs(steerInput) > 0.1) {
          kart.isDrifting = true;
          kart.driftDirection = steerInput > 0 ? 1 : -1;
          kart.driftCharge = 0;
        }
      } else if (kart.isDrifting && !keys.drift) {
        releaseDriftMiniTurbo(kart);
      }
    } else {
      // AI Racer or Player in Cruise Autopilot mode
      throttle = 1.0;

      // Look ahead along the track spline
      const lookAheadT = (sample.t + 0.014) % 1;
      const targetSample = trackSpline.getSampleAtFraction(lookAheadT);

      if (!kart.isPlayer) {
        // AI dynamically changes lanes and seeks boost pads
        kart.aiLaneTimer -= dt;
        if (kart.aiLaneTimer <= 0) {
          kart.aiLaneTimer = 1.8 + Math.random() * 2.5;
          kart.aiTargetLane = (Math.random() - 0.5) * (ROAD_WIDTH * 0.62);
        }
      } else {
        kart.aiTargetLane = 0; // Cruise autopilot glides smoothly down center lane
      }

      const targetPoint = targetSample.point
        .clone()
        .addScaledVector(targetSample.right, kart.aiTargetLane);
      const dx = targetPoint.x - kart.position.x;
      const dz = targetPoint.z - kart.position.z;
      const desiredHeading = Math.atan2(dx, dz);

      let angleDiff = desiredHeading - kart.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      steerInput = Math.max(-1, Math.min(1, angleDiff * 2.4));

      // AI uses held items strategically
      if (!kart.isPlayer && kart.heldItem && Math.random() < dt * 0.65) {
        useKartItem(kart);
      }
    }

    // 3. Speed & Acceleration calculation
    let maxSpd = kart.baseMaxSpeed;
    if (kart.isPlayer && cruiseAutopilot) {
      maxSpd = 42; // Relaxed sightseeing cruise speed
    } else if (!kart.isPlayer && playerKart) {
      // Smart rubber-banding so AI races stay exciting without runaway gaps
      if (gameMode === 'cruise') {
        maxSpd = 38;
      } else {
        const progressDiff = playerKart.totalProgress - kart.totalProgress;
        const rubberBand = Math.max(-6, Math.min(8, progressDiff * 45));
        maxSpd += rubberBand + kart.aiSkillOffset;
      }
    }

    if (kart.starTimer > 0) maxSpd *= 1.32;
    if (kart.shrinkTimer > 0) maxSpd *= 0.72;
    if (kart.boostTimer > 0) maxSpd += kart.boostPower;
    if (isOffRoad && kart.starTimer <= 0 && kart.boostTimer <= 0) {
      maxSpd *= 0.68;
    }

    if (kart.spinOutTimer > 0) {
      // Spinning out from Pequi or Water Jet
      kart.speed *= Math.pow(0.25, dt);
    } else if (throttle > 0) {
      const accelRate = kart.boostTimer > 0 ? kart.baseAccel * 2.2 : kart.baseAccel;
      kart.speed += accelRate * throttle * dt;
    } else if (throttle < 0) {
      if (kart.speed > 2) {
        kart.speed -= kart.baseAccel * 1.9 * dt; // Braking
      } else {
        kart.speed += kart.baseAccel * 0.75 * throttle * dt; // Reversing
      }
    } else {
      // Natural rolling resistance
      kart.speed *= Math.pow(0.45, dt);
      if (Math.abs(kart.speed) < 0.2) kart.speed = 0;
    }

    // Clamp top speed
    if (kart.speed > maxSpd) {
      kart.speed -= (kart.speed - maxSpd) * Math.min(1, dt * 5.0);
    }
    if (kart.speed < -18) kart.speed = -18;

    // 4. Steering & Mario Kart Drift Mini-Turbo Charge
    const speedFactor = Math.min(1, Math.abs(kart.speed) / 14);
    const reverseSign = kart.speed >= -0.1 ? 1 : -1;

    if (kart.isDrifting) {
      // Drift carving + charging Mini-Turbo sparks (Blue -> Orange -> Purple)
      const driftTurn = (kart.driftDirection * 0.85 + steerInput * 0.55) * kart.baseHandling;
      kart.heading += driftTurn * dt;

      const chargeRate = (1.0 + Math.abs(steerInput) * 0.65) * kart.driftBonus;
      kart.driftCharge += chargeRate * dt;
      if (kart.driftCharge > 2.4) kart.driftLevel = 3; // Purple Ultra Mini-Turbo
      else if (kart.driftCharge > 1.35) kart.driftLevel = 2; // Orange Super Mini-Turbo
      else if (kart.driftCharge > 0.5) kart.driftLevel = 1; // Blue Mini-Turbo
    } else if (kart.spinOutTimer <= 0) {
      kart.heading += steerInput * kart.baseHandling * speedFactor * reverseSign * dt;
    }

    // 5. Move Kart in World Space & Soft Road Boundary Containment
    kart.position.x += Math.sin(kart.heading) * kart.speed * dt;
    kart.position.z += Math.cos(kart.heading) * kart.speed * dt;

    // Smoothly follow track elevation
    const newClosest = trackSpline.getClosestSample(kart.position.x, kart.position.z);
    const s = newClosest.sample;
    kart.position.y += (s.point.y - kart.position.y) * Math.min(1, dt * 15);

    // Boundary containment (wider in 'cruise' mode so player can explore close to monuments)
    const maxAllowedLateral = gameMode === 'cruise' && kart.isPlayer ? ROAD_WIDTH * 1.65 : ROAD_WIDTH * 0.85;
    const newToKartX = kart.position.x - s.point.x;
    const newToKartZ = kart.position.z - s.point.z;
    const newLateral = newToKartX * s.right.x + newToKartZ * s.right.z;

    if (Math.abs(newLateral) > maxAllowedLateral) {
      const sign = Math.sign(newLateral);
      const pushBack = Math.abs(newLateral) - maxAllowedLateral;
      kart.position.x -= s.right.x * sign * pushBack;
      kart.position.z -= s.right.z * sign * pushBack;
      kart.speed *= 0.94;
    }

    // 6. Track Spline Progress & Lap Counter
    const prevT = kart.splineFraction;
    const currT = s.t;
    const deltaT = currT - prevT;

    // Detect crossing the Rodoferroviária start/finish loop (t wraps 0.98 -> 0.02)
    if (deltaT < -0.5) {
      kart.lap += 1;
      if (kart.isPlayer) {
        if (onLapChangeCallback) onLapChangeCallback(kart.lap, totalLaps);
        if (soundEngine && typeof soundEngine.playLapChime === 'function') {
          soundEngine.playLapChime(kart.lap);
        }
        if (gameMode === 'race' && kart.lap > totalLaps && !kart.finished) {
          kart.finished = true;
          kart.finishTime = raceTime;
          raceFinished = true;
          if (onRaceFinishCallback) onRaceFinishCallback(kart.raceRank, raceTime);
        }
      }
    } else if (deltaT > 0.5) {
      kart.lap -= 1;
    }

    kart.lastSplineFraction = prevT;
    kart.splineFraction = currT;
    kart.totalProgress = (kart.lap - 1) + currT;

    // Landmark discovery trigger for Player Kart
    if (kart.isPlayer && s.sectionId !== kart.currentSectionId) {
      kart.currentSectionId = s.sectionId;
      if (onLandmarkEnterCallback) {
        const lm = LANDMARKS.find(l => l.id === s.sectionId);
        if (lm) onLandmarkEnterCallback(lm);
      }
    }

    // 7. Check Boost Pads & Floating Item Boxes
    for (const pad of boostPads) {
      const dx = kart.position.x - pad.position.x;
      const dz = kart.position.z - pad.position.z;
      if (dx * dx + dz * dz < pad.radius * pad.radius) {
        if (kart.boostTimer < 0.8) {
          kart.boostTimer = 1.35;
          kart.boostPower = 22;
          if (kart.isPlayer && soundEngine && typeof soundEngine.playBoost === 'function') {
            soundEngine.playBoost(2);
          }
        }
      }
    }

    for (const box of itemBoxes) {
      if (!box.active) continue;
      const dx = kart.position.x - box.position.x;
      const dz = kart.position.z - box.position.z;
      if (dx * dx + dz * dz < 4.2) {
        box.active = false;
        box.respawnTimer = 6.0;
        box.mesh.visible = false;

        if (!kart.heldItem && kart.rouletteTimer <= 0) {
          kart.rouletteTimer = 1.1;
          if (kart.isPlayer && soundEngine && typeof soundEngine.playItemRoulette === 'function') {
            soundEngine.playItemRoulette();
          }
        }
      }
    }

    // 8. Update 3D Visual Mesh (Roll, Drift Yaw, Wheels, Exhaust Flames, Sparks, Star Aura)
    const {
      root,
      bodyGroup,
      headGroup,
      steeringWheel,
      frontPivots,
      wheelMeshes,
      exhaustFlames,
      sparkSpheres,
      sparkMat,
      auraRing,
      auraMat
    } = kart.meshParts;

    root.position.copy(kart.position);
    root.rotation.y = kart.heading;

    // Scale down if hit by Sirene da Esplanada
    const targetScale = kart.shrinkTimer > 0 ? 0.65 : 1.0;
    root.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), Math.min(1, dt * 8));

    // Hop & Spin-out visual transform on bodyGroup
    bodyGroup.position.y = kart.hopHeight;

    const targetYaw = kart.isDrifting ? kart.driftDirection * 0.36 : 0;
    kart.visualYawOffset += (targetYaw - kart.visualYawOffset) * Math.min(1, dt * 10);

    const spinAngle = kart.spinOutTimer > 0 ? kart.spinOutTimer * Math.PI * 4 : 0;
    bodyGroup.rotation.y = kart.visualYawOffset + spinAngle;

    const targetRoll = -steerInput * 0.12 - (kart.isDrifting ? kart.driftDirection * 0.08 : 0);
    kart.visualRoll += (targetRoll - kart.visualRoll) * Math.min(1, dt * 12);
    bodyGroup.rotation.z = kart.visualRoll;

    // Front wheel steering & 4-wheel spin
    kart.wheelRotation += kart.speed * dt * 1.8;
    for (const pivot of frontPivots) {
      pivot.rotation.y = steerInput * 0.42;
    }
    for (const wm of wheelMeshes) {
      wm.rotation.x = kart.wheelRotation;
    }

    // Steering wheel & Driver head look
    steeringWheel.rotation.z = -steerInput * 0.55;
    headGroup.rotation.y = steerInput * 0.35;

    // Exhaust flames scale with speed & boost
    const flameBoost = kart.boostTimer > 0 || kart.starTimer > 0;
    const flameScale = flameBoost ? 1.55 + Math.sin(elapsedTime * 35) * 0.35 : Math.min(0.85, Math.abs(kart.speed) / 70);
    const flameColor = kart.driftLevel === 3 ? 0xc084fc : flameBoost ? 0x38bdf8 : 0xffaa00;
    for (const fl of exhaustFlames) {
      fl.visible = Math.abs(kart.speed) > 4 || flameBoost;
      fl.scale.set(0.6 + flameScale * 0.5, 0.4 + flameScale * 1.1, 0.6 + flameScale * 0.5);
      fl.material.color.setHex(flameColor);
    }

    // Drift Spark Colors (Level 1 Blue -> Level 2 Orange -> Level 3 Purple)
    if (kart.isDrifting && kart.driftLevel >= 1) {
      sparkMat.opacity = 0.92;
      if (kart.driftLevel === 1) sparkMat.color.setHex(0x38bdf8);
      else if (kart.driftLevel === 2) sparkMat.color.setHex(0xf97316);
      else sparkMat.color.setHex(0xd946ef);

      const pulse = 0.85 + Math.sin(elapsedTime * 40) * 0.35;
      for (const sg of sparkSpheres) {
        sg.scale.set(pulse, pulse, pulse);
      }
    } else {
      sparkMat.opacity = 0;
    }

    // Pequi Dourado Star Invincibility Rainbow Aura
    if (kart.starTimer > 0) {
      auraMat.opacity = 0.85;
      auraMat.color.setHSL((elapsedTime * 1.8) % 1, 1.0, 0.55);
      auraRing.rotation.z = elapsedTime * 5;
    } else {
      auraMat.opacity = 0;
    }
  }

  /**
   * Kart-to-Kart Bumper Collisions & Active Item Projectiles/Hazards
   */
  function updateCollisionsAndHazards(dt, elapsedTime) {
    // 1. Kart-to-Kart collision
    const minSep = 2.35;
    for (let i = 0; i < karts.length; i++) {
      for (let j = i + 1; j < karts.length; j++) {
        const a = karts[i];
        const b = karts[j];
        const dx = b.position.x - a.position.x;
        const dz = b.position.z - a.position.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < minSep * minSep && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = (minSep - dist) * 0.5;
          const nx = dx / dist;
          const nz = dz / dist;

          a.position.x -= nx * overlap;
          a.position.z -= nz * overlap;
          b.position.x += nx * overlap;
          b.position.z += nz * overlap;

          // If one kart has Pequi Dourado Star Invincibility, knock the other into a spin!
          if (a.starTimer > 0 && b.starTimer <= 0 && b.spinOutTimer <= 0) {
            b.spinOutTimer = 1.25;
            b.speed *= 0.35;
          } else if (b.starTimer > 0 && a.starTimer <= 0 && a.spinOutTimer <= 0) {
            a.spinOutTimer = 1.25;
            a.speed *= 0.35;
          }
        }
      }
    }

    // 2. Active Projectiles & Track Hazards
    for (let i = activeHazards.length - 1; i >= 0; i--) {
      const h = activeHazards[i];
      h.life -= dt;

      if (h.type === 'jato_fonte') {
        // Move fast along the track spline and home in on closest rival ahead
        const stepFrac = (h.speed * dt) / trackSpline.totalLength;
        h.splineFraction = (h.splineFraction + stepFrac) % 1;
        const s = trackSpline.getSampleAtFraction(h.splineFraction);

        // Homing towards nearest kart ahead of projectile
        let targetKart = null;
        let bestDist = 42;
        for (const k of karts) {
          if (k === h.owner) continue;
          const d = k.position.distanceTo(h.position);
          if (d < bestDist) {
            bestDist = d;
            targetKart = k;
          }
        }

        if (targetKart) {
          const dir = new THREE.Vector3().subVectors(targetKart.position, h.position).normalize();
          h.position.addScaledVector(dir, h.speed * dt);
        } else {
          h.position.lerp(s.point, Math.min(1, dt * 14));
        }
        h.position.y = s.point.y + 0.9;
        h.mesh.position.copy(h.position);
        h.mesh.rotation.y += dt * 8;
      } else if (h.type === 'casca_pequi') {
        h.mesh.rotation.y += dt * 3;
      } else if (h.type === 'sirene_wave') {
        h.mesh.scale.addScalar(dt * 28);
        h.mesh.material.opacity = Math.max(0, h.life / 1.2);
      }

      // Check collision with karts
      if (h.type === 'jato_fonte' || h.type === 'casca_pequi') {
        for (const k of karts) {
          if (k === h.owner && h.life > 5.8) continue; // grace period on launch
          const dx = k.position.x - h.position.x;
          const dz = k.position.z - h.position.z;
          if (dx * dx + dz * dz < h.radius * h.radius) {
            if (k.starTimer <= 0) {
              k.spinOutTimer = 1.35;
              k.speed *= 0.25;
              if (soundEngine && typeof soundEngine.playHitSpin === 'function') {
                soundEngine.playHitSpin();
              }
            }
            h.life = -1;
            break;
          }
        }
      }

      if (h.life <= 0) {
        hazardsGroup.remove(h.mesh);
        activeHazards.splice(i, 1);
      }
    }

    // 3. Animate & Respawn Floating Item Boxes
    for (const box of itemBoxes) {
      if (!box.active) {
        box.respawnTimer -= dt;
        if (box.respawnTimer <= 0) {
          box.active = true;
          box.mesh.visible = true;
        }
      } else {
        box.mesh.rotation.y = elapsedTime * 2.2 + box.phase;
        box.mesh.rotation.x = Math.sin(elapsedTime * 1.7 + box.phase) * 0.35;
        box.mesh.position.y = box.baseY + Math.sin(elapsedTime * 3.0 + box.phase) * 0.25;
      }
    }
  }

  /**
   * Main frame update called by the game loop
   */
  function update(dt, elapsedTime = performance.now() * 0.001) {
    const clampedDt = Math.min(dt, 0.05);
    if (raceStarted && !raceFinished) {
      raceTime += clampedDt;
    }

    for (const kart of karts) {
      updateSingleKart(kart, clampedDt, elapsedTime);
    }

    updateCollisionsAndHazards(clampedDt, elapsedTime);

    // Compute live race standings sorted by totalProgress
    const sorted = [...karts].sort((a, b) => b.totalProgress - a.totalProgress);
    sorted.forEach((k, idx) => {
      k.raceRank = idx + 1;
    });

    // Update engine RPM sound if soundEngine supports it
    if (playerKart && soundEngine && typeof soundEngine.updateEngineRPM === 'function') {
      const normalizedSpeed = Math.abs(playerKart.speed) / playerKart.baseMaxSpeed;
      soundEngine.updateEngineRPM(normalizedSpeed, playerKart.isDrifting, playerKart.boostTimer > 0);
    }
  }

  /**
   * Returns complete telemetry for HUD, Minimap, and Camera Controllers
   */
  function getPlayerTelemetry() {
    if (!playerKart) return null;
    const kmh = Math.round(Math.abs(playerKart.speed) * 3.2);
    return {
      kart: playerKart,
      position: playerKart.position,
      heading: playerKart.heading,
      speed: playerKart.speed,
      speedKmh: kmh,
      lap: Math.min(playerKart.lap, totalLaps),
      totalLaps,
      rank: playerKart.raceRank,
      totalRacers: karts.length,
      isDrifting: playerKart.isDrifting,
      driftLevel: playerKart.driftLevel,
      boostActive: playerKart.boostTimer > 0,
      starActive: playerKart.starTimer > 0,
      heldItem: playerKart.heldItem,
      heldItemCharges: playerKart.heldItemCharges,
      rouletteActive: playerKart.rouletteTimer > 0,
      sectionId: playerKart.currentSectionId,
      splineFraction: playerKart.splineFraction,
      cruiseAutopilot,
      gameMode,
      raceTime,
      raceFinished
    };
  }

  function getStandings() {
    return [...karts]
      .sort((a, b) => a.raceRank - b.raceRank)
      .map(k => ({
        id: k.id,
        name: k.roster.name,
        emoji: k.roster.emoji,
        color: k.roster.primaryColor,
        isPlayer: k.isPlayer,
        rank: k.raceRank,
        lap: k.lap,
        position: k.position,
        splineFraction: k.splineFraction
      }));
  }

  function setGameMode(mode) {
    gameMode = mode === 'cruise' ? 'cruise' : 'race';
    if (gameMode === 'cruise') {
      // Keep AI as friendly scenic cruisers or visible on the Eixo
      raceFinished = false;
    }
  }

  function setCruiseAutopilot(enabled) {
    cruiseAutopilot = Boolean(enabled);
    return cruiseAutopilot;
  }

  function toggleCruiseAutopilot() {
    cruiseAutopilot = !cruiseAutopilot;
    return cruiseAutopilot;
  }

  function selectPlayerKart(kartId) {
    spawnRacers(kartId);
    raceTime = 0;
    raceFinished = false;
  }

  function restartRace() {
    const currentId = playerKart ? playerKart.id : 'capivara';
    spawnRacers(currentId);
    raceTime = 0;
    raceFinished = false;
  }

  function setMobileControl(action, pressed) {
    const isPressed = Boolean(pressed);
    if (action === 'up') {
      keys.up = isPressed;
      if (isPressed && cruiseAutopilot) cruiseAutopilot = false;
    } else if (action === 'down') {
      keys.down = isPressed;
    } else if (action === 'left') {
      keys.left = isPressed;
    } else if (action === 'right') {
      keys.right = isPressed;
    } else if (action === 'drift') {
      if (isPressed && !keys.drift && playerKart && playerKart.hopHeight <= 0.01) {
        playerKart.hopVelocity = 5.2;
      }
      keys.drift = isPressed;
      if (!isPressed && playerKart && playerKart.isDrifting) {
        releaseDriftMiniTurbo(playerKart);
      }
    }
  }

  return {
    karts,
    keys,
    setMobileControl,
    get playerKart() {
      return playerKart;
    },
    update,
    getPlayerTelemetry,
    getStandings,
    selectPlayerKart,
    restartRace,
    setGameMode,
    setCruiseAutopilot,
    toggleCruiseAutopilot,
    teleportPlayerToLandmark,
    resetKartToTrack: () => resetKartToTrack(playerKart),
    usePlayerItem: () => useKartItem(playerKart),
    onItemPickup: cb => {
      onItemPickupCallback = cb;
    },
    onLandmarkEnter: cb => {
      onLandmarkEnterCallback = cb;
    },
    onLapChange: cb => {
      onLapChangeCallback = cb;
    },
    onRaceFinish: cb => {
      onRaceFinishCallback = cb;
    }
  };
}
