/**
 * Brasília Kart 3D — Eixo Monumental Edition (Ultra Immersion Build)
 * Main Orchestrator: Three.js WebGL Renderer, 5-Mode Interactive 360° Camera & Drone Map System
 * (Kart Chase, Convertible 360° Passeio, Cockpit 1st-Person, 3D Helicopter Map of Brasília, and Monument Mirante),
 * Full Eixo Monumental World Builder, Ultra Urban Immersion Layer (44 3D Floating Sky Pins, Banco Central,
 * Setor Hoteleiro Norte/Sul, Parque da Cidade Ferris Wheel, Nilson Nelson, Palácio da Alvorada, QG do Exército,
 * 8 DER-DF Green Highway Gantries, Civil Buses/Taxis, Helicopters & Tourists), Kart Physics/AI System,
 * Bossa-Nova Audio Engine, and HUD.
 */

import * as THREE from 'three';
import { createTrackSpline, LANDMARKS } from './trackData.js';
import { buildBrasiliaWorld } from './landmarks3d.js';
import { buildBrasiliaUltraImmersion } from './brasiliaCityImmersion.js';
import { createImmersionCameraAndEffects } from './cameraAndEffects.js';
import { createKartSystem, KART_ROSTER } from './karts.js';
import { SoundEngine } from './audio.js';
import { createGameUI } from './ui.js';

function initBrasiliaKart() {
  const canvas = document.getElementById('game-canvas');
  const uiContainer = document.getElementById('ui-root');

  // 1. High-Fidelity WebGL Renderer with ACES Filmic Tone Mapping & Soft Shadows
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;

  // 2. Scene & Camera Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    66,
    window.innerWidth / window.innerHeight,
    0.5,
    5200
  );

  // 3. Build Closed-Loop Eixo Monumental Spline (Rodoferroviária <-> Congresso Nacional)
  const trackSpline = createTrackSpline(THREE, 1400);

  // 4. Build Core 3D Brasília World (All 11 Landmarks, 17 Ministries + Itamaraty + Justiça,
  //    3D Asa Sul/Norte Avião Wings, Lago Paranoá, Ponte JK, Mané Garrincha, Ipês & Lighting)
  const world = buildBrasiliaWorld(THREE, scene, trackSpline);

  // 5. Build Ultra Brasília Urban Immersion Layer:
  //    - 44 Floating 3D Sky Pins & Beacons over every Monument, Ministry, Palace & Sector
  //    - Banco Central (Cruciform SBS Tower), Caixa, BB, Setor Hoteleiro Norte/Sul (SHN/SHS),
  //      Setor de Autarquias (SAS/SAN), Ginásio Nilson Nelson, Clube do Choro, Parque da Cidade
  //      with rotating Nicolândia Ferris Wheel, QG do Exército (SMU), Palácio da Alvorada & Torre Digital
  //    - 8 Green DER-DF Overhead Highway Sign Gantries across Via S1 & Via N1
  //    - Ministry Forecourts with Marquises, 3 Flagpoles, Brise-Soleil & Official Sedans
  //    - Moving Brasília Buses, Taxis, Sightseeing Helicopters, Paranoá Sailboats & Tourists
  const ultraImmersion = buildBrasiliaUltraImmersion(THREE, scene, trackSpline);

  // 6. Initialize Procedural Bossa-Kart & Engine Sound Synthesizer
  const soundEngine = new SoundEngine();
  soundEngine.updateEngineRPM = (normSpeed, isDrifting, isBoosting) => {
    soundEngine.updateEngine(normSpeed * 185, isDrifting, isBoosting);
  };
  soundEngine.playHitSpin = () => soundEngine.playSpinOut();
  soundEngine.playStarPower = () => soundEngine.playItemUse('pequi_dourado');

  // 7. Initialize Kart Physics, 6 Playable Brasília Drivers & AI System
  const kartSystem = createKartSystem(THREE, scene, trackSpline, soundEngine);

  // 8. Initialize Interactive 360° Free-Look Camera, Drone Map Orbit, Cerrado Dust,
  //    Sun God-Ray Corona & Guided 3D Architectural Tour Spotlight
  const cameraFX = createImmersionCameraAndEffects(THREE, renderer, scene, camera, canvas);
  let activeLandmark = LANDMARKS[0];
  let currentTimeOfDay = 'day';
  let labels3DVisible = true;

  function snapCameraToPlayer() {
    if (kartSystem.playerKart) {
      cameraFX.snapToKart(kartSystem.playerKart);
    }
  }

  // 9. Create Interactive HUD, 3D/2D Avião Minimap, Ministry Radar & Tourist Guide
  const ui = createGameUI({
    container: uiContainer,
    roster: KART_ROSTER.map(r => ({
      id: r.id,
      name: r.name,
      shortName: r.name.split(' ')[0],
      emoji: r.emoji,
      color: r.primaryColor,
      accent: r.secondaryColor,
      tagline: `${r.title} • ${r.description}`,
      stats: r.stats
    })),
    initialMode: 'race',
    initialTimeOfDay: 'day',
    initialCamera: 'chase',

    onSelectDriver: (driverId) => {
      const normalizedId = driverId === 'arara_caninde' ? 'arara_azul' : driverId;
      kartSystem.selectPlayerKart(normalizedId);
      snapCameraToPlayer();
      soundEngine.playBoost();
    },

    onStartGame: ({ mode, driverId }) => {
      const normalizedId = driverId === 'arara_caninde' ? 'arara_azul' : driverId;
      kartSystem.selectPlayerKart(normalizedId);
      kartSystem.setGameMode(mode);
      snapCameraToPlayer();
      if (mode === 'cruise') {
        cameraFX.setCameraMode('convertible');
        ui.setCameraMode('convertible');
        cameraFX.tourController.startGuidedTour((target) => {
          if (target && !target.isMinistry) {
            ui.setLandmark(target);
          }
        });
        ui.showBanner('🚘 PASSEIO 360° POR BRASÍLIA! ARRASTE O MOUSE P/ OLHAR OS PRÉDIOS!', 2600);
        soundEngine.playLandmarkChime();
      } else {
        ui.showBanner('🏁 LARGADA! GP EIXO MONUMENTAL!', 1800);
        soundEngine.playCountdownBeep(true);
      }
    },

    onRestartRace: () => {
      kartSystem.restartRace();
      snapCameraToPlayer();
      ui.showBanner('🏁 NOVA CORRIDA GP EIXO MONUMENTAL!', 1600);
      soundEngine.playCountdownBeep(true);
    },

    onModeChange: (newMode) => {
      kartSystem.setGameMode(newMode);
      if (newMode === 'cruise') {
        cameraFX.setCameraMode('convertible');
        ui.setCameraMode('convertible');
        cameraFX.tourController.startGuidedTour();
        ui.showBanner('🏛️ PASSEIO TURÍSTICO 360° (ARRASTE O MOUSE P/ OLHAR AO REDOR)', 2200);
        soundEngine.playLandmarkChime();
      } else {
        ui.showBanner('🏁 MODO CORRIDA GP (3 VOLTAS)', 1800);
        soundEngine.playCountdownBeep(true);
      }
    },

    onToggleAutopilot: (enabled) => {
      kartSystem.setCruiseAutopilot(enabled);
      if (enabled) {
        cameraFX.tourController.startGuidedTour();
      }
      ui.showBanner(
        enabled
          ? '🤖 PILOTO AUTOMÁTICO ATIVO — OLHE EM 360° COM O MOUSE!'
          : '🕹️ CONTROLE MANUAL DO KART ATIVADO',
        1800
      );
    },

    onCameraChange: (newCamMode) => {
      cameraFX.setCameraMode(newCamMode);
      const labels = {
        chase: '🏎️ CÂMERA KART (ARRASTE O MOUSE P/ OLHAR 360°)',
        convertible: '🚘 PASSEIO PANORÂMICO 360° (VISTA DOS MONUMENTOS & MINISTÉRIOS)',
        cockpit: '🕶️ COCKPIT 1ª PESSOA (OLHE PARA O ALTO DOS PRÉDIOS)',
        helicopter: '🚁 MAPA 3D VIVO DO AVIÃO (SCROLL = ZOOM 45m–850m | ARRASTE = GIRAR)',
        monument: '📸 MIRANTE CARTÃO-POSTAL DO MONUMENTO (ARRASTE P/ ORBITAR)'
      };
      ui.showBanner(labels[newCamMode] || 'CÂMERA ALTERADA', 1800);
    },

    onTimeOfDayChange: (tod) => {
      currentTimeOfDay = tod;
      world.setTimeOfDay(tod);
      cameraFX.setTimeOfDay(tod);
      const labels = {
        day: '☀️ SOL DO PLANALTO CENTRAL',
        sunset: '🌅 PÔR DO SOL LENDÁRIO DO CERRADO',
        night: '🌙 NOITE CÍVICA ILUMINADA EM BRASÍLIA'
      };
      ui.showBanner(labels[tod] || '', 1500);
    },

    onToggleLabels3D: (visible) => {
      labels3DVisible = Boolean(visible);
      if (ultraImmersion && Array.isArray(ultraImmersion.worldLabels3D)) {
        for (const item of ultraImmersion.worldLabels3D) {
          if (item.group) item.group.visible = labels3DVisible;
        }
      }
      ui.showBanner(
        labels3DVisible
          ? '📍 PLACAS & PINOS 3D DOS PRÉDIOS E MINISTÉRIOS ATIVADOS'
          : '📍 PLACAS 3D OCULTADAS',
        1400
      );
    },

    onTeleportLandmark: (landmarkId, landmarkObj) => {
      const lm = landmarkObj || LANDMARKS.find(l => l.id === landmarkId);
      if (!lm) return;
      activeLandmark = lm;
      cameraFX.setActiveLandmark(lm);
      cameraFX.tourController.highlightLandmark(lm);
      kartSystem.teleportPlayerToLandmark(lm);
      snapCameraToPlayer();
      soundEngine.playLandmarkChime();
      ui.showBanner(`📍 ${lm.name.toUpperCase()}`, 1800);
    },

    onLandmarkDiscovered: (lm) => {
      activeLandmark = lm;
      cameraFX.setActiveLandmark(lm);
      soundEngine.playLandmarkChime();
    },

    onUseItem: () => {
      const used = kartSystem.usePlayerItem();
      if (!used && kartSystem.playerKart) {
        soundEngine.playBoost();
      }
    },

    onTriggerBoost: () => {
      const player = kartSystem.playerKart;
      if (!player) return;
      if (player.heldItem) {
        kartSystem.usePlayerItem();
      } else {
        player.boostTimer = Math.max(player.boostTimer, 1.45);
        player.boostPower = Math.max(player.boostPower, 22);
        soundEngine.playBoost();
      }
    },

    onToggleMusic: () => {
      return soundEngine.toggleMusic();
    },

    onToggleSfx: () => {
      return soundEngine.toggleMute();
    },

    onMobileControl: (action, pressed) => {
      if (kartSystem.setMobileControl) {
        kartSystem.setMobileControl(action, pressed);
      }
    }
  });

  // 10. Wire Kart System Events to UI & Audio
  kartSystem.onItemPickup((heldItem) => {
    if (heldItem) {
      ui.triggerItemRoulette(heldItem.id, 900);
    } else {
      ui.setItem(null);
    }
  });

  kartSystem.onLandmarkEnter((lm) => {
    if (lm) {
      activeLandmark = lm;
      cameraFX.setActiveLandmark(lm);
      ui.setLandmark(lm);
      soundEngine.playLandmarkChime();
    }
  });

  kartSystem.onLapChange((newLap, totalLaps) => {
    const isFinal = newLap === totalLaps;
    soundEngine.playLapComplete(isFinal);
    ui.showBanner(
      isFinal ? `🔥 VOLTA FINAL (${newLap}/${totalLaps})!` : `🏁 VOLTA ${newLap} DE ${totalLaps}`,
      1800
    );
  });

  kartSystem.onRaceFinish((standings) => {
    soundEngine.playLapComplete(true);
    ui.showPodium(
      standings.map(s => ({
        name: s.name,
        emoji: s.emoji,
        position: s.rank,
        isPlayer: s.isPlayer
      }))
    );
  });

  // Keyboard shortcuts for cameras (C / 1-5), Time of Day (T), Autopilot (P), 3D Labels (L), and Next Landmark (N)
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    const code = e.code;
    if (code === 'KeyC') {
      const order = ['chase', 'convertible', 'cockpit', 'helicopter', 'monument'];
      const current = cameraFX.getCameraMode();
      const next = order[(order.indexOf(current) + 1) % order.length];
      cameraFX.setCameraMode(next);
      ui.setCameraMode(next);
    } else if (code === 'Digit1') {
      cameraFX.setCameraMode('chase');
      ui.setCameraMode('chase');
    } else if (code === 'Digit2') {
      cameraFX.setCameraMode('convertible');
      ui.setCameraMode('convertible');
    } else if (code === 'Digit3') {
      cameraFX.setCameraMode('cockpit');
      ui.setCameraMode('cockpit');
    } else if (code === 'Digit4') {
      cameraFX.setCameraMode('helicopter');
      ui.setCameraMode('helicopter');
    } else if (code === 'Digit5') {
      cameraFX.setCameraMode('monument');
      ui.setCameraMode('monument');
    } else if (code === 'KeyP') {
      const enabled = kartSystem.toggleCruiseAutopilot();
      ui.setAutopilot(enabled);
      if (enabled) cameraFX.tourController.startGuidedTour();
    } else if (code === 'KeyT') {
      const order = ['day', 'sunset', 'night'];
      const next = order[(order.indexOf(ui.state.timeOfDay) + 1) % order.length];
      currentTimeOfDay = next;
      world.setTimeOfDay(next);
      cameraFX.setTimeOfDay(next);
      ui.setTimeOfDay(next);
    } else if (code === 'KeyN') {
      const idx = LANDMARKS.findIndex(l => l.id === activeLandmark?.id);
      const nextLm = LANDMARKS[(idx + 1) % LANDMARKS.length];
      activeLandmark = nextLm;
      cameraFX.setActiveLandmark(nextLm);
      cameraFX.tourController.highlightLandmark(nextLm);
      kartSystem.teleportPlayerToLandmark(nextLm);
      ui.setLandmark(nextLm);
      snapCameraToPlayer();
      soundEngine.playLandmarkChime();
      ui.showBanner(`📍 ${nextLm.name.toUpperCase()}`, 1600);
    }
  });

  // Close initial garage modal automatically if user presses driving keys
  window.addEventListener('keydown', (e) => {
    if (['KeyW', 'ArrowUp', 'Space'].includes(e.code)) {
      ui.closeGarageModal();
    }
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start with Guided Tour Spotlight enabled so landmarks & ministries glow with 3D rings
  cameraFX.tourController.startGuidedTour();
  snapCameraToPlayer();
  ui.closeGarageModal();
  ui.showBanner('🏛️ BRASÍLIA 3D ULTRA IMERSÃO — ARRASTE O MOUSE P/ OLHAR EM 360°!', 3200);

  // 11. Main 60fps Animation Loop
  let lastTime = performance.now();
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    const elapsedSec = now * 0.001;

    // 1. Update Kart Physics, AI Racers, Drift Sparks & Projectiles
    kartSystem.update(dt, elapsedSec);

    // 2. Update Core World Animations (Fonte da Torre de TV, Palácio da Justiça waterfalls,
    //    Mastro da Bandeira waving flag, rotating item boxes, scrolling boost chevrons)
    world.updateWorld(elapsedSec, dt);

    const player = kartSystem.playerKart;
    const telemetry = kartSystem.getPlayerTelemetry();

    // 3. Update Ultra Urban Immersion Layer (44 Floating 3D Sky Pins distance scaling,
    //    Parque da Cidade Ferris Wheel rotation, Brasília Buses/Taxis, Helicopters, Sailboats & Tourists)
    if (ultraImmersion && typeof ultraImmersion.updateImmersion === 'function') {
      ultraImmersion.updateImmersion(
        elapsedSec,
        dt,
        player ? player.position : camera.position,
        currentTimeOfDay
      );
      if (!labels3DVisible && Array.isArray(ultraImmersion.worldLabels3D)) {
        for (const item of ultraImmersion.worldLabels3D) {
          if (item.group) item.group.visible = false;
        }
      }
    }

    // 4. Update Interactive 360° Camera, Drone Map Orbit, Cerrado Dust, Wind Lines & Sun Corona
    if (player) {
      player.cruiseAutopilot = telemetry ? telemetry.cruiseAutopilot : false;
      cameraFX.update(dt, elapsedSec, player, {
        speedKmh: telemetry ? telemetry.speedKmh : 0,
        activeLandmark,
        timeOfDay: currentTimeOfDay
      });
    }

    // 5. Update HUD, Speedometer, Live Ministry Radar & Avião Minimap
    if (telemetry) {
      ui.update({
        playerKart: telemetry.kart,
        speedKmh: telemetry.speedKmh,
        driftCharge: telemetry.kart.driftCharge,
        position: telemetry.rank,
        totalRacers: telemetry.totalRacers,
        lap: telemetry.lap,
        totalLaps: telemetry.totalLaps,
        raceTimeMs: telemetry.raceTime * 1000,
        currentItem: telemetry.heldItem ? telemetry.heldItem.id : null,
        aiKarts: kartSystem.karts.filter(k => !k.isPlayer).map(k => ({
          x: k.position.x,
          z: k.position.z,
          color: k.roster.primaryColor
        }))
      });
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

initBrasiliaKart();
