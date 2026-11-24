# Brasília Kart 3D — Eixo Monumental Edition: Architectural Contract

## 1. Overview & Theme
An authentic, high-visual-fidelity 3D Mario Kart-style racing & exploration game set in **Brasília, DF (Plano Piloto)** along the entire **Eixo Monumental** (from the **Rodoferroviária** in the West all the way to the **Congresso Nacional / Praça dos Três Poderes** in the East and back along the N1/S1 loop).

## 2. Coordinate System & Track Geometry (`src/trackData.js`)
- **World Scale**: 1 unit = 1 meter (scaled comfortably for fast-paced kart driving, total loop length ~3,600 units so a lap takes ~75–90 seconds at 160 km/h, or free-roam cruising at any speed).
- **Orientation**:
  - **West (`X = -1500`)**: **Rodoferroviária de Brasília** & Parque Ferroviário.
  - **East (`X = +1500`)**: **Congresso Nacional**, **Espelho d'Água**, and **Praça dos Três Poderes / Palácio do Planalto / STF**.
  - **South Axis (`Z = +55` to `+90`)**: **Via S1** (West-to-East traffic heading towards Congresso Nacional).
  - **North Axis (`Z = -55` to `-90`)**: **Via N1** (East-to-West traffic heading back from Congresso towards Rodoferroviária).
  - **Central Lawn (`Z = -45` to `+45`)**: The iconic **Gramado Central do Eixo Monumental** (lush cerrado lawn, red earth edges, ornamental trees, pedestrian paths, and central monuments).
  - **Surrounding Plano Piloto**: Symbolic **Asa Sul** (`Z > +180`) and **Asa Norte** (`Z < -180`) wings curving outward like the *Avião* (airplane) urban plan of Lúcio Costa, visible in the 3D world and on the 3D/2D interactive map!
  - **Road Width**: `ROAD_WIDTH = 24` meters (4 wide lanes with Niemeyer streetlights, red-white curbs, asphalt markings, boost pads, and item boxes).

## 3. Ordered Landmarks Along the Eixo Monumental (West to East)
Every landmark has exact coordinates, historical/architectural subtitle, tourist description, and 3D procedural architectural meshes with shaders/PBR materials, windows, water reflections, and night/sunset lighting:

1. **`rodoferroviaria`** (`X = -1480, Z = 0`)
   - **Title**: Rodoferroviária de Brasília
   - **Architect**: Lúcio Costa / Sérgio Bernardes (1981)
   - **Subtitle**: Ponto extremo oeste do Eixo Monumental
   - **Visuals**: Monumental brutalist concrete terminal with sweeping horizontal cantilever roofs, bus/train bays, clock tower, and the Western turnaround loop.
2. **`memorial_jk`** (`X = -1180, Z = -10`)
   - **Title**: Memorial JK
   - **Architect**: Oscar Niemeyer (1981)
   - **Subtitle**: Homenagem ao fundador Presidente Juscelino Kubitschek
   - **Visuals**: White marble geometric mausoleum with the iconic 28m high sickle/shell tower holding the statue of JK at the top, reflecting pool, and exterior ramps.
3. **`rainha_da_paz`** (`X = -960, Z = -95`)
   - **Title**: Paróquia Militar Rainha da Paz
   - **Architect**: Oscar Niemeyer (1991)
   - **Subtitle**: Arquitetura sacra triangular no Setor Militar Urbano / Eixo
   - **Visuals**: Striking white concrete tent/triangle prism structure with stained-glass cross slit, standalone modernist bell tower, and ceremonial plaza.
4. **`catedral_militar_cruz`** (`X = -820, Z = 0`)
   - **Title**: Praça do Cruzeiro & Cruz de Brasília
   - **Architect**: Lúcio Costa (Marco da Primeira Missa, 1957)
   - **Subtitle**: Ponto mais alto do Eixo Monumental (1.172m)
   - **Visuals**: Elevated stone plaza with the historic wooden/concrete cross, panoramic lookout pillars, and sunset reflection.
5. **`planetario_centro_convencoes`** (`X = -560, Z = -85`)
   - **Title**: Planetário de Brasília & Centro de Convenções Ulysses Guimarães
   - **Architect**: Sérgio Bernardes (1974)
   - **Subtitle**: A nave espacial brutalista no coração do Eixo Cultural
   - **Visuals**: Iconic 16-sided Concrete UFO/Hexadecagon dome hovering over glass/piloti columns alongside the sweeping horizontal Convention Center.
6. **`torre_de_tv`** (`X = -220, Z = 0`)
   - **Title**: Torre de TV de Brasília & Feirinha da Torre
   - **Architect**: Lúcio Costa (1967)
   - **Subtitle**: Mirante de 224m de altura, Fonte Luminosa e letreiro "Eu Amo Brasília"
   - **Visuals**: Soaring 140-unit-tall metallic lattice tower on a tripod brutalist concrete base with the glass panoramic viewpoint at mid-height, colorful "EU ❤️ BRASÍLIA" 3D letters, animated **Fonte Luminosa** water jets, and colorful Feirinha stalls.
7. **`rodoviaria_plano_piloto`** (`X = +120, Z = 0`)
   - **Title**: Rodoviária do Plano Piloto & Eixão (Cruzamento das Asas)
   - **Architect**: Lúcio Costa (1960)
   - **Subtitle**: O coração de Brasília onde o Eixo Monumental cruza as Asas Sul e Norte
   - **Visuals**: Monumental overpass/underpass viaduct complex with glowing traffic along the curving Asa Sul / Asa Norte wings, Setor Comercial Sul/Norte glass skyscrapers flanking both sides.
8. **`complexo_cultural_republica`** (`X = +420, Z = +105`)
   - **Title**: Museu Nacional da República & Biblioteca Nacional
   - **Architect**: Oscar Niemeyer (2006)
   - **Subtitle**: A grande cúpula branca com rampa externa suspensa
   - **Visuals**: Pure white hemisphere dome encircled by a dramatic undulating concrete planetary ring/ramp, paired with the clean rectangular prism of the Biblioteca Nacional and reflecting pool.
9. **`catedral_brasilia`** (`X = +620, Z = +110`)
   - **Title**: Catedral Metropolitana Nossa Senhora Aparecida
   - **Architect**: Oscar Niemeyer (1970)
   - **Subtitle**: 16 colunas hiperboloides e vitrais de Marianne Peretti
   - **Visuals**: 16 soaring white hyperbolic concrete columns curving skyward like praying hands, glowing turquoise/blue/green stained-glass ceiling triangles, the 4 Evangelist bronze statues at the entrance, standalone bell tower, ovoid Baptistery, and circular water moat.
10. **`esplanada_ministerios`** (`X = +780` to `+1220`, `Z = ±105`)
    - **Title**: Esplanada dos Ministérios (17 Blocos + Itamaraty & Justiça)
    - **Architect**: Oscar Niemeyer & Lúcio Costa (1960)
    - **Subtitle**: Fileiras simétricas dos Ministérios, Palácio do Itamaraty e Palácio da Justiça
    - **Visuals**:
      - **North Row (Via N1, `Z = -105`)**: 9 identical modernist green-tinted glass & concrete slab buildings on pilotis, each with floating 3D signage (`MIN. DA FAZENDA`, `MIN. DA SAÚDE`, `MIN. DA EDUCAÇÃO`, `MIN. DA DEFESA`, `MIN. DO TRABALHO`, `MIN. DOS TRANSPORTES`, `MIN. DAS COMUNICAÇÕES`, `MIN. DO MEIO AMBIENTE`, plus **Palácio da Justiça** with its iconic concrete water-curtain arches and cascading waterfalls!).
      - **South Row (Via S1, `Z = +105`)**: 8 identical modernist ministry blocks (`MIN. DA CULTURA`, `MIN. DO ESPORTE`, `MIN. DO TURISMO`, `MIN. DA AGRICULTURA`, `MIN. DE MINAS E ENERGIA`, `MIN. DA CIÊNCIA E TECNOLOGIA`, `MIN. DO PLANEJAMENTO`, `MIN. DO DESENVOLVIMENTO`), culminating in the **Palácio do Itamaraty** (Arcos do Itamaraty over a lush reflecting pool with the floating *Meteoro* sculpture by Bruno Giorgi!).
11. **`congresso_nacional`** (`X = +1420, Z = 0`)
    - **Title**: Congresso Nacional & Praça dos Três Poderes
    - **Architect**: Oscar Niemeyer (1960)
    - **Subtitle**: As cúpulas do Senado (côncava) e da Câmara (convexa) e as Torres Gêmeas (Anexo I)
    - **Visuals**: The unmistakable silhouette of Brasília — the horizontal white platform with the concave dome (Senado Federal) on the left, convex bowl (Câmara dos Deputados) on the right, the Twin 28-story H-profile towers rising between them, two ceremonial white ramps, wide reflecting pool, and behind it (`X = +1580`) the **Palácio do Planalto**, **Supremo Tribunal Federal (STF)**, **Panteão da Pátria**, and **Mastro da Bandeira**!

## 4. Shared Module Exports

### `src/trackData.js`
- `TRACK_WAYPOINTS`: Ordered closed-loop array of `{ x, y, z, width, sectionId, speedBoost }` points forming the complete Eixo Monumental circuit (Via S1 West->East from Rodoferroviária to Congresso loop, then Via N1 East->West back to Rodoferroviária).
- `LANDMARKS`: Array of all 11 landmark objects `{ id, name, shortName, architect, year, subtitle, description, position: {x, y, z}, cameraLookAt: {x, y, z}, cameraPos: {x, y, z}, triggerRadius, color }`.
- `MINISTRIES`: Detailed array of the 17 Ministry blocks + Itamaraty + Palácio da Justiça with exact coordinates, side (`north` or `south`), label, and color accents.
- `BOOST_PADS` & `ITEM_BOX_LOCATIONS`: Coordinates along the track for Mario Kart item boxes and turbo chevrons.
- `sampleTrackSpline(numPoints)`: Helper returning smooth Catmull-Rom sampled points, tangents, normals, and cumulative distances.

### `src/landmarks3d.js`
- `buildBrasiliaWorld(scene, trackSpline)`: Builds and returns `{ landmarkGroups, animatedObjects, updateWorld(time, sunState) }`.
- Includes procedural PBR textures (travertine marble, brutalist fair-faced concrete, glass curtain walls with warm interior lighting, animated water shaders for Espelhos d'Água and Fonte da Torre de TV, Asa Sul & Asa Norte city skyline blocks, Ipê Amarelo / Ipê Roxo / Buriti trees, and Niemeyer curved street lamps).

### `src/karts.js`
- `KartController`: Player & AI kart physics + 3D mesh builder + item system + particle effects (drift sparks: blue -> orange -> purple ultra mini-turbo, exhaust flames, cerrado dust).
- **Playable Brazilian Karts**:
  1. **Capivara do Lago Paranoá** (Balanced Cruiser — Brasília Yellow/Green classic kart)
  2. **Lobo-Guará do Cerrado** (High Top Speed — Red/Gold sleek racer)
  3. **Caramelo do Eixão** (Acceleration & Drift King — Tropical Orange/White turbo kart)
  4. **Calango do Planalto** (Handling & Off-Road — Emerald/Cyan modernist kart)
- **Mario Kart Items (Brasília Edition)**:
  - **Turbo Cafézinho / Guaraná** (Mushroom triple boost)
  - **Jato da Fonte da Torre** (Homing water jet projectile)
  - **Pequi Dourado** (Star invincibility + rainbow aura + max speed)
  - **Casca de Pequi** (Banana hazard dropped behind)
  - **Sirene Ministerial** (Lightning shock wave slowing rivals)
- **Game Modes**:
  - `'race'`: 3-Lap Grand Prix against 5 AI racers with full items, drift boosts, and podium celebration.
  - `'cruise'`: **"Modo Passeio Turístico"** — Relaxed free-roam cruising at your own pace, instant teleport to any landmark, photo/drone camera, and audio/visual architectural guide cards as you pass each monument and ministry!

### `src/ui.js` & `src/audio.js`
- `GameUI`: Manages HUD (Speedometer, Lap, Position, Current Landmark Banner with architectural trivia, Item Slot Roulette, Interactive 3D/2D Avião de Brasília Minimap with clickable teleport pins, Time-of-Day selector: *Sol do Planalto*, *Pôr do Sol do Cerrado*, *Noite Cívica Iluminada*, and Camera selector: *Kart Chase*, *Cockpit*, *Helicóptero 3D / Mapa Vivo*, *Cartão-Postal*).
- `SoundEngine`: Web Audio API procedural synthesizer for engine RPM, drift screech, mini-turbo chime, item roulette, bossa-nova/choro & synthwave Brasília background soundtrack toggle, and tourist chime when discovering a monument.
