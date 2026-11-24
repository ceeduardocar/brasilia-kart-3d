/**
 * Brasília Kart 3D — Eixo Monumental Circuit & Landmark Data
 * Coordinates span West (X = -1500, Rodoferroviária) to East (X = +1580, Congresso Nacional & Três Poderes)
 * Via S1 (Z > 0, South side heading East towards Congresso)
 * Via N1 (Z < 0, North side heading West towards Rodoferroviária)
 * Gramado Central lies between Z = -46 and Z = +46.
 */

export const ROAD_WIDTH = 26;

/**
 * Closed-loop waypoints tracing the entire Eixo Monumental:
 * Starts on Via S1 near the Rodoferroviária / Memorial JK, cruises East past
 * Rainha da Paz, Praça do Cruzeiro, Planetário, Torre de TV, Rodoviária do Plano Piloto,
 * Museu da República, Catedral de Brasília, and the Southern Esplanada dos Ministérios + Itamaraty,
 * loops around the Congresso Nacional & Praça dos Três Poderes, and returns West along Via N1
 * past Palácio da Justiça, the Northern Esplanada dos Ministérios, Setor Hoteleiro/Torre de TV North,
 * Centro de Convenções, Rainha da Paz right-side plaza, Memorial JK, and the Rodoferroviária turnaround loop!
 */
export const TRACK_WAYPOINTS = [
  // 1. Start / West S1 (Rodoferroviária -> Memorial JK)
  { x: -1360, y: 0.0, z: 66, sectionId: 'rodoferroviaria' },
  { x: -1200, y: 0.4, z: 68, sectionId: 'memorial_jk' },
  // 2. Climb to Praça do Cruzeiro / Rainha da Paz (highest point of Eixo Monumental)
  { x: -1020, y: 1.8, z: 72, sectionId: 'rainha_da_paz' },
  { x: -840,  y: 3.5, z: 70, sectionId: 'catedral_militar_cruz' },
  // 3. Descent towards Planetário & Centro de Convenções
  { x: -620,  y: 2.2, z: 66, sectionId: 'planetario_centro_convencoes' },
  { x: -420,  y: 1.0, z: 68, sectionId: 'torre_de_tv' },
  // 4. Torre de TV Chicane & Panorama curve on Via S1
  { x: -220,  y: 0.5, z: 78, sectionId: 'torre_de_tv' },
  { x: -40,   y: 0.2, z: 66, sectionId: 'rodoviaria_plano_piloto' },
  // 5. Rodoviária do Plano Piloto (Crossing of Asa Sul / Asa Norte)
  { x: 140,   y: -0.4, z: 62, sectionId: 'rodoviaria_plano_piloto' },
  { x: 300,   y: 0.0, z: 66, sectionId: 'complexo_cultural_republica' },
  // 6. Setor Cultural Sul -> Museu da República & Catedral Metropolitana
  { x: 460,   y: 0.0, z: 70, sectionId: 'complexo_cultural_republica' },
  { x: 630,   y: 0.0, z: 70, sectionId: 'catedral_brasilia' },
  // 7. Esplanada dos Ministérios (Via S1 South Row — 8 Ministries + Palácio do Itamaraty)
  { x: 800,   y: 0.0, z: 66, sectionId: 'esplanada_ministerios' },
  { x: 980,   y: 0.0, z: 66, sectionId: 'esplanada_ministerios' },
  { x: 1160,  y: 0.0, z: 66, sectionId: 'esplanada_ministerios' },
  { x: 1310,  y: 0.0, z: 64, sectionId: 'congresso_nacional' },
  // 8. Eastern Monumental Loop: Congresso Nacional & Praça dos Três Poderes
  { x: 1460,  y: 0.0, z: 54, sectionId: 'congresso_nacional' },
  { x: 1555,  y: 0.0, z: 24, sectionId: 'congresso_nacional' },
  { x: 1555,  y: 0.0, z: -24, sectionId: 'congresso_nacional' },
  { x: 1460,  y: 0.0, z: -54, sectionId: 'congresso_nacional' },
  // 9. Return West on Via N1 (Palácio da Justiça & Northern Esplanada dos Ministérios)
  { x: 1310,  y: 0.0, z: -64, sectionId: 'congresso_nacional' },
  { x: 1160,  y: 0.0, z: -66, sectionId: 'esplanada_ministerios' },
  { x: 980,   y: 0.0, z: -66, sectionId: 'esplanada_ministerios' },
  { x: 800,   y: 0.0, z: -66, sectionId: 'esplanada_ministerios' },
  // 10. Via N1 past Catedral / Teatro Nacional / Rodoviária do Plano Piloto
  { x: 620,   y: 0.0, z: -68, sectionId: 'catedral_brasilia' },
  { x: 420,   y: 0.0, z: -68, sectionId: 'complexo_cultural_republica' },
  { x: 220,   y: 0.0, z: -64, sectionId: 'rodoviaria_plano_piloto' },
  { x: 40,    y: -0.4, z: -62, sectionId: 'rodoviaria_plano_piloto' },
  // 11. Via N1 past Torre de TV, Estádio Mané Garrincha & Planetário
  { x: -160,  y: 0.5, z: -76, sectionId: 'torre_de_tv' },
  { x: -380,  y: 1.0, z: -68, sectionId: 'torre_de_tv' },
  { x: -580,  y: 2.2, z: -66, sectionId: 'planetario_centro_convencoes' },
  // 12. Via N1 directly alongside Praça do Cruzeiro, Rainha da Paz & Memorial JK
  { x: -800,  y: 3.5, z: -70, sectionId: 'catedral_militar_cruz' },
  { x: -970,  y: 2.2, z: -72, sectionId: 'rainha_da_paz' },
  { x: -1170, y: 0.6, z: -68, sectionId: 'memorial_jk' },
  { x: -1360, y: 0.0, z: -64, sectionId: 'rodoferroviaria' },
  // 13. Western Turnaround Loop right in front of the Rodoferroviária de Brasília
  { x: -1465, y: 0.0, z: -42, sectionId: 'rodoferroviaria' },
  { x: -1495, y: 0.0, z: 0,   sectionId: 'rodoferroviaria' },
  { x: -1465, y: 0.0, z: 42,  sectionId: 'rodoferroviaria' }
];

export const LANDMARKS = [
  {
    id: 'rodoferroviaria',
    name: 'Rodoferroviária de Brasília',
    shortName: 'Rodoferroviária',
    architect: 'Lúcio Costa & Sérgio Bernardes',
    year: '1981',
    subtitle: 'Marco Zero Oeste do Eixo Monumental & Parque Ferroviário',
    description: 'Ponto de partida oeste do Eixo Monumental! Inaugurada em 1981 com linhas brutalistas horizontais monumentais, plataformas suspensas de concreto aparente e a grande rotatória oeste.',
    position: { x: -1545, y: 0, z: 0 },
    cameraPos: { x: -1410, y: 42, z: 95 },
    cameraLookAt: { x: -1545, y: 12, z: 0 },
    triggerRadius: 150,
    color: '#f59e0b'
  },
  {
    id: 'memorial_jk',
    name: 'Memorial JK',
    shortName: 'Memorial JK',
    architect: 'Oscar Niemeyer',
    year: '1981',
    subtitle: 'Mausoléu e Museu do fundador Presidente Juscelino Kubitschek',
    description: 'Monumento em mármore branco dedicado ao presidente que construiu Brasília no coração do Cerrado. No topo da torre em forma de foice/concha de 28 metros repousa a estátua de JK acenando para sua criação.',
    position: { x: -1180, y: 0.5, z: -5 },
    cameraPos: { x: -1115, y: 34, z: 75 },
    cameraLookAt: { x: -1180, y: 16, z: -5 },
    triggerRadius: 135,
    color: '#fbbf24'
  },
  {
    id: 'rainha_da_paz',
    name: 'Paróquia Militar Rainha da Paz',
    shortName: 'Rainha da Paz',
    architect: 'Oscar Niemeyer',
    year: '1991',
    subtitle: 'Catedral Militar em forma de tenda triangular modernista',
    description: 'Projetada por Oscar Niemeyer com a silhueta pura de uma barraca militar estilizada em concreto branco na Via N1, acompanhada por seu campanário escultural e vitral em cruz.',
    position: { x: -965, y: 2.0, z: -122 },
    cameraPos: { x: -925, y: 30, z: -55 },
    cameraLookAt: { x: -965, y: 14, z: -122 },
    triggerRadius: 125,
    color: '#38bdf8'
  },
  {
    id: 'catedral_militar_cruz',
    name: 'Praça do Cruzeiro & Cruz de Brasília',
    shortName: 'Praça do Cruzeiro',
    architect: 'Lúcio Costa',
    year: '1957',
    subtitle: 'Ponto mais alto do Eixo Monumental (1.172m) & Local da 1ª Missa',
    description: 'O mirante natural mais alto do Eixo Monumental! Aqui foi celebrada a primeira missa de Brasília em 3 de maio de 1957. Oferece a vista panorâmica mais famosa do pôr do sol sobre toda a Esplanada.',
    position: { x: -820, y: 3.5, z: 0 },
    cameraPos: { x: -770, y: 36, z: 70 },
    cameraLookAt: { x: -820, y: 15, z: 0 },
    triggerRadius: 120,
    color: '#f97316'
  },
  {
    id: 'planetario_centro_convencoes',
    name: 'Planetário de Brasília & Centro de Convenções',
    shortName: 'Planetário & Convenções',
    architect: 'Sérgio Bernardes',
    year: '1974',
    subtitle: 'A nave espacial brutalista de 16 faces no Eixo Cultural',
    description: 'Concebido por Sérgio Bernardes para parecer um disco voador pousado sobre o gramado do Eixo Monumental, ladeado pelo Centro de Convenções Ulysses Guimarães e a vista do Estádio Mané Garrincha.',
    position: { x: -575, y: 2.0, z: -12 },
    cameraPos: { x: -510, y: 35, z: 72 },
    cameraLookAt: { x: -575, y: 12, z: -15 },
    triggerRadius: 135,
    color: '#a855f7'
  },
  {
    id: 'torre_de_tv',
    name: 'Torre de TV de Brasília & Fonte Luminosa',
    shortName: 'Torre de TV',
    architect: 'Lúcio Costa',
    year: '1967',
    subtitle: 'Mirante de 224m, Feirinha da Torre e letreiro Eu Amo Brasília',
    description: 'Inspirada na Torre Eiffel e implantada por Lúcio Costa no eixo central da cidade. Ao seu redor vibram os jatos da Fonte Luminosa, a tradicional Feirinha da Torre e a escultura Era Espacial de Alexandre Wakhevitch.',
    position: { x: -210, y: 0.5, z: 0 },
    cameraPos: { x: -110, y: 58, z: 105 },
    cameraLookAt: { x: -210, y: 45, z: 0 },
    triggerRadius: 150,
    color: '#ef4444'
  },
  {
    id: 'rodoviaria_plano_piloto',
    name: 'Rodoviária do Plano Piloto (Cruzamento das Asas)',
    shortName: 'Rodoviária / Asas',
    architect: 'Lúcio Costa',
    year: '1960',
    subtitle: 'O coração do Avião onde o Eixo Monumental encontra as Asas Sul e Norte',
    description: 'O centro nervoso do Plano Piloto! Aqui a fuselagem do avião (Eixo Monumental) cruza as grandes asas curvas (Eixão Asa Sul e Asa Norte), cercado pelos edifícios modernistas dos Setores Comerciais e pelo Teatro Nacional Cláudio Santoro.',
    position: { x: 95, y: 0, z: 0 },
    cameraPos: { x: 185, y: 48, z: 110 },
    cameraLookAt: { x: 95, y: 10, z: 0 },
    triggerRadius: 145,
    color: '#10b981'
  },
  {
    id: 'complexo_cultural_republica',
    name: 'Museu Nacional da República & Biblioteca Nacional',
    shortName: 'Museu da República',
    architect: 'Oscar Niemeyer',
    year: '2006',
    subtitle: 'A grande cúpula branca com anel planetário e rampa suspensa',
    description: 'Um dos conjuntos mais esculturais de Niemeyer: uma semiesfera branca monumental cortada por rampas curvas externas que parecem os anéis de Saturno, dialogando com o espelho d’água da Biblioteca Nacional Leonel de Moura Brizola.',
    position: { x: 435, y: 0, z: 122 },
    cameraPos: { x: 380, y: 38, z: 45 },
    cameraLookAt: { x: 435, y: 16, z: 122 },
    triggerRadius: 130,
    color: '#ec4899'
  },
  {
    id: 'catedral_brasilia',
    name: 'Catedral Metropolitana Nossa Senhora Aparecida',
    shortName: 'Catedral de Brasília',
    architect: 'Oscar Niemeyer & Marianne Peretti',
    year: '1970',
    subtitle: '16 colunas hiperboloides, vitrais celestes e os 4 Evangelistas',
    description: 'Obra-prima vencedora do Prêmio Pritzker: 16 colunas curvas de concreto branco que se erguem para o céu cercadas por um espelho d’água circular, vitrais azuis e verdes de Marianne Peretti, o Batistério ovoide e as esculturas dos Evangelistas de Alfredo Ceschiatti.',
    position: { x: 625, y: 0, z: 125 },
    cameraPos: { x: 575, y: 36, z: 48 },
    cameraLookAt: { x: 625, y: 18, z: 125 },
    triggerRadius: 135,
    color: '#06b6d4'
  },
  {
    id: 'esplanada_ministerios',
    name: 'Esplanada dos Ministérios, Itamaraty & Palácio da Justiça',
    shortName: 'Esplanada dos Ministérios',
    architect: 'Lúcio Costa & Oscar Niemeyer',
    year: '1960',
    subtitle: 'Os 17 Blocos Ministeriais simétricos, Arcos do Itamaraty e Cascatas da Justiça',
    description: 'O corredor cívico monumental do Brasil! Dezenove edifícios modernistas ladeiam o grande gramado central: os 17 blocos ministeriais em pilotis com fachadas de vidro verde, culminando no Palácio do Itamaraty (com a escultura Meteoro sobre as águas) ao sul e no Palácio da Justiça (com suas cascatas suspensas) ao norte.',
    position: { x: 980, y: 0, z: 0 },
    cameraPos: { x: 820, y: 45, z: 0 },
    cameraLookAt: { x: 1250, y: 18, z: 0 },
    triggerRadius: 230,
    color: '#22c55e'
  },
  {
    id: 'congresso_nacional',
    name: 'Congresso Nacional & Praça dos Três Poderes',
    shortName: 'Congresso Nacional',
    architect: 'Oscar Niemeyer',
    year: '1960',
    subtitle: 'Cúpulas do Senado e da Câmara, Anexo I e Palácios do Planalto e STF',
    description: 'O ícone máximo da arquitetura moderna brasileira! A plataforma branca horizontal sustenta a cúpula côncava do Senado Federal e a bacia convexa da Câmara dos Deputados, com as torres gêmeas de 28 andares ao centro e a Praça dos Três Poderes (Palácio do Planalto, STF, Panteão da Pátria e Mastro da Bandeira) logo atrás.',
    position: { x: 1435, y: 0, z: 0 },
    cameraPos: { x: 1275, y: 42, z: 30 },
    cameraLookAt: { x: 1445, y: 26, z: 0 },
    triggerRadius: 185,
    color: '#eab308'
  }
];

/**
 * The 17 Ministry Blocks + Palácio do Itamaraty + Palácio da Justiça
 * Positioned symmetrically along Via N1 (North, Z = -112) and Via S1 (South, Z = +112)
 */
export const MINISTRIES = [
  // NORTH ROW (Via N1, West to East: X = 740 to 1245)
  { id: 'min_fazenda', code: 'BLOCO P', name: 'Min. da Fazenda', side: 'north', x: 745, z: -112, accent: '#10b981' },
  { id: 'min_saude', code: 'BLOCO G', name: 'Min. da Saúde', side: 'north', x: 805, z: -112, accent: '#06b6d4' },
  { id: 'min_educacao', code: 'BLOCO L', name: 'Min. da Educação', side: 'north', x: 865, z: -112, accent: '#3b82f6' },
  { id: 'min_trabalho', code: 'BLOCO F', name: 'Min. do Trabalho', side: 'north', x: 925, z: -112, accent: '#eab308' },
  { id: 'min_transportes', code: 'BLOCO R', name: 'Min. dos Transportes', side: 'north', x: 985, z: -112, accent: '#f97316' },
  { id: 'min_comunicacoes', code: 'BLOCO N', name: 'Min. das Comunicações', side: 'north', x: 1045, z: -112, accent: '#8b5cf6' },
  { id: 'min_meio_ambiente', code: 'BLOCO B', name: 'Min. do Meio Ambiente', side: 'north', x: 1105, z: -112, accent: '#22c55e' },
  { id: 'min_defesa', code: 'BLOCO Q', name: 'Min. da Defesa', side: 'north', x: 1165, z: -112, accent: '#14b8a6' },
  { id: 'min_previdencia', code: 'BLOCO O', name: 'Min. da Previdência', side: 'north', x: 1220, z: -112, accent: '#38bdf8' },
  { id: 'palacio_justica', code: 'PALÁCIO', name: 'Palácio da Justiça', side: 'north', x: 1295, z: -114, accent: '#0ea5e9', isPalace: 'justica' },

  // SOUTH ROW (Via S1, West to East: X = 760 to 1245)
  { id: 'min_cultura', code: 'BLOCO B', name: 'Min. da Cultura', side: 'south', x: 760, z: 112, accent: '#ec4899' },
  { id: 'min_esporte', code: 'BLOCO A', name: 'Min. do Esporte', side: 'south', x: 825, z: 112, accent: '#eab308' },
  { id: 'min_turismo', code: 'BLOCO U', name: 'Min. do Turismo', side: 'south', x: 890, z: 112, accent: '#f59e0b' },
  { id: 'min_agricultura', code: 'BLOCO D', name: 'Min. da Agricultura', side: 'south', x: 955, z: 112, accent: '#22c55e' },
  { id: 'min_minas_energia', code: 'BLOCO E', name: 'Min. de Minas e Energia', side: 'south', x: 1020, z: 112, accent: '#f97316' },
  { id: 'min_ciencia_tec', code: 'BLOCO C', name: 'Min. da Ciência e Tec.', side: 'south', x: 1085, z: 112, accent: '#06b6d4' },
  { id: 'min_planejamento', code: 'BLOCO K', name: 'Min. do Planejamento', side: 'south', x: 1150, z: 112, accent: '#6366f1' },
  { id: 'min_desenvolvimento', code: 'BLOCO J', name: 'Min. do Desenvolvimento', side: 'south', x: 1215, z: 112, accent: '#10b981' },
  { id: 'palacio_itamaraty', code: 'PALÁCIO', name: 'Palácio do Itamaraty (MRE)', side: 'south', x: 1295, z: 116, accent: '#fbbf24', isPalace: 'itamaraty' }
];

// Fractional progress [0..1] along the closed track spline where Turbo Boost Pads are placed
export const BOOST_PAD_FRACTIONS = [
  0.04, 0.11, 0.19, 0.27, 0.36, 0.44, 0.51, 0.58, 0.67, 0.75, 0.83, 0.91, 0.97
];

// Fractional progress [0..1] along the track where rows of Mario Kart Item Boxes float
export const ITEM_BOX_FRACTIONS = [
  0.07, 0.16, 0.25, 0.34, 0.42, 0.56, 0.65, 0.74, 0.85, 0.94
];

/**
 * Evaluates a Catmull-Rom spline across the closed loop of TRACK_WAYPOINTS
 * and returns pre-sampled track geometry & nearest-point lookup helpers.
 */
export function createTrackSpline(THREE, numSamples = 1200) {
  const vectors = TRACK_WAYPOINTS.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(vectors, true, 'centripetal', 0.5);
  const samples = [];
  let totalLength = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / numSamples;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();

    if (i > 0) {
      totalLength += point.distanceTo(samples[i - 1].point);
    }

    // Find closest waypoint sectionId
    let bestWp = TRACK_WAYPOINTS[0];
    let bestDist = Infinity;
    for (const wp of TRACK_WAYPOINTS) {
      const dx = wp.x - point.x;
      const dz = wp.z - point.z;
      const d = dx * dx + dz * dz;
      if (d < bestDist) {
        bestDist = d;
        bestWp = wp;
      }
    }

    samples.push({
      t,
      index: i,
      point,
      tangent,
      right,
      distance: totalLength,
      sectionId: bestWp.sectionId
    });
  }

  // Close loop total length
  totalLength += samples[0].point.distanceTo(samples[samples.length - 1].point);

  function getClosestSample(x, z) {
    let minD2 = Infinity;
    let best = samples[0];
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      const dx = s.point.x - x;
      const dz = s.point.z - z;
      const d2 = dx * dx + dz * dz;
      if (d2 < minD2) {
        minD2 = d2;
        best = s;
      }
    }
    return { sample: best, distSq: minD2, dist: Math.sqrt(minD2) };
  }

  function getSampleAtFraction(t) {
    const wrapped = ((t % 1) + 1) % 1;
    const idx = Math.floor(wrapped * samples.length) % samples.length;
    return samples[idx];
  }

  return {
    curve,
    samples,
    totalLength,
    roadWidth: ROAD_WIDTH,
    getClosestSample,
    getSampleAtFraction
  };
}
