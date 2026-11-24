/**
 * Brasília Kart 3D — Ultra Urban & Architectural Immersion Module (`src/brasiliaCityImmersion.js`)
 *
 * Transforms the Eixo Monumental & Plano Piloto into a dense, hyper-authentic, living 3D Brasília:
 * 1. Always-Visible 3D Floating Panoramic Landmark & Ministry Pins in the Sky (`worldLabels3D`)
 *    with vertical glowing architectural beacon beams and dynamic distance scaling.
 * 2. Iconic Brasília Skyscrapers & Urban Sectors:
 *    - Banco Central do Brasil (21-story black/bronze Cruciform tower in SBS + golden coin crest)
 *    - Sede da Caixa Econômica Federal & Banco do Brasil (SBS & SBN modernist brise-soleil towers)
 *    - Parque da Cidade Sarah Kubitschek (55m rotating Roda-Gigante Nicolândia, lake, pine trees, Kartódromo Carrera)
 *    - Ginásio Nilson Nelson (aluminum conical saucer dome) & Clube do Choro de Brasília
 *    - Setor Hoteleiro Norte (SHN) & Setor Hoteleiro Sul (SHS) dense modernist hotel clusters (Nacional, Kubitschek Plaza, Manhattan, Brasil 21)
 *    - Setor de Autarquias Sul (SAS) & Norte (SAN) (OAB, Correios Tower, DNIT, TCU/STJ annexes)
 *    - Setor Militar Urbano (SMU) — Quartel-General do Exército ("Forte Caxias") & Concha Acústica / Espada de Duque de Caxias
 *    - Torre de TV Digital ("Flor do Cerrado" by Oscar Niemeyer) on the northern horizon hill
 *    - Palácio da Alvorada on the shores of Lago Paranoá with curved white Niemeyer columns & reflecting pool
 * 3. 8 Authentic Overhead Green Brasília Highway Gantries ("Placas Verdes DER-DF / Eixo Monumental")
 *    + Ministry Forecourt Canopies, 3 Flagpoles (Brasil, DF, Ministério), Brise-Soleil ribs & Official Ministerial Sedans.
 * 4. Living Brasília Civil Traffic (Pioneira/Piracicabana/Marechal buses, white taxis, service lane & Eixão traffic),
 *    2 Animated Sightseeing Helicopters with spinning rotors, Lago Paranoá Speedboats & Yachts,
 *    and Candango Tourists / Visitors at landmarks.
 */

import { LANDMARKS, MINISTRIES, ROAD_WIDTH } from './trackData.js';

// ============================================================================
// 1. HIGH-DPI PROCEDURAL CANVAS TEXTURE HELPERS
// ============================================================================

/**
 * Creates a high-contrast 3D sky pin billboard texture for landmarks, ministries, and buildings.
 */
function createSkyPinTexture(THREE, title, subtitle, badgeText, accentColor = '#10b981') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 220;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 640, 220);

  // Outer card with rounded corners & glassmorphic dark Brasília navy background
  const r = 24;
  const x = 16, y = 14, w = 608, h = 154;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  const bgGrad = ctx.createLinearGradient(0, y, 0, y + h);
  bgGrad.addColorStop(0, 'rgba(6, 14, 28, 0.94)');
  bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  // Top accent bar
  ctx.fillStyle = accentColor;
  ctx.fillRect(x + 18, y + 12, w - 36, 7);

  // Badge pill on top-left
  ctx.fillStyle = accentColor;
  ctx.fillRect(x + 22, y + 28, 178, 32);
  ctx.fillStyle = '#04101c';
  ctx.font = '900 18px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText.toUpperCase(), x + 111, y + 45);

  // GPS / Brasília icon indicator on top-right
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x + w - 165, y + 28, 142, 32);
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.fillText('✦ BRASÍLIA DF', x + w - 94, y + 45);

  // Main Building / Monument Name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 31px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 8;
  ctx.fillText(title.toUpperCase(), 320, y + 92);

  // Subtitle / Architect or Sector info
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#bae6fd';
  ctx.font = 'bold 19px "Segoe UI", Arial, sans-serif';
  ctx.fillText(subtitle, 320, y + 132);
  ctx.restore();

  // Downward pointer triangle at bottom center
  ctx.beginPath();
  ctx.moveTo(294, y + h);
  ctx.lineTo(346, y + h);
  ctx.lineTo(320, 210);
  ctx.closePath();
  ctx.fillStyle = accentColor;
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

/**
 * Creates an authentic green DER-DF / DNIT Brasília overhead highway gantry sign texture.
 */
function createGreenHighwaySignTexture(THREE, topCode, line1, line2, exitBadge = 'EIXO MONUMENTAL') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Authentic Brasília emerald highway sign background (#045c3a)
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#065f46');
  grad.addColorStop(1, '#044e38');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);

  // Outer white reflective border
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 996, 228);

  // Top Header Strip (DF-002 / EIXO MONUMENTAL)
  ctx.fillStyle = '#022c22';
  ctx.fillRect(24, 24, 260, 48);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, 260, 48);

  ctx.fillStyle = '#fde047';
  ctx.font = '900 24px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(topCode, 154, 48);

  // Right Yellow Exit / Sector Pill
  ctx.fillStyle = '#facc15';
  ctx.fillRect(720, 24, 276, 48);
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText(exitBadge, 858, 48);

  // Main Line 1 (Large white highway typography)
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 4;
  ctx.fillText(line1, 512, 124);

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 162);
  ctx.lineTo(964, 162);
  ctx.stroke();

  // Secondary Line 2 (Destinations & distances)
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 31px "Segoe UI", Arial, sans-serif';
  ctx.fillText(line2, 512, 202);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

/**
 * Creates a crisp illuminated architectural building facade sign texture.
 */
function createBuildingFacadeSign(THREE, title, subtitle, accentColor = '#fbbf24', bgColor = '#0f172a') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, 48);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText(subtitle, 256, 92);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

/**
 * Helper for terrain elevation around Praça do Cruzeiro hill (`X = -830`)
 */
function getBrasiliaGroundY(x) {
  let h = 0.0;
  if (x < 100 && x > -1420) {
    const distCruzeiro = Math.abs(x - (-830));
    if (distCruzeiro < 600) {
      h += Math.cos((distCruzeiro / 600) * (Math.PI / 2)) * 3.35;
    }
  }
  return h;
}

// ============================================================================
// 2. MAIN ULTRA IMMERSION BUILDER
// ============================================================================

export function buildBrasiliaUltraImmersion(THREE, scene, trackSpline) {
  const immersionRoot = new THREE.Group();
  immersionRoot.name = 'BrasiliaUltraImmersionRoot';
  scene.add(immersionRoot);

  const worldLabels3D = [];
  const civilTraffic = [];
  const animatedFerrisWheels = [];
  const animatedHelicopters = [];
  const animatedBoats = [];
  const animatedTourists = [];
  const dynamicEmissives = [];

  // Shared high-performance materials
  const sharedMats = {
    whiteMarble: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.08
    }),
    brutalistConcrete: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.68,
      metalness: 0.08
    }),
    darkBronzeGlass: new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.16,
      metalness: 0.85,
      emissive: new THREE.Color(0x451a03),
      emissiveIntensity: 0.35
    }),
    bankBlueGlass: new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.18,
      metalness: 0.8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.32
    }),
    hotelWarmGlass: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.22,
      metalness: 0.72,
      emissive: new THREE.Color(0xfef08a),
      emissiveIntensity: 0.28
    }),
    goldMetal: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.22,
      metalness: 0.9,
      emissive: new THREE.Color(0xb45309),
      emissiveIntensity: 0.4
    }),
    silverAluminum: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      metalness: 0.85
    }),
    gantryTruss: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.8
    }),
    officialBlackSedan: new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.15,
      metalness: 0.85
    }),
    flagBrazil: new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      emissive: new THREE.Color(0x15803d),
      emissiveIntensity: 0.3
    }),
    flagDF: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: new THREE.Color(0xfacc15),
      emissiveIntensity: 0.25
    }),
    waterPool: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.08,
      metalness: 0.85,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.3
    })
  };

  dynamicEmissives.push(
    { mat: sharedMats.darkBronzeGlass, day: 0.25, sunset: 0.85, night: 1.35 },
    { mat: sharedMats.bankBlueGlass, day: 0.22, sunset: 0.78, night: 1.25 },
    { mat: sharedMats.hotelWarmGlass, day: 0.18, sunset: 0.82, night: 1.45 }
  );

  // ==========================================================================
  // 1. ALWAYS-VISIBLE 3D FLOATING PANORAMIC SKY PINS & BEACON COLUMNS
  // ==========================================================================
  const labelsGroup = new THREE.Group();
  labelsGroup.name = 'BrasiliaWorldLabels3D';
  immersionRoot.add(labelsGroup);

  const beaconCylGeom = new THREE.CylinderGeometry(0.45, 1.35, 1, 12, 1, true);
  const beaconRingGeom = new THREE.TorusGeometry(4.5, 0.32, 8, 24);

  function registerSkyPin({
    id,
    title,
    subtitle,
    badge,
    x,
    y = 0,
    z,
    roofY = 26,
    pinHeight = 62,
    color = '#10b981',
    category = 'landmark',
    baseScale = 44
  }) {
    const tex = createSkyPinTexture(THREE, title, subtitle, badge, color);
    const spriteMat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, y + pinHeight, z);
    sprite.scale.set(baseScale, baseScale * (220 / 640), 1);
    labelsGroup.add(sprite);

    // Subtle vertical translucent architectural light beacon from roof to sky badge
    const beamH = Math.max(8, pinHeight - roofY - 6);
    const beamMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: category === 'ministry' ? 0.16 : 0.24,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beamMesh = new THREE.Mesh(beaconCylGeom, beamMat);
    beamMesh.scale.set(1, beamH, 1);
    beamMesh.position.set(x, y + roofY + beamH * 0.5, z);
    labelsGroup.add(beamMesh);

    // Subtle glowing architectural roof crown ring
    const ringMesh = new THREE.Mesh(beaconRingGeom, beamMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(x, y + roofY + 0.6, z);
    labelsGroup.add(ringMesh);

    const entry = {
      id,
      title,
      subtitle,
      badge,
      category,
      color,
      position: new THREE.Vector3(x, y + pinHeight, z),
      groundPos: new THREE.Vector3(x, y, z),
      sprite,
      beamMesh,
      ringMesh,
      beamMat,
      baseScale,
      pinHeight
    };
    worldLabels3D.push(entry);
    return entry;
  }

  // 1A. Register all 11 Primary Monumental Landmarks
  const landmarkRoofHeights = {
    rodoferroviaria: { roofY: 22, pinH: 68, badge: 'MARCO ZERO OESTE' },
    memorial_jk: { roofY: 30, pinH: 74, badge: 'MONUMENTO NIEMEYER' },
    rainha_da_paz: { roofY: 32, pinH: 72, badge: 'CATEDRAL MILITAR' },
    catedral_militar_cruz: { roofY: 30, pinH: 74, badge: 'PONTO MAIS ALTO 1172M' },
    planetario_centro_convencoes: { roofY: 20, pinH: 68, badge: 'EIXO CULTURAL' },
    torre_de_tv: { roofY: 145, pinH: 182, badge: 'MIRANTE 224M' },
    rodoviaria_plano_piloto: { roofY: 16, pinH: 68, badge: 'CRUZAMENTO DAS ASAS' },
    complexo_cultural_republica: { roofY: 30, pinH: 74, badge: 'SETOR CULTURAL SUL' },
    catedral_brasilia: { roofY: 40, pinH: 82, badge: 'PATRIMÔNIO UNESCO' },
    esplanada_ministerios: { roofY: 32, pinH: 88, badge: 'EIXO CÍVICO FEDERAL' },
    congresso_nacional: { roofY: 106, pinH: 145, badge: 'PODER LEGISLATIVO' }
  };

  for (const lm of LANDMARKS) {
    const cfg = landmarkRoofHeights[lm.id] || { roofY: 28, pinH: 72, badge: 'MONUMENTO BSB' };
    registerSkyPin({
      id: `pin_${lm.id}`,
      title: lm.shortName || lm.name,
      subtitle: `${lm.architect} (${lm.year})`,
      badge: cfg.badge,
      x: lm.position.x,
      y: lm.position.y,
      z: lm.position.z,
      roofY: cfg.roofY,
      pinHeight: cfg.pinH,
      color: lm.color || '#38bdf8',
      category: 'landmark',
      baseScale: 56
    });
  }

  // 1B. Register all 17 Ministry Blocks + Palácio do Itamaraty + Palácio da Justiça
  for (const min of MINISTRIES) {
    const isPalace = Boolean(min.isPalace);
    registerSkyPin({
      id: `pin_${min.id}`,
      title: min.name,
      subtitle: isPalace
        ? 'OSCAR NIEMEYER — ESPLANADA DOS MINISTÉRIOS'
        : `ESPLANADA DOS MINISTÉRIOS — ${min.code}`,
      badge: min.code,
      x: min.x,
      y: 0,
      z: min.z,
      roofY: isPalace ? 22 : 33,
      pinHeight: isPalace ? 64 : 56 + (min.x % 20 === 0 ? 8 : 0),
      color: min.accent,
      category: isPalace ? 'landmark' : 'ministry',
      baseScale: isPalace ? 50 : 38
    });
  }

  // 1C. Register Iconic Additional Palaces, Stadiums, Towers & Urban Sectors
  const extraMonumentsPins = [
    {
      id: 'pin_palacio_planalto',
      title: 'Palácio do Planalto',
      subtitle: 'Sede do Poder Executivo Federal — Praça dos Três Poderes',
      badge: 'PRESIDÊNCIA',
      x: 1625, y: 0.8, z: -82, roofY: 20, pinHeight: 66, color: '#10b981', baseScale: 52
    },
    {
      id: 'pin_stf',
      title: 'Supremo Tribunal Federal (STF)',
      subtitle: 'Sede do Poder Judiciário — Praça dos Três Poderes',
      badge: 'CORTE SUPREMA',
      x: 1625, y: 0.8, z: 82, roofY: 20, pinHeight: 66, color: '#3b82f6', baseScale: 52
    },
    {
      id: 'pin_panteao_patria',
      title: 'Panteão da Pátria & Mastro 100m',
      subtitle: 'Tancredo Neves & Bandeira Nacional — Três Poderes',
      badge: 'TRÊS PODERES',
      x: 1675, y: 0.8, z: -5, roofY: 96, pinHeight: 122, color: '#facc15', baseScale: 48
    },
    {
      id: 'pin_ponte_jk',
      title: 'Ponte JK & Lago Paranoá',
      subtitle: 'Alexandre Chan (2002) — 3 Arcos Monumentais no Lago',
      badge: 'LAGO PARANOÁ',
      x: 1950, y: 0, z: 0, roofY: 70, pinHeight: 118, color: '#38bdf8', baseScale: 64
    },
    {
      id: 'pin_palacio_alvorada',
      title: 'Palácio da Alvorada',
      subtitle: 'Oscar Niemeyer (1958) — Residência Oficial Presidencial',
      badge: 'PENÍNSULA LAGO',
      x: 1820, y: 0, z: -340, roofY: 22, pinHeight: 74, color: '#fbbf24', baseScale: 58
    },
    {
      id: 'pin_teatro_nacional',
      title: 'Teatro Nacional Cláudio Santoro',
      subtitle: 'Oscar Niemeyer & Painéis de Athos Bulcão (Setor Cultural Norte)',
      badge: 'TEATRO NACIONAL',
      x: 240, y: 0, z: -115, roofY: 32, pinHeight: 70, color: '#f59e0b', baseScale: 48
    },
    {
      id: 'pin_mane_garrincha',
      title: 'Arena BRB Mané Garrincha',
      subtitle: 'Estádio Nacional de Brasília — 288 Colunas Monumentais',
      badge: 'ESTÁDIO NACIONAL',
      x: -460, y: 0, z: -280, roofY: 50, pinHeight: 102, color: '#22c55e', baseScale: 62
    },
    {
      id: 'pin_nilson_nelson',
      title: 'Ginásio Nilson Nelson',
      subtitle: 'Ícaro de Castro Mello (1973) — Complexo Esportivo',
      badge: 'GINÁSIO OLÍMPICO',
      x: -350, y: 0, z: -210, roofY: 28, pinHeight: 68, color: '#38bdf8', baseScale: 46
    },
    {
      id: 'pin_banco_central',
      title: 'Banco Central do Brasil (BACEN)',
      subtitle: 'Edifício-Sede Cruciforme — Setor Bancário Sul (SBS)',
      badge: 'SETOR BANCÁRIO SUL',
      x: 160, y: 0, z: 245, roofY: 96, pinHeight: 132, color: '#f59e0b', baseScale: 58
    },
    {
      id: 'pin_parque_da_cidade',
      title: 'Parque da Cidade Sarah Kubitschek',
      subtitle: 'Roda-Gigante Nicolândia, Kartódromo Carrera & Lago',
      badge: 'PARQUE DA CIDADE',
      x: -650, y: 0, z: 290, roofY: 60, pinHeight: 104, color: '#ec4899', baseScale: 60
    },
    {
      id: 'pin_setor_hoteleiro_norte',
      title: 'Setor Hoteleiro Norte (SHN)',
      subtitle: 'Hotéis Kubitschek Plaza, Manhattan & Nobile Suites',
      badge: 'SETOR HOTELEIRO',
      x: -60, y: 0, z: -185, roofY: 64, pinHeight: 96, color: '#a855f7', baseScale: 46
    },
    {
      id: 'pin_setor_hoteleiro_sul',
      title: 'Setor Hoteleiro Sul & Brasil 21',
      subtitle: 'Hotel Nacional, Complexo Brasil 21 & Meliá Brasília',
      badge: 'SHS / BRASIL 21',
      x: -60, y: 0, z: 185, roofY: 68, pinHeight: 98, color: '#06b6d4', baseScale: 46
    },
    {
      id: 'pin_qg_exercito',
      title: 'QG do Exército (Forte Caxias)',
      subtitle: 'Oscar Niemeyer — Setor Militar Urbano (SMU) & Concha Acústica',
      badge: 'SETOR MILITAR SMU',
      x: -965, y: 2.0, z: -215, roofY: 26, pinHeight: 74, color: '#22c55e', baseScale: 52
    },
    {
      id: 'pin_torre_tv_digital',
      title: 'Torre de TV Digital (Flor do Cerrado)',
      subtitle: 'Oscar Niemeyer (2012) — Mirante Sobradinho / Colorado',
      badge: 'FLOR DO CERRADO',
      x: -300, y: 45, z: -850, roofY: 115, pinHeight: 155, color: '#38bdf8', baseScale: 68
    }
  ];

  for (const ep of extraMonumentsPins) {
    registerSkyPin({
      ...ep,
      category: 'landmark'
    });
  }

  // ==========================================================================
  // 2. ICONIC MISSING BRASÍLIA SKYSCRAPERS & URBAN SECTORS
  // ==========================================================================

  // --------------------------------------------------------------------------
  // 2A. BANCO CENTRAL DO BRASIL & SETOR BANCÁRIO SUL / NORTE (`X = +110..+220, Z = ±245`)
  // --------------------------------------------------------------------------
  function buildSetorBancarioAndBancoCentral() {
    const sbsGroup = new THREE.Group();
    sbsGroup.name = 'SetorBancarioSul_Norte';
    immersionRoot.add(sbsGroup);

    // 1. BANCO CENTRAL DO BRASIL (`X = +160, Z = +245`) — Iconic 21-Story Black/Bronze Cruciform Tower
    const bacen = new THREE.Group();
    bacen.position.set(160, 0, 245);

    // Broad Granite Podium Base with pilotis columns
    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(62, 6.5, 58),
      sharedMats.brutalistConcrete
    );
    podium.position.y = 3.25;
    bacen.add(podium);

    const podiumGlass = new THREE.Mesh(
      new THREE.BoxGeometry(58, 4.2, 54),
      sharedMats.darkBronzeGlass
    );
    podiumGlass.position.y = 3.2;
    bacen.add(podiumGlass);

    // Cruciform (Cross-Shaped) 21-Story Brutalist Dark-Bronze Tower (Height = 86m)
    const towerH = 86;
    const wingA = new THREE.Mesh(
      new THREE.BoxGeometry(46, towerH, 18),
      sharedMats.darkBronzeGlass
    );
    wingA.position.y = 6.5 + towerH * 0.5;
    wingA.castShadow = true;
    bacen.add(wingA);

    const wingB = new THREE.Mesh(
      new THREE.BoxGeometry(18, towerH, 46),
      sharedMats.darkBronzeGlass
    );
    wingB.position.y = 6.5 + towerH * 0.5;
    wingB.castShadow = true;
    bacen.add(wingB);

    // Vertical structural bronze concrete piers & horizontal floor slab fins
    for (let yFloor = 12; yFloor <= 88; yFloor += 7.5) {
      const finA = new THREE.Mesh(
        new THREE.BoxGeometry(47.2, 0.55, 19.2),
        sharedMats.brutalistConcrete
      );
      finA.position.y = yFloor;
      bacen.add(finA);

      const finB = new THREE.Mesh(
        new THREE.BoxGeometry(19.2, 0.55, 47.2),
        sharedMats.brutalistConcrete
      );
      finB.position.y = yFloor;
      bacen.add(finB);
    }

    // Rooftop Golden Coin / Centurion Emblem & Helipad Crown
    const roofCrown = new THREE.Mesh(
      new THREE.BoxGeometry(24, 3.5, 24),
      sharedMats.brutalistConcrete
    );
    roofCrown.position.y = 94.2;
    bacen.add(roofCrown);

    const goldCoinEmblem = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 5.5, 1.4, 24),
      sharedMats.goldMetal
    );
    goldCoinEmblem.rotation.x = Math.PI / 2;
    goldCoinEmblem.position.set(0, 96.5, -12.5);
    bacen.add(goldCoinEmblem);

    // High-contrast illuminated rooftop sign facing the Eixo Monumental (North)
    const bacenSignTex = createBuildingFacadeSign(
      THREE,
      'BANCO CENTRAL DO BRASIL',
      'EDIFÍCIO-SEDE — SETOR BANCÁRIO SUL (SBS)',
      '#facc15',
      '#1c1917'
    );
    const bacenSignMat = new THREE.MeshStandardMaterial({
      map: bacenSignTex,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: bacenSignTex,
      emissiveIntensity: 0.9
    });
    const bacenSign = new THREE.Mesh(new THREE.BoxGeometry(44, 7.5, 1.6), bacenSignMat);
    bacenSign.position.set(0, 93, -23.5);
    bacen.add(bacenSign);

    sbsGroup.add(bacen);

    // 2. SEDE DA CAIXA ECONÔMICA FEDERAL (`X = +215, Z = +235`) & BANCO DO BRASIL (`X = +105, Z = +255`)
    const bankingTowers = [
      {
        name: 'CAIXA ECONÔMICA FEDERAL',
        sub: 'MATRIZ SBS — BRASÍLIA DF',
        x: 222, z: 235, w: 38, h: 68, d: 22,
        accent: '#38bdf8', bg: '#0c4a6e', mat: sharedMats.bankBlueGlass
      },
      {
        name: 'BANCO DO BRASIL — SEDE',
        sub: 'SETOR BANCÁRIO SUL (SBS)',
        x: 98, z: 252, w: 36, h: 72, d: 22,
        accent: '#facc15', bg: '#1e3a8a', mat: sharedMats.hotelWarmGlass
      },
      {
        name: 'SETOR BANCÁRIO NORTE (SBN)',
        sub: 'ED. SEDE BB & CNC BRASÍLIA',
        x: 155, z: -245, w: 42, h: 70, d: 24,
        accent: '#38bdf8', bg: '#0f172a', mat: sharedMats.bankBlueGlass
      },
      {
        name: 'BNDES / BRB CENTRO',
        sub: 'SETOR BANCÁRIO NORTE',
        x: 215, z: -235, w: 34, h: 58, d: 20,
        accent: '#10b981', bg: '#064e3b', mat: sharedMats.hotelWarmGlass
      }
    ];

    for (const bt of bankingTowers) {
      const tGroup = new THREE.Group();
      tGroup.position.set(bt.x, 0, bt.z);

      const body = new THREE.Mesh(new THREE.BoxGeometry(bt.w, bt.h, bt.d), bt.mat);
      body.position.y = bt.h * 0.5;
      body.castShadow = true;
      tGroup.add(body);

      // Modernist Concrete Brise-Soleil Grid Framing
      const frameL = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, bt.h + 1, bt.d + 1.2),
        sharedMats.whiteMarble
      );
      frameL.position.set(-bt.w * 0.5, bt.h * 0.5, 0);
      tGroup.add(frameL);

      const frameR = frameL.clone();
      frameR.position.x = bt.w * 0.5;
      tGroup.add(frameR);

      const signTex = createBuildingFacadeSign(THREE, bt.name, bt.sub, bt.accent, bt.bg);
      const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bt.w - 2, 5.8, 1.2),
        new THREE.MeshStandardMaterial({
          map: signTex,
          emissive: new THREE.Color(0xffffff),
          emissiveMap: signTex,
          emissiveIntensity: 0.8
        })
      );
      signMesh.position.set(0, bt.h + 3.2, bt.z > 0 ? -bt.d * 0.5 : bt.d * 0.5);
      tGroup.add(signMesh);

      sbsGroup.add(tGroup);
    }
  }
  buildSetorBancarioAndBancoCentral();

  // --------------------------------------------------------------------------
  // 2B. PARQUE DA CIDADE SARAH KUBITSCHEK & RODA-GIGANTE NICOLÂNDIA (`X = -650, Z = +290`)
  // --------------------------------------------------------------------------
  function buildParqueDaCidade() {
    const parkGroup = new THREE.Group();
    parkGroup.name = 'ParqueDaCidadeSarahKubitschek';
    parkGroup.position.set(-650, 0, 290);
    immersionRoot.add(parkGroup);

    // Expansive Artificial Lake of Parque da Cidade
    const lake = new THREE.Mesh(
      new THREE.CylinderGeometry(85, 85, 0.35, 32),
      sharedMats.waterPool
    );
    lake.scale.set(1.6, 1, 0.85);
    lake.position.set(35, 0.18, 25);
    parkGroup.add(lake);

    // 1. GIANT 55M ROTATING ILLUMINATED FERRIS WHEEL (Roda-Gigante Nicolândia Center Park)
    const ferrisBase = new THREE.Group();
    ferrisBase.position.set(-30, 0, -25);
    parkGroup.add(ferrisBase);

    // A-Frame Steel Support Legs
    for (const zLeg of [-4.5, 4.5]) {
      for (const xSlope of [-1, 1]) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.75, 1.15, 36, 10),
          sharedMats.whiteMarble
        );
        leg.position.set(xSlope * 8.5, 16.5, zLeg);
        leg.rotation.z = xSlope * 0.26;
        ferrisBase.add(leg);
      }
    }

    // Rotating Wheel Assembly at hub height Y = 32m (Total height ~58m)
    const wheelHub = new THREE.Group();
    wheelHub.position.set(0, 32, 0);
    ferrisBase.add(wheelHub);

    const wheelRadius = 25;
    const neonRimMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: new THREE.Color(0xec4899),
      emissiveIntensity: 1.25
    });
    const innerRimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 1.15
    });

    for (const zRim of [-2.2, 2.2]) {
      const outerRim = new THREE.Mesh(
        new THREE.TorusGeometry(wheelRadius, 0.55, 10, 36),
        neonRimMat
      );
      outerRim.position.z = zRim;
      wheelHub.add(outerRim);

      const innerRim = new THREE.Mesh(
        new THREE.TorusGeometry(wheelRadius * 0.62, 0.38, 8, 28),
        innerRimMat
      );
      innerRim.position.z = zRim;
      wheelHub.add(innerRim);
    }

    // 16 Radial Spokes & Colorful Passenger Gondola Cabins
    const cabinColors = [0xef4444, 0xfacc15, 0x22c55e, 0x38bdf8, 0xa855f7, 0xf97316];
    const cabins = [];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, wheelRadius * 2, 6),
        sharedMats.silverAluminum
      );
      spoke.rotation.z = angle;
      wheelHub.add(spoke);

      const cabinPivot = new THREE.Group();
      cabinPivot.position.set(
        Math.cos(angle) * wheelRadius,
        Math.sin(angle) * wheelRadius,
        0
      );
      const cabinMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 3.6, 3.4),
        new THREE.MeshStandardMaterial({
          color: cabinColors[i % cabinColors.length],
          emissive: new THREE.Color(cabinColors[i % cabinColors.length]),
          emissiveIntensity: 0.45,
          roughness: 0.25
        })
      );
      cabinMesh.position.y = -1.6;
      cabinPivot.add(cabinMesh);
      wheelHub.add(cabinPivot);
      cabins.push(cabinPivot);
    }

    animatedFerrisWheels.push({ wheelHub, cabins });

    // Nicolândia & Kartódromo Carrera Illuminated Portal Sign facing Via S1
    const parkSignTex = createBuildingFacadeSign(
      THREE,
      'PARQUE DA CIDADE SARAH KUBITSCHEK',
      'NICOLÂNDIA CENTER PARK & KARTÓDROMO CARRERA',
      '#ec4899',
      '#1e1b4b'
    );
    const parkSign = new THREE.Mesh(
      new THREE.BoxGeometry(52, 7.2, 1.6),
      new THREE.MeshStandardMaterial({
        map: parkSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: parkSignTex,
        emissiveIntensity: 0.85
      })
    );
    parkSign.position.set(-10, 12, -88);
    parkGroup.add(parkSign);

    // Cluster of Brasília Pine Trees (Pinheiros do Parque da Cidade)
    const pineLeafMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.75 });
    const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    for (let p = 0; p < 28; p++) {
      const px = -120 + (p * 11) % 240;
      const pz = -75 + ((p * 37) % 140);
      if (Math.abs(px + 30) < 28 && Math.abs(pz + 25) < 28) continue;

      const pine = new THREE.Group();
      pine.position.set(px, 0, pz);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 6, 6), pineTrunkMat);
      trunk.position.y = 3;
      pine.add(trunk);

      const cone = new THREE.Mesh(new THREE.ConeGeometry(3.8, 12, 7), pineLeafMat);
      cone.position.y = 10;
      pine.add(cone);
      parkGroup.add(pine);
    }
  }
  buildParqueDaCidade();

  // --------------------------------------------------------------------------
  // 2C. GINÁSIO NILSON NELSON (`X = -350, Z = -210`) & CLUBE DO CHORO (`X = -520, Z = -150`)
  // --------------------------------------------------------------------------
  function buildNilsonNelsonAndClubeDoChoro() {
    const sportGroup = new THREE.Group();
    sportGroup.name = 'GinasioNilsonNelson_ClubeDoChoro';
    immersionRoot.add(sportGroup);

    // 1. GINÁSIO NILSON NELSON (`X = -350, Z = -210`) — Sweeping Aluminum Saucer Cone next to Mané Garrincha
    const nilson = new THREE.Group();
    nilson.position.set(-350, 0, -210);

    const lowerBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(48, 38, 12, 36),
      sharedMats.brutalistConcrete
    );
    lowerBowl.position.y = 6;
    nilson.add(lowerBowl);

    // 32 Angled Brutalist Perimeter Buttress Ribs
    for (let r = 0; r < 32; r++) {
      const a = (r / 32) * Math.PI * 2;
      const rib = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 16, 5.5),
        sharedMats.whiteMarble
      );
      rib.position.set(Math.cos(a) * 45, 8, Math.sin(a) * 45);
      rib.rotation.y = -a + Math.PI / 2;
      nilson.add(rib);
    }

    // Sweeping Conical Metallic Aluminum Roof Dome
    const saucerRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 52, 9.5, 36),
      sharedMats.silverAluminum
    );
    saucerRoof.position.y = 16.5;
    saucerRoof.castShadow = true;
    nilson.add(saucerRoof);

    const nilsonSignTex = createBuildingFacadeSign(
      THREE,
      'GINÁSIO NILSON NELSON',
      'COMPLEXO ESPORTIVO DE BRASÍLIA — 11.000 LUGARES',
      '#38bdf8',
      '#0f172a'
    );
    const nilsonSign = new THREE.Mesh(
      new THREE.BoxGeometry(38, 5.5, 1.4),
      new THREE.MeshStandardMaterial({
        map: nilsonSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: nilsonSignTex,
        emissiveIntensity: 0.75
      })
    );
    nilsonSign.position.set(0, 23.5, 42);
    nilson.add(nilsonSign);
    sportGroup.add(nilson);

    // 2. CLUBE DO CHORO DE BRASÍLIA (`X = -520, Z = -148`) — Niemeyer's Curved Half-Arch Pavilion
    const choro = new THREE.Group();
    choro.position.set(-520, 1.5, -148);

    const choroBase = new THREE.Mesh(
      new THREE.BoxGeometry(36, 4.5, 22),
      sharedMats.whiteMarble
    );
    choroBase.position.y = 2.25;
    choro.add(choroBase);

    const choroArch = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 12, 20, 20, 1, false, 0, Math.PI),
      sharedMats.whiteMarble
    );
    choroArch.rotation.x = Math.PI / 2;
    choroArch.position.set(0, 4.5, 0);
    choro.add(choroArch);

    const choroSignTex = createBuildingFacadeSign(
      THREE,
      'CLUBE DO CHORO DE BRASÍLIA',
      'ESPAÇO CULTURAL PIXINGUINHA — OSCAR NIEMEYER',
      '#f59e0b',
      '#1c1917'
    );
    const choroSign = new THREE.Mesh(
      new THREE.BoxGeometry(28, 4.2, 1.0),
      new THREE.MeshStandardMaterial({
        map: choroSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: choroSignTex,
        emissiveIntensity: 0.75
      })
    );
    choroSign.position.set(0, 13.5, 11);
    choro.add(choroSign);

    sportGroup.add(choro);
  }
  buildNilsonNelsonAndClubeDoChoro();

  // --------------------------------------------------------------------------
  // 2D. SETOR HOTELEIRO NORTE (SHN) & SETOR HOTELEIRO SUL (SHS) (`X = -155..+35, Z = ±140..±240`)
  // --------------------------------------------------------------------------
  function buildSetoresHoteleiros() {
    const hotelsGroup = new THREE.Group();
    hotelsGroup.name = 'SetorHoteleiroNorte_Sul';
    immersionRoot.add(hotelsGroup);

    const hotelConfigs = [
      // Setor Hoteleiro Norte (SHN — North of Torre de TV & Rodoviária)
      { name: 'KUBITSCHEK PLAZA', sub: 'SETOR HOTELEIRO NORTE — SHN', x: -135, z: -158, w: 32, h: 58, d: 20, accent: '#fbbf24' },
      { name: 'MANHATTAN PLAZA', sub: 'SHN QUADRA 2 — BRASÍLIA', x: -85, z: -195, w: 30, h: 64, d: 22, accent: '#38bdf8' },
      { name: 'CULLINAN HPLUS PREMIUM', sub: 'SETOR HOTELEIRO NORTE', x: -35, z: -162, w: 34, h: 54, d: 20, accent: '#a855f7' },
      { name: 'ATHOS BULCÃO HPLUS', sub: 'SHN — ARTE MODERNISTA', x: 15, z: -190, w: 28, h: 52, d: 20, accent: '#10b981' },
      // Setor Hoteleiro Sul (SHS — South of Torre de TV & Rodoviária)
      { name: 'HOTEL NACIONAL', sub: 'MARCO HISTÓRICO — SHS QUADRA 1', x: -20, z: 155, w: 42, h: 46, d: 22, accent: '#f59e0b' },
      { name: 'COMPLEXO BRASIL 21', sub: 'MELIÁ BRASÍLIA — TORRE I', x: -135, z: 162, w: 28, h: 66, d: 22, accent: '#06b6d4' },
      { name: 'BRASIL 21 CONVENTION', sub: 'SHS — CENTRO DE EVENTOS', x: -92, z: 192, w: 28, h: 62, d: 22, accent: '#ec4899' },
      { name: 'WINDSOR PLAZA BRASÍLIA', sub: 'SETOR HOTELEIRO SUL — SHS', x: 25, z: 195, w: 32, h: 56, d: 20, accent: '#22c55e' }
    ];

    for (const h of hotelConfigs) {
      const hGroup = new THREE.Group();
      hGroup.position.set(h.x, 0, h.z);

      // Pilotis hotel lobby base
      const lobby = new THREE.Mesh(
        new THREE.BoxGeometry(h.w + 4, 5.5, h.d + 4),
        sharedMats.whiteMarble
      );
      lobby.position.y = 2.75;
      hGroup.add(lobby);

      // Main glass hotel tower
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(h.w, h.h, h.d),
        sharedMats.hotelWarmGlass
      );
      tower.position.y = 5.5 + h.h * 0.5;
      tower.castShadow = true;
      hGroup.add(tower);

      // Vertical Modernist Balcony Ribs
      for (let bx = -h.w * 0.4; bx <= h.w * 0.4; bx += h.w * 0.4) {
        const rib = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, h.h, h.d + 1.2),
          sharedMats.whiteMarble
        );
        rib.position.set(bx, 5.5 + h.h * 0.5, 0);
        hGroup.add(rib);
      }

      // Rooftop Helipad & Swimming Pool Terrace
      const roofSlab = new THREE.Mesh(
        new THREE.BoxGeometry(h.w + 2, 1.8, h.d + 2),
        sharedMats.whiteMarble
      );
      roofSlab.position.y = 5.5 + h.h + 0.9;
      hGroup.add(roofSlab);

      const rooftopPool = new THREE.Mesh(
        new THREE.BoxGeometry(h.w * 0.45, 0.4, h.d * 0.45),
        sharedMats.waterPool
      );
      rooftopPool.position.set(-4, 5.5 + h.h + 1.9, 0);
      hGroup.add(rooftopPool);

      // Illuminated Hotel Crown Sign facing the Eixo Monumental
      const signTex = createBuildingFacadeSign(THREE, h.name, h.sub, h.accent, '#0f172a');
      const signMesh = new THREE.Mesh(
        new THREE.BoxGeometry(h.w - 2, 4.8, 1.2),
        new THREE.MeshStandardMaterial({
          map: signTex,
          emissive: new THREE.Color(0xffffff),
          emissiveMap: signTex,
          emissiveIntensity: 0.85
        })
      );
      const faceZ = h.z < 0 ? h.d * 0.5 + 0.8 : -h.d * 0.5 - 0.8;
      signMesh.position.set(0, 5.5 + h.h + 4.2, faceZ);
      hGroup.add(signMesh);

      hotelsGroup.add(hGroup);
    }
  }
  buildSetoresHoteleiros();

  // --------------------------------------------------------------------------
  // 2E. SETOR DE AUTARQUIAS SUL (SAS) & NORTE (SAN) (`X = +310..+550, Z = ±195`)
  // --------------------------------------------------------------------------
  function buildSetorAutarquias() {
    const autarquiasGroup = new THREE.Group();
    autarquiasGroup.name = 'SetorAutarquiasSul_Norte';
    immersionRoot.add(autarquiasGroup);

    const buildings = [
      { name: 'SEDE DOS CORREIOS', sub: 'SETOR BANCÁRIO / AUTARQUIAS NORTE', x: 315, z: -185, w: 32, h: 62, d: 22, accent: '#facc15' },
      { name: 'DNIT & ANTT — SEDE', sub: 'SETOR DE AUTARQUIAS NORTE (SAN)', x: 405, z: -195, w: 44, h: 38, d: 20, accent: '#38bdf8' },
      { name: 'CONSELHO FEDERAL OAB', sub: 'SAUS — ORDEM DOS ADVOGADOS DO BRASIL', x: 500, z: -185, w: 38, h: 42, d: 20, accent: '#ef4444' },
      { name: 'CAIXA CULTURAL & SAS', sub: 'SETOR DE AUTARQUIAS SUL', x: 335, z: 205, w: 38, h: 48, d: 22, accent: '#f97316' },
      { name: 'TRIBUNAL REGIONAL TRF1', sub: 'SETOR DE AUTARQUIAS SUL (SAS)', x: 515, z: 210, w: 42, h: 52, d: 22, accent: '#10b981' }
    ];

    for (const b of buildings) {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0, b.z);

      const prism = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, b.h, b.d),
        sharedMats.bankBlueGlass
      );
      prism.position.y = b.h * 0.5;
      prism.castShadow = true;
      bGroup.add(prism);

      // Horizontal concrete sun-breakers (brises)
      for (let y = 8; y < b.h; y += 8) {
        const brise = new THREE.Mesh(
          new THREE.BoxGeometry(b.w + 1.2, 0.9, b.d + 1.2),
          sharedMats.whiteMarble
        );
        brise.position.y = y;
        bGroup.add(brise);
      }

      const signTex = createBuildingFacadeSign(THREE, b.name, b.sub, b.accent, '#0f172a');
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(b.w - 2, 4.8, 1.2),
        new THREE.MeshStandardMaterial({
          map: signTex,
          emissive: new THREE.Color(0xffffff),
          emissiveMap: signTex,
          emissiveIntensity: 0.78
        })
      );
      sign.position.set(0, b.h + 2.8, b.z < 0 ? b.d * 0.5 : -b.d * 0.5);
      bGroup.add(sign);

      autarquiasGroup.add(bGroup);
    }
  }
  buildSetorAutarquias();

  // --------------------------------------------------------------------------
  // 2F. SETOR MILITAR URBANO (SMU) — QG DO EXÉRCITO ("FORTE CAXIAS" & CONCHA ACÚSTICA) (`X = -965, Z = -215`)
  // --------------------------------------------------------------------------
  function buildSetorMilitarUrbano() {
    const smuGroup = new THREE.Group();
    smuGroup.name = 'SetorMilitarUrbano_QGExercito';
    smuGroup.position.set(-965, 2.0, -215);
    immersionRoot.add(smuGroup);

    // Monumental Horizontal Modernist Palace of QG do Exército (Oscar Niemeyer)
    const qgBlocks = [-65, 0, 65];
    for (const bx of qgBlocks) {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(54, 15, 18),
        sharedMats.bankBlueGlass
      );
      block.position.set(bx, 9.5, -18);
      block.castShadow = true;
      smuGroup.add(block);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(58, 1.8, 21),
        sharedMats.whiteMarble
      );
      roof.position.set(bx, 17.5, -18);
      smuGroup.add(roof);
    }

    // Long Continuous Ceremonial Colonnade Porch connecting the 3 blocks
    const colonnadeBeam = new THREE.Mesh(
      new THREE.BoxGeometry(194, 1.6, 8),
      sharedMats.whiteMarble
    );
    colonnadeBeam.position.set(0, 6.2, -5);
    smuGroup.add(colonnadeBeam);

    // Iconic "Concha Acústica & Espada de Duque de Caxias" Obelisk in front of QG
    const conchaShell = new THREE.Mesh(
      new THREE.SphereGeometry(14, 24, 16, 0, Math.PI),
      sharedMats.whiteMarble
    );
    conchaShell.scale.set(1.5, 0.75, 0.8);
    conchaShell.position.set(0, 2, 16);
    smuGroup.add(conchaShell);

    const swordObelisk = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 32, 1.4),
      sharedMats.silverAluminum
    );
    swordObelisk.position.set(0, 16, 20);
    smuGroup.add(swordObelisk);

    const swordGuard = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 1.4, 1.8),
      sharedMats.goldMetal
    );
    swordGuard.position.set(0, 23, 20);
    smuGroup.add(swordGuard);

    const qgSignTex = createBuildingFacadeSign(
      THREE,
      'QUARTEL-GENERAL DO EXÉRCITO — FORTE CAXIAS',
      'SETOR MILITAR URBANO (SMU) — CONCHA ACÚSTICA & ESPADA DE CAXIAS',
      '#22c55e',
      '#052e16'
    );
    const qgSign = new THREE.Mesh(
      new THREE.BoxGeometry(64, 6.5, 1.5),
      new THREE.MeshStandardMaterial({
        map: qgSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: qgSignTex,
        emissiveIntensity: 0.8
      })
    );
    qgSign.position.set(0, 21.5, -8);
    smuGroup.add(qgSign);
  }
  buildSetorMilitarUrbano();

  // --------------------------------------------------------------------------
  // 2G. TORRE DE TV DIGITAL ("FLOR DO CERRADO") (`X = -300, Z = -850, Y = +45`)
  //     & PALÁCIO DA ALVORADA (`X = +1820, Z = -340`)
  // --------------------------------------------------------------------------
  function buildTorreDigitalAndPalacioAlvorada() {
    // 1. TORRE DE TV DIGITAL ("Flor do Cerrado" by Oscar Niemeyer on the Northern Horizon Hill)
    const digitalGroup = new THREE.Group();
    digitalGroup.name = 'TorreDeTVDigital_FlorDoCerrado';
    digitalGroup.position.set(-300, 0, -850);
    immersionRoot.add(digitalGroup);

    // Northern Horizon Hill Mound (Sobradinho / Colorado Ridge)
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(260, 48, 24),
      new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.9 })
    );
    hill.position.y = 24;
    digitalGroup.add(hill);

    const towerBase = new THREE.Group();
    towerBase.position.y = 45;
    digitalGroup.add(towerBase);

    // White Concrete Stem with Circular Windows
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 9.5, 86, 20),
      sharedMats.whiteMarble
    );
    stem.position.y = 43;
    towerBase.add(stem);

    // Two Outstretched Glass-Domed "Petals" branching from the stem
    for (const side of [-1, 1]) {
      const petalBranch = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.8, 22, 12),
        sharedMats.whiteMarble
      );
      petalBranch.position.set(side * 10, 58 + side * 6, 0);
      petalBranch.rotation.z = -side * 0.72;
      towerBase.add(petalBranch);

      const petalCup = new THREE.Mesh(
        new THREE.SphereGeometry(9.5, 20, 16),
        sharedMats.whiteMarble
      );
      petalCup.scale.set(1.2, 0.75, 1.2);
      petalCup.position.set(side * 19, 65 + side * 6, 0);
      towerBase.add(petalCup);

      const petalGlass = new THREE.Mesh(
        new THREE.SphereGeometry(8.2, 16, 12),
        sharedMats.bankBlueGlass
      );
      petalGlass.position.set(side * 19, 67 + side * 6, 0);
      towerBase.add(petalGlass);
    }

    // Top Metallic Digital Broadcast Spire
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 2.2, 34, 12),
      sharedMats.silverAluminum
    );
    spire.position.y = 102;
    towerBase.add(spire);

    // 2. PALÁCIO DA ALVORADA (`X = +1820, Z = -340`) — Iconic Curved Niemeyer Columns on Lago Paranoá
    const alvorada = new THREE.Group();
    alvorada.name = 'PalacioDaAlvorada';
    alvorada.position.set(1820, 0, -340);
    immersionRoot.add(alvorada);

    // Reflecting Pool in front of Palácio da Alvorada
    const alvoradaPool = new THREE.Mesh(
      new THREE.BoxGeometry(82, 0.35, 36),
      sharedMats.waterPool
    );
    alvoradaPool.position.set(0, 0.18, 32);
    alvorada.add(alvoradaPool);

    // Palace Glass Box & White Marble Slabs
    const palaceGlass = new THREE.Mesh(
      new THREE.BoxGeometry(66, 13, 28),
      sharedMats.bankBlueGlass
    );
    palaceGlass.position.y = 7.2;
    alvorada.add(palaceGlass);

    const palaceBase = new THREE.Mesh(
      new THREE.BoxGeometry(74, 1.4, 34),
      sharedMats.whiteMarble
    );
    palaceBase.position.y = 0.7;
    alvorada.add(palaceBase);

    const palaceRoof = new THREE.Mesh(
      new THREE.BoxGeometry(76, 1.6, 36),
      sharedMats.whiteMarble
    );
    palaceRoof.position.y = 14.2;
    alvorada.add(palaceRoof);

    // Iconic Curved Hammock/Feather Columns of Palácio da Alvorada (Symbol of Brasília's coat of arms!)
    for (let cx = -32; cx <= 32; cx += 8) {
      const colGroup = new THREE.Group();
      colGroup.position.set(cx, 0.7, 17.5);

      const lowerDiamond = new THREE.Mesh(
        new THREE.ConeGeometry(4.0, 7.2, 4),
        sharedMats.whiteMarble
      );
      lowerDiamond.scale.set(1.0, 1.0, 0.25);
      lowerDiamond.position.y = 3.6;
      colGroup.add(lowerDiamond);

      const upperDiamond = new THREE.Mesh(
        new THREE.ConeGeometry(4.0, 7.2, 4),
        sharedMats.whiteMarble
      );
      upperDiamond.rotation.x = Math.PI;
      upperDiamond.scale.set(1.0, 1.0, 0.25);
      upperDiamond.position.y = 10.2;
      colGroup.add(upperDiamond);

      alvorada.add(colGroup);
    }

    // Chapel of Palácio da Alvorada (Spiral white cylinder next to the palace)
    const chapel = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 8, 11, 24),
      sharedMats.whiteMarble
    );
    chapel.position.set(-48, 5.5, 10);
    alvorada.add(chapel);

    const alvoradaSignTex = createBuildingFacadeSign(
      THREE,
      'PALÁCIO DA ALVORADA',
      'OSCAR NIEMEYER (1958) — RESIDÊNCIA OFICIAL DA PRESIDÊNCIA',
      '#fbbf24',
      '#0f172a'
    );
    const alvoradaSign = new THREE.Mesh(
      new THREE.BoxGeometry(54, 6.2, 1.4),
      new THREE.MeshStandardMaterial({
        map: alvoradaSignTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: alvoradaSignTex,
        emissiveIntensity: 0.85
      })
    );
    alvoradaSign.position.set(0, 18.5, 16);
    alvorada.add(alvoradaSign);
  }
  buildTorreDigitalAndPalacioAlvorada();

  // ==========================================================================
  // 3. BRASÍLIA GREEN OVERHEAD HIGHWAY GANTRIES ("PLACAS VERDES DO EIXO")
  //    & MINISTRY FORECOURT DETAILS (CANOPIES, FLAGS, BRISE-SOLEIL, SEDANS)
  // ==========================================================================
  function buildHighwayGantriesAndMinistryForecourts() {
    const infraGroup = new THREE.Group();
    infraGroup.name = 'HighwayGantries_MinistryForecourts';
    immersionRoot.add(infraGroup);

    // 3A. 8 Authentic Green Overhead Highway Sign Gantries spanning across Via S1 & Via N1
    // High clearance Y = 10.5m so karts pass smoothly underneath!
    const gantrySpecs = [
      {
        fraction: 0.035,
        code: 'DF-002 • VIA S1 LESTE',
        line1: '⬆ EIXO MONUMENTAL LESTE   |   MEMORIAL JK   |   PRAÇA DO CRUZEIRO',
        line2: 'TORRE DE TV 1,2 KM   •   CONGRESSO NACIONAL 2,8 KM',
        badge: 'SAÍDA MEMORIAL JK'
      },
      {
        fraction: 0.145,
        code: 'DF-002 • VIA S1 LESTE',
        line1: '⬆ TORRE DE TV   |   RODOVIÁRIA DO PLANO PILOTO',
        line2: '↗ EIXÃO ASA SUL / PARQUE DA CIDADE   •   SETOR HOTELEIRO SUL',
        badge: 'EIXO CULTURAL'
      },
      {
        fraction: 0.275,
        code: 'DF-002 • VIA S1 LESTE',
        line1: '⬆ CATEDRAL METROPOLITANA   |   MUSEU DA REPÚBLICA',
        line2: '↗ SETOR BANCÁRIO SUL (BACEN)   •   ESPLANADA DOS MINISTÉRIOS 400M',
        badge: 'SETOR CULTURAL SUL'
      },
      {
        fraction: 0.365,
        code: 'EIXO MONUMENTAL • ESPLANADA',
        line1: '⬆ ESPLANADA DOS MINISTÉRIOS — BLOCOS A a U   |   ITAMARATY',
        line2: '⬆ CONGRESSO NACIONAL   •   PRAÇA DOS TRÊS PODERES   •   LAGO PARANOÁ',
        badge: 'ESPLANADA SUL'
      },
      {
        fraction: 0.455,
        code: 'PRAÇA DOS TRÊS PODERES',
        line1: '⬆ CONGRESSO NACIONAL   |   PALÁCIO DO PLANALTO   |   STF',
        line2: '↺ RETORNO VIA N1 OESTE   •   PONTE JK / PALÁCIO DA ALVORADA ↗',
        badge: 'TRÊS PODERES'
      },
      {
        fraction: 0.565,
        code: 'DF-002 • VIA N1 OESTE',
        line1: '⬆ ESPLANADA DOS MINISTÉRIOS NORTE   |   PALÁCIO DA JUSTIÇA',
        line2: '⬆ CATEDRAL   •   TEATRO NACIONAL   •   RODOVIÁRIA DO PLANO PILOTO',
        badge: 'ESPLANADA NORTE'
      },
      {
        fraction: 0.725,
        code: 'DF-002 • VIA N1 OESTE',
        line1: '⬆ TORRE DE TV   |   ARENA BRB MANÉ GARRINCHA   |   GINÁSIO NILSON NELSON',
        line2: '↗ EIXÃO ASA NORTE   •   SETOR HOTELEIRO NORTE (SHN)',
        badge: 'CENTRO ESPORTIVO'
      },
      {
        fraction: 0.875,
        code: 'DF-002 • VIA N1 OESTE',
        line1: '⬆ CATEDRAL RAINHA DA PAZ   |   QG DO EXÉRCITO (SMU)   |   MEMORIAL JK',
        line2: '⬆ RODOFERROVIÁRIA DE BRASÍLIA 600M   •   SAÍDA EPia / SIA ↗',
        badge: 'MARCO ZERO OESTE'
      }
    ];

    const halfRoad = (trackSpline.roadWidth || ROAD_WIDTH) * 0.5;
    const spanW = halfRoad * 2 + 7.5;

    for (const gSpec of gantrySpecs) {
      const sample = trackSpline.getSampleAtFraction(gSpec.fraction);
      const gGroup = new THREE.Group();
      gGroup.position.copy(sample.point);
      const angle = Math.atan2(sample.tangent.x, sample.tangent.z);
      gGroup.rotation.y = angle;

      // Left & Right Steel Portal Columns outside the racing curbs
      for (const side of [-1, 1]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45, 0.55, 11.8, 10),
          sharedMats.gantryTruss
        );
        post.position.set(side * (halfRoad + 3.4), 5.9, 0);
        gGroup.add(post);
      }

      // Horizontal Overhead Truss Beam at Y = 11.2m
      const crossTruss = new THREE.Mesh(
        new THREE.BoxGeometry(spanW, 1.1, 1.2),
        sharedMats.gantryTruss
      );
      crossTruss.position.set(0, 11.2, 0);
      gGroup.add(crossTruss);

      // Authentic Green DER-DF Highway Signboard facing oncoming karts
      const signTex = createGreenHighwaySignTexture(
        THREE,
        gSpec.code,
        gSpec.line1,
        gSpec.line2,
        gSpec.badge
      );
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: signTex,
        emissiveIntensity: 0.55,
        roughness: 0.35
      });
      dynamicEmissives.push({ mat: signMat, day: 0.42, sunset: 0.85, night: 1.25 });

      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(ROAD_WIDTH + 1.5, 4.4, 0.55),
        signMat
      );
      signBoard.position.set(0, 11.2, 0);
      gGroup.add(signBoard);

      infraGroup.add(gGroup);
    }

    // 3B. Ministry Forecourts: Ceremonial Canopies (Marquises), 3 Flagpoles, Brise-Soleil Ribs & Official Black Sedans
    const poleGeom = new THREE.CylinderGeometry(0.08, 0.12, 9.5, 6);
    const flagSmallGeom = new THREE.BoxGeometry(1.8, 1.1, 0.08);
    const sedanBodyGeom = new THREE.BoxGeometry(4.6, 1.15, 2.0);
    const sedanCabinGeom = new THREE.BoxGeometry(2.4, 0.85, 1.75);
    const briseRibGeom = new THREE.BoxGeometry(0.32, 22, 13.8);

    for (const min of MINISTRIES) {
      if (min.isPalace) continue;

      const fGroup = new THREE.Group();
      fGroup.position.set(min.x, 0, min.z);
      const dirToRoad = min.side === 'north' ? 1 : -1;

      // Vertical Brise-Soleil Sun-Breaker Ribs along the Ministry Glass Facade
      for (let rx = -15; rx <= 15; rx += 5) {
        const rib = new THREE.Mesh(briseRibGeom, sharedMats.whiteMarble);
        rib.position.set(rx, 16.0, 0);
        fGroup.add(rib);
      }

      // Cantilevered White Concrete Entrance Canopy (Marquise) projecting toward the road
      const marquise = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.55, 6.5),
        sharedMats.whiteMarble
      );
      marquise.position.set(0, 4.2, dirToRoad * 9.5);
      fGroup.add(marquise);

      // 3 Ceremonial Flagpoles in front of each Ministry (Brasil, Distrito Federal, Ministério)
      const flagMats = [
        sharedMats.flagBrazil,
        sharedMats.flagDF,
        new THREE.MeshStandardMaterial({
          color: min.accent,
          emissive: new THREE.Color(min.accent),
          emissiveIntensity: 0.35
        })
      ];
      for (let f = 0; f < 3; f++) {
        const fx = -12 + f * 3.2;
        const fz = dirToRoad * 15.5;
        const pole = new THREE.Mesh(poleGeom, sharedMats.silverAluminum);
        pole.position.set(fx, 4.75, fz);
        fGroup.add(pole);

        const flag = new THREE.Mesh(flagSmallGeom, flagMats[f]);
        flag.position.set(fx + 0.95, 8.8, fz);
        fGroup.add(flag);
      }

      // 2 Parked Official Ministerial Black Sedans on the Forecourt Driveway
      for (const sx of [8.5, 14.5]) {
        const car = new THREE.Group();
        car.position.set(sx, 0.65, dirToRoad * 14.5);

        const body = new THREE.Mesh(sedanBodyGeom, sharedMats.officialBlackSedan);
        car.add(body);
        const cabin = new THREE.Mesh(sedanCabinGeom, sharedMats.darkBronzeGlass);
        cabin.position.y = 0.85;
        car.add(cabin);
        fGroup.add(car);
      }

      infraGroup.add(fGroup);
    }
  }
  buildHighwayGantriesAndMinistryForecourts();

  // ==========================================================================
  // 4. LIVING BRASÍLIA CIVIL TRAFFIC, HELICOPTERS, SPEEDBOATS & TOURISTS
  // ==========================================================================
  function buildLivingBrasiliaTrafficAndPeople() {
    const lifeGroup = new THREE.Group();
    lifeGroup.name = 'LivingBrasiliaTrafficAndPeople';
    immersionRoot.add(lifeGroup);

    // 4A. Animated Brasília Buses (Pioneira, Piracicabana, Marechal) & White Taxis
    // on the Eixão Asa Sul / Asa Norte Viaduct (`X = 95 ± 8`) and Outer Service Avenues (`Z = ±90`)
    const busLiveries = [
      { name: 'PIRACICABANA', color: 0xf97316 }, // Orange/White Brasília bus
      { name: 'PIONEIRA', color: 0xeab308 },     // Yellow Brasília bus
      { name: 'MARECHAL', color: 0x22c55e },     // Green Brasília bus
      { name: 'URBI MOBILIDADE', color: 0x0ea5e9 } // Blue BRT bus
    ];

    function createCivilVehicleMesh(isBus, colorHex) {
      const vGroup = new THREE.Group();
      if (isBus) {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 3.3, 12.8),
          new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 })
        );
        body.position.y = 1.9;
        vGroup.add(body);

        const glass = new THREE.Mesh(
          new THREE.BoxGeometry(3.3, 1.3, 12.2),
          sharedMats.darkBronzeGlass
        );
        glass.position.y = 2.4;
        vGroup.add(glass);
      } else {
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 1.1, 4.4),
          new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2, metalness: 0.6 })
        );
        body.position.y = 0.8;
        vGroup.add(body);

        const top = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.75, 2.2),
          sharedMats.darkBronzeGlass
        );
        top.position.y = 1.55;
        vGroup.add(top);
      }

      // Headlights & Taillights
      const headMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const zFront = isBus ? 6.45 : 2.22;
      const headLight = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.1), headMat);
      headLight.position.set(0, 1.0, zFront);
      vGroup.add(headLight);

      const tailLight = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.1), tailMat);
      tailLight.position.set(0, 1.0, -zFront);
      vGroup.add(tailLight);

      return vGroup;
    }

    // 1. Eixão Overpass Traffic crossing above Rodoviária do Plano Piloto (Z = -480 to +480 at X = 95)
    for (let i = 0; i < 14; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const isBus = i % 3 === 0;
      const livery = busLiveries[i % busLiveries.length];
      const carColors = [0xf8fafc, 0xe2e8f0, 0x38bdf8, 0xfacc15, 0x94a3b8];
      const mesh = createCivilVehicleMesh(isBus, isBus ? livery.color : carColors[i % carColors.length]);
      if (dir < 0) mesh.rotation.y = Math.PI;
      lifeGroup.add(mesh);

      civilTraffic.push({
        type: 'eixao',
        mesh,
        dir,
        laneX: 95 + dir * 7.5,
        z: -450 + i * 68,
        minCoord: -480,
        maxCoord: 480,
        speed: (isBus ? 24 : 34) + (i % 4) * 3
      });
    }

    // 2. Outer Service Lane Traffic (Via S2 at Z = +90 heading East, Via N2 at Z = -90 heading West)
    for (let i = 0; i < 16; i++) {
      const dir = i % 2 === 0 ? 1 : -1; // +1 East on South side, -1 West on North side
      const isBus = i % 3 === 0;
      const livery = busLiveries[i % busLiveries.length];
      const mesh = createCivilVehicleMesh(isBus, isBus ? livery.color : 0xf8fafc);
      mesh.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      lifeGroup.add(mesh);

      civilTraffic.push({
        type: 'service_lane',
        mesh,
        dir,
        laneZ: dir > 0 ? 90 : -90,
        x: -1200 + i * 155,
        minCoord: -1250,
        maxCoord: 1250,
        speed: (isBus ? 22 : 30) + (i % 5) * 2
      });
    }

    // 4B. 2 Animated Sightseeing Helicopters circling Torre de TV & Congresso Nacional
    const heliConfigs = [
      { cx: -210, cz: 0, alt: 118, radius: 165, speed: 0.24, phase: 0, color: 0x0284c7 },
      { cx: 1380, cz: 0, alt: 128, radius: 185, speed: -0.21, phase: 2.4, color: 0xef4444 }
    ];

    for (const hc of heliConfigs) {
      const heli = new THREE.Group();
      const cabin = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 12, 10),
        new THREE.MeshStandardMaterial({ color: hc.color, roughness: 0.2, metalness: 0.7 })
      );
      cabin.scale.set(1.0, 0.85, 1.65);
      heli.add(cabin);

      const tailBoom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.75, 8.5, 8),
        sharedMats.silverAluminum
      );
      tailBoom.rotation.x = Math.PI / 2;
      tailBoom.position.z = -6.5;
      heli.add(tailBoom);

      const rotor = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.15, 0.85),
        sharedMats.silverAluminum
      );
      rotor.position.y = 3.2;
      heli.add(rotor);

      const navLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x22c55e })
      );
      navLight.position.set(0, -2.5, 2.5);
      heli.add(navLight);

      lifeGroup.add(heli);
      animatedHelicopters.push({
        group: heli,
        rotor,
        ...hc
      });
    }

    // 4C. Lago Paranoá Speedboats & Sailboats gliding under Ponte JK (`X = +1880..+2040`)
    for (let b = 0; b < 6; b++) {
      const boat = new THREE.Group();
      const hull = new THREE.Mesh(
        new THREE.ConeGeometry(3.5, 14, 4),
        sharedMats.whiteMarble
      );
      hull.rotation.x = Math.PI / 2;
      hull.scale.set(1.0, 1.0, 0.45);
      boat.add(hull);

      // White Triangular Sail
      const sail = new THREE.Mesh(
        new THREE.ConeGeometry(4.2, 13.5, 3),
        sharedMats.whiteMarble
      );
      sail.scale.set(0.25, 1.0, 1.0);
      sail.position.y = 7.2;
      boat.add(sail);

      lifeGroup.add(boat);
      animatedBoats.push({
        group: boat,
        baseX: 1875 + (b % 3) * 45,
        baseZ: -260 + b * 95,
        speed: 0.35 + (b % 3) * 0.12,
        ampZ: 65,
        phase: b * 1.3
      });
    }

    // 4D. Stylized Candango Tourists & Visitors walking at key plazas
    const touristSpots = [
      { x: -162, y: 0.5, z: 24, count: 8 },   // Torre de TV "EU ❤️ BRASÍLIA" sign
      { x: 625, y: 0.0, z: 86, count: 8 },    // Catedral Metropolitana entrance
      { x: 1395, y: 0.0, z: 12, count: 10 },  // Congresso Nacional ceremonial ramp
      { x: 1612, y: 0.8, z: -12, count: 8 }   // Praça dos Três Poderes / Os Candangos
    ];
    const shirtColors = [0xfacc15, 0x22c55e, 0x38bdf8, 0xef4444, 0xf8fafc, 0xa855f7];

    for (const spot of touristSpots) {
      for (let t = 0; t < spot.count; t++) {
        const person = new THREE.Group();
        const tx = spot.x + Math.cos(t * 1.7) * (4 + (t % 4) * 2.5);
        const tz = spot.z + Math.sin(t * 2.3) * (4 + (t % 3) * 2.5);
        person.position.set(tx, spot.y, tz);

        const torso = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.34, 1.35, 8),
          new THREE.MeshStandardMaterial({ color: shirtColors[t % shirtColors.length] })
        );
        torso.position.y = 0.7;
        person.add(torso);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 8, 8),
          sharedMats.whiteMarble
        );
        head.position.y = 1.58;
        person.add(head);

        lifeGroup.add(person);
        animatedTourists.push({
          mesh: person,
          baseX: tx,
          baseY: spot.y,
          baseZ: tz,
          phase: t * 0.9
        });
      }
    }
  }
  buildLivingBrasiliaTrafficAndPeople();

  // ==========================================================================
  // 5. REAL-TIME IMMERSION UPDATE LOOP (`updateImmersion`)
  // ==========================================================================
  let lastTimeOfDay = 'day';

  function updateImmersion(time = 0, dt = 0.016, playerPosition = null, timeOfDay = 'day') {
    // 5A. Adjust dynamic emissive materials when timeOfDay changes
    if (timeOfDay !== lastTimeOfDay) {
      lastTimeOfDay = timeOfDay;
      for (const em of dynamicEmissives) {
        em.mat.emissiveIntensity =
          timeOfDay === 'night' ? em.night : timeOfDay === 'sunset' ? em.sunset : em.day;
      }
    }

    // 5B. Rotate the 55m Roda-Gigante do Parque da Cidade (keeping passenger cabins upright!)
    for (const fw of animatedFerrisWheels) {
      const wheelAngle = time * 0.28;
      fw.wheelHub.rotation.z = wheelAngle;
      for (const cabin of fw.cabins) {
        cabin.rotation.z = -wheelAngle;
      }
    }

    // 5C. Update Civil Traffic along the Eixão Viaduct & Service Lanes
    for (const v of civilTraffic) {
      if (v.type === 'eixao') {
        v.z += v.dir * v.speed * dt;
        if (v.dir > 0 && v.z > v.maxCoord) v.z = v.minCoord;
        if (v.dir < 0 && v.z < v.minCoord) v.z = v.maxCoord;

        // Follow Eixão bridge elevation over Rodoviária (Y = 8.9m over Eixo, sloping down along wings)
        const absZ = Math.abs(v.z);
        const yBridge = absZ < 95 ? 8.9 : Math.max(0.5, 8.9 - ((absZ - 95) / 380) * 8.4);
        const xSweep = v.laneX - Math.pow(absZ / 380, 1.65) * 22;
        v.mesh.position.set(xSweep, yBridge, v.z);
      } else {
        v.x += v.dir * v.speed * dt;
        if (v.dir > 0 && v.x > v.maxCoord) v.x = v.minCoord;
        if (v.dir < 0 && v.x < v.minCoord) v.x = v.maxCoord;
        const gy = getBrasiliaGroundY(v.x);
        v.mesh.position.set(v.x, gy, v.laneZ);
      }
    }

    // 5D. Update Sightseeing Helicopters
    for (const h of animatedHelicopters) {
      const a = time * h.speed + h.phase;
      const hx = h.cx + Math.cos(a) * h.radius;
      const hz = h.cz + Math.sin(a) * (h.radius * 0.65);
      h.group.position.set(hx, h.alt + Math.sin(time * 1.5 + h.phase) * 2.5, hz);
      const nextA = a + (h.speed >= 0 ? 0.05 : -0.05);
      h.group.lookAt(
        h.cx + Math.cos(nextA) * h.radius,
        h.group.position.y,
        h.cz + Math.sin(nextA) * (h.radius * 0.65)
      );
      h.rotor.rotation.y = time * 18;
    }

    // 5E. Update Lago Paranoá Sailboats
    for (const b of animatedBoats) {
      const bz = b.baseZ + Math.sin(time * b.speed + b.phase) * b.ampZ;
      const bx = b.baseX + Math.cos(time * b.speed * 0.7 + b.phase) * 18;
      b.group.position.set(bx, 0.1, bz);
      b.group.rotation.y = Math.cos(time * b.speed + b.phase) * 0.45;
    }

    // 5F. Animate Tourists walking & taking photos
    for (const t of animatedTourists) {
      t.mesh.position.x = t.baseX + Math.sin(time * 1.1 + t.phase) * 1.2;
      t.mesh.position.z = t.baseZ + Math.cos(time * 0.9 + t.phase) * 1.2;
      t.mesh.position.y = t.baseY + Math.abs(Math.sin(time * 4.2 + t.phase)) * 0.15;
    }

    // 5G. Smart Clean Proximity Display for 3D Sky Pins (`worldLabels3D`)
    // Prevents visual clutter ("poluição visual") by only displaying the immediate landmark
    // and closest ministry in focus, keeping the 3D skyline clean and readable.
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 820;
    const maxActiveLabels = isMobile ? 1 : 3;
    const maxVisibleDist = isMobile ? 240 : 380;

    // Compute distances and find closest targets
    const candidates = [];
    if (playerPosition) {
      for (let i = 0; i < worldLabels3D.length; i++) {
        const lbl = worldLabels3D[i];
        const dx = lbl.groundPos.x - playerPosition.x;
        const dz = lbl.groundPos.z - playerPosition.z;
        const dist = Math.hypot(dx, dz);
        lbl.currentDist = dist;
        if (dist <= maxVisibleDist) {
          candidates.push(lbl);
        } else {
          // Beyond visible distance: hide immediately so sky is 100% clean
          lbl.sprite.visible = false;
          lbl.beamMesh.visible = false;
          lbl.ringMesh.visible = false;
        }
      }
    }

    candidates.sort((a, b) => a.currentDist - b.currentDist);
    const visibleSet = new Set(candidates.slice(0, maxActiveLabels));

    for (let i = 0; i < worldLabels3D.length; i++) {
      const lbl = worldLabels3D[i];
      const shouldBeVisible = visibleSet.has(lbl);

      if (!shouldBeVisible) {
        lbl.sprite.visible = false;
        lbl.beamMesh.visible = false;
        lbl.ringMesh.visible = false;
        continue;
      }

      lbl.sprite.visible = true;
      lbl.beamMesh.visible = true;
      lbl.ringMesh.visible = true;

      const bob = Math.sin(time * 1.8 + i * 0.7) * 1.2;
      lbl.sprite.position.y = lbl.groundPos.y + lbl.pinHeight + bob;

      // Gentle scale based on proximity without ballooning into giant text
      const dist = lbl.currentDist || 100;
      const mobileScaleMult = isMobile ? 0.48 : 0.78;
      const distFactor = Math.min(1.35, Math.max(0.65, 0.6 + dist / 420));
      const s = lbl.baseScale * mobileScaleMult * distFactor;
      lbl.sprite.scale.set(s, s * (220 / 640), 1);

      // Fade in smoothly as you get closer
      const proximityAlpha = Math.max(0.2, Math.min(0.96, 1.0 - (dist / maxVisibleDist) * 0.65));
      lbl.sprite.material.opacity = proximityAlpha;
      lbl.beamMat.opacity = proximityAlpha * (timeOfDay === 'night' ? 0.35 : 0.2);
    }
  }

  return {
    immersionRoot,
    worldLabels3D,
    civilTraffic,
    updateImmersion
  };
}
