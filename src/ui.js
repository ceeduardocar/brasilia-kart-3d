/**
 * Brasília Kart 3D — Eixo Monumental Edition
 * Complete HUD, Interactive "Avião de Brasília" 3D/2D Minimap,
 * Live Esplanada dos Ministérios Radar, Architectural Tourist Guide Card,
 * Teleport Tour Bar, Mario Kart Speedometer/Item Roulette, and Garage/Podium Modals.
 */

import { LANDMARKS, MINISTRIES, TRACK_WAYPOINTS } from './trackData.js';

export const DEFAULT_KART_ROSTER = [
  {
    id: 'capivara',
    name: 'Capivara do Lago Paranoá',
    shortName: 'Capivara',
    emoji: '🦫',
    color: '#facc15',
    accent: '#16a34a',
    tagline: 'Equilibrada • Clássico Amarelo & Verde Brasília',
    stats: { speed: 84, accel: 86, handling: 88, drift: 85 }
  },
  {
    id: 'lobo_guara',
    name: 'Lobo-Guará do Cerrado',
    shortName: 'Lobo-Guará',
    emoji: '🦊',
    color: '#ef4444',
    accent: '#f59e0b',
    tagline: 'Velocidade Máxima • Flecha Vermelha do Planalto',
    stats: { speed: 96, accel: 78, handling: 80, drift: 84 }
  },
  {
    id: 'caramelo',
    name: 'Caramelo do Eixão',
    shortName: 'Caramelo',
    emoji: '🐕',
    color: '#f97316',
    accent: '#fef08a',
    tagline: 'Rei do Drift & Turbo • Laranja Tropical',
    stats: { speed: 86, accel: 94, handling: 88, drift: 96 }
  },
  {
    id: 'arara_caninde',
    name: 'Arara-Canindé da Esplanada',
    shortName: 'Arara-Canindé',
    emoji: '🦜',
    color: '#0ea5e9',
    accent: '#facc15',
    tagline: 'Aerodinâmica & Curvas • Azul Celeste & Ouro',
    stats: { speed: 90, accel: 88, handling: 92, drift: 89 }
  },
  {
    id: 'calango',
    name: 'Calango do Planalto',
    shortName: 'Calango',
    emoji: '🦎',
    color: '#10b981',
    accent: '#06b6d4',
    tagline: 'Agilidade & Off-Road • Esmeralda Modernista',
    stats: { speed: 82, accel: 92, handling: 96, drift: 90 }
  },
  {
    id: 'onca_pintada',
    name: 'Onça-Pintada Três Poderes',
    shortName: 'Onça-Pintada',
    emoji: '🐆',
    color: '#a855f7',
    accent: '#fbbf24',
    tagline: 'Potência Imperial • Roxo & Dourado Alvorada',
    stats: { speed: 94, accel: 86, handling: 84, drift: 91 }
  }
];

export const ITEM_CATALOG = {
  cafezinho: {
    id: 'cafezinho',
    name: 'Turbo Cafezinho & Guaraná',
    emoji: '☕',
    desc: 'Explosão tripla de velocidade na reta do Eixo!',
    color: '#f59e0b'
  },
  jato_fonte: {
    id: 'jato_fonte',
    name: 'Jato da Fonte da Torre',
    emoji: '💦',
    desc: 'Disparo teleguiado de água sob pressão!',
    color: '#38bdf8'
  },
  pequi_dourado: {
    id: 'pequi_dourado',
    name: 'Pequi Dourado do Cerrado',
    emoji: '🌟',
    desc: 'Invencibilidade Estelar + Velocidade Máxima!',
    color: '#facc15'
  },
  casca_pequi: {
    id: 'casca_pequi',
    name: 'Casca de Pequi Escorregadia',
    emoji: '🍋',
    desc: 'Armadilha na pista que faz rivais rodarem!',
    color: '#84cc16'
  },
  sirene_ministerial: {
    id: 'sirene_ministerial',
    name: 'Sirene Ministerial',
    emoji: '🚨',
    desc: 'Onda de choque cívica que reduz a velocidade dos rivais!',
    color: '#ef4444'
  }
};

function formatTimeMs(ms = 0) {
  const safe = Math.max(0, Number(ms) || 0);
  const totalSec = safe > 1000 ? safe / 1000 : safe;
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  const tenths = Math.floor((totalSec % 1) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}

export function createGameUI(callbacks = {}) {
  const roster = Array.isArray(callbacks.kartRoster) && callbacks.kartRoster.length
    ? callbacks.kartRoster
    : DEFAULT_KART_ROSTER;

  const state = {
    mode: callbacks.initialMode || 'race', // 'race' | 'cruise'
    autopilot: Boolean(callbacks.initialAutopilot),
    cameraMode: callbacks.initialCamera || 'chase', // 'chase' | 'cockpit' | 'helicopter' | 'monument'
    timeOfDay: callbacks.initialTimeOfDay || 'day', // 'day' | 'sunset' | 'night'
    selectedDriverId: roster[0].id,
    musicOn: false,
    sfxMuted: false,
    activeLandmarkId: null,
    pinnedLandmarkId: null,
    rouletteSpinning: false,
    rouletteTimer: null,
    currentItem: null
  };

  // Inject Scoped Styles for Glassmorphic Brasília Modernist HUD
  if (!document.getElementById('bsb-kart-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'bsb-kart-ui-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap');

      #bsb-hud-root {
        position: fixed;
        inset: 0;
        pointer-events: none;
        font-family: 'Outfit', system-ui, -apple-system, sans-serif;
        color: #f8fafc;
        z-index: 20;
        user-select: none;
        overflow: hidden;
      }
      #bsb-hud-root * {
        box-sizing: border-box;
      }
      .bsb-interactive {
        pointer-events: auto;
      }
      .bsb-glass {
        background: rgba(10, 18, 34, 0.76);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      }

      /* TOP BAR */
      .bsb-topbar {
        position: absolute;
        top: 10px;
        left: 12px;
        right: 12px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        z-index: 30;
      }
      .bsb-pill-group {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px;
        border-radius: 999px;
      }
      .bsb-pill-btn {
        border: none;
        background: transparent;
        color: #cbd5e1;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.18s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      }
      .bsb-pill-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }
      .bsb-pill-btn.active {
        background: linear-gradient(135deg, #facc15, #f59e0b);
        color: #0f172a;
        box-shadow: 0 2px 12px rgba(250, 204, 21, 0.45);
      }
      .bsb-pill-btn.autopilot-on {
        background: linear-gradient(135deg, #22c55e, #10b981);
        color: #052e16;
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.55);
      }

      /* LEFT COLUMN: ITEM SLOT + RACE TELEMETRY */
      .bsb-left-hud {
        position: absolute;
        top: 62px;
        left: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 25;
      }
      .bsb-item-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 18px;
        min-width: 240px;
        cursor: pointer;
        transition: transform 0.15s ease, border-color 0.2s ease;
      }
      .bsb-item-card:hover {
        transform: translateY(-2px);
        border-color: rgba(250, 204, 21, 0.6);
      }
      .bsb-item-slot-box {
        width: 54px;
        height: 54px;
        border-radius: 14px;
        background: radial-gradient(circle at 30% 30%, rgba(250, 204, 21, 0.28), rgba(15, 23, 42, 0.9));
        border: 2px solid rgba(250, 204, 21, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        box-shadow: inset 0 0 12px rgba(250, 204, 21, 0.25);
      }
      .bsb-race-stats {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 14px;
        border-radius: 16px;
      }
      .bsb-pos-badge {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 26px;
        font-weight: 800;
        color: #facc15;
        line-height: 1;
      }
      .bsb-stat-col {
        display: flex;
        flex-direction: column;
        font-size: 11px;
        color: #94a3b8;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      .bsb-stat-val {
        font-size: 14px;
        color: #f8fafc;
        font-weight: 800;
      }

      /* TOURIST GUIDE ARCHITECTURAL CARD */
      .bsb-guide-card {
        position: absolute;
        top: 62px;
        right: 14px;
        width: min(390px, calc(100vw - 28px));
        border-radius: 20px;
        padding: 14px 16px;
        transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 26;
      }
      .bsb-guide-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 6px;
      }
      .bsb-unesco-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(250, 204, 21, 0.18);
        color: #fde047;
        border: 1px solid rgba(250, 204, 21, 0.4);
      }
      .bsb-guide-title {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
        margin: 2px 0 4px;
      }
      .bsb-guide-meta {
        font-size: 12px;
        font-weight: 700;
        color: #38bdf8;
        margin-bottom: 5px;
      }
      .bsb-guide-sub {
        font-size: 12px;
        font-weight: 600;
        color: #fde047;
        margin-bottom: 6px;
      }
      .bsb-guide-desc {
        font-size: 12px;
        line-height: 1.45;
        color: #cbd5e1;
        margin: 0;
      }

      /* LIVE RADAR DOS MINISTÉRIOS TICKER */
      .bsb-ministry-radar {
        margin-top: 10px;
        padding: 8px 10px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(34, 197, 94, 0.45);
        display: none;
        flex-direction: column;
        gap: 4px;
      }
      .bsb-ministry-radar.visible {
        display: flex;
      }
      .bsb-radar-label {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #4ade80;
        text-transform: uppercase;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .bsb-radar-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 11.5px;
        font-weight: 700;
        color: #f8fafc;
      }

      /* CENTER COUNTDOWN / LAP / NOTIFICATION BANNER */
      .bsb-center-banner {
        position: absolute;
        top: 24%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
        z-index: 35;
      }
      .bsb-countdown-text {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 74px;
        font-weight: 900;
        color: #facc15;
        text-shadow: 0 6px 28px rgba(0, 0, 0, 0.75), 0 0 24px rgba(250, 204, 21, 0.65);
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .bsb-countdown-text.show {
        opacity: 1;
        transform: scale(1.06);
      }

      /* BOTTOM-LEFT SPEEDOMETER & NITRO */
      .bsb-speedo-panel {
        position: absolute;
        bottom: 58px;
        left: 14px;
        padding: 12px 16px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 25;
      }
      .bsb-speed-readout {
        display: flex;
        flex-direction: column;
        min-width: 92px;
      }
      .bsb-speed-num {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 38px;
        font-weight: 800;
        line-height: 0.95;
        color: #ffffff;
      }
      .bsb-speed-unit {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        margin-top: 3px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .bsb-gear-badge {
        background: rgba(250, 204, 21, 0.2);
        color: #facc15;
        padding: 1px 6px;
        border-radius: 6px;
        font-weight: 800;
      }
      .bsb-bars-col {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 125px;
      }
      .bsb-bar-track {
        width: 100%;
        height: 7px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        overflow: hidden;
      }
      .bsb-bar-fill {
        height: 100%;
        width: 0%;
        border-radius: 999px;
        transition: width 0.08s linear;
      }
      .bsb-nitro-btn {
        border: none;
        border-radius: 12px;
        padding: 7px 12px;
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 800;
        cursor: pointer;
        background: linear-gradient(135deg, #f97316, #ef4444);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
        transition: transform 0.12s ease;
      }
      .bsb-nitro-btn:active {
        transform: scale(0.95);
      }

      /* BOTTOM-RIGHT INTERACTIVE "MAPA 3D DO AVIÃO DE BRASÍLIA" MINIMAP */
      .bsb-minimap-card {
        position: absolute;
        bottom: 58px;
        right: 14px;
        width: 310px;
        border-radius: 20px;
        padding: 10px 12px;
        z-index: 25;
      }
      .bsb-minimap-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 800;
        color: #fde047;
        letter-spacing: 0.04em;
        margin-bottom: 6px;
      }
      .bsb-minimap-canvas-wrap {
        position: relative;
        width: 100%;
        height: 148px;
        border-radius: 14px;
        background: radial-gradient(circle at 50% 50%, rgba(15, 35, 66, 0.92), rgba(7, 13, 25, 0.96));
        border: 1px solid rgba(56, 189, 248, 0.28);
        overflow: hidden;
        cursor: pointer;
      }

      /* BOTTOM TELEPORT BAR: ROTEIRO DO EIXO MONUMENTAL */
      .bsb-roteiro-bar {
        position: absolute;
        bottom: 8px;
        left: 12px;
        right: 12px;
        height: 42px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        overflow-x: auto;
        scrollbar-width: none;
        z-index: 28;
      }
      .bsb-roteiro-bar::-webkit-scrollbar {
        display: none;
      }
      .bsb-roteiro-label {
        font-size: 11px;
        font-weight: 800;
        color: #facc15;
        white-space: nowrap;
        margin-right: 4px;
      }
      .bsb-stop-chip {
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.06);
        color: #e2e8f0;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        cursor: pointer;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.16s ease;
      }
      .bsb-stop-chip:hover {
        background: rgba(250, 204, 21, 0.22);
        border-color: #facc15;
        color: #ffffff;
      }
      .bsb-stop-chip.active {
        background: linear-gradient(135deg, #facc15, #f59e0b);
        color: #0f172a;
        border-color: transparent;
        font-weight: 800;
      }

      /* MODALS (START GARAGE & FINISH PODIUM) */
      .bsb-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(4, 9, 20, 0.72);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 60;
      }
      .bsb-modal-backdrop.hidden {
        display: none;
      }
      .bsb-modal-box {
        width: min(760px, 96vw);
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 26px;
        padding: 24px;
        background: linear-gradient(160deg, rgba(15, 23, 42, 0.96), rgba(8, 14, 28, 0.98));
        border: 1px solid rgba(250, 204, 21, 0.35);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
      }
      .bsb-roster-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        gap: 10px;
        margin: 14px 0 18px;
      }
      .bsb-driver-card {
        border-radius: 16px;
        padding: 11px 13px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.16s ease;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .bsb-driver-card:hover {
        background: rgba(255, 255, 255, 0.09);
      }
      .bsb-driver-card.selected {
        border-color: #facc15;
        background: rgba(250, 204, 21, 0.14);
        box-shadow: 0 0 20px rgba(250, 204, 21, 0.25);
      }
      .bsb-cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-end;
      }
      .bsb-cta-btn {
        border: none;
        border-radius: 14px;
        padding: 12px 20px;
        font-family: inherit;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .bsb-cta-btn:hover {
        transform: translateY(-2px);
      }
      .bsb-cta-primary {
        background: linear-gradient(135deg, #facc15, #f59e0b);
        color: #0f172a;
        box-shadow: 0 8px 24px rgba(250, 204, 21, 0.4);
      }
      .bsb-cta-secondary {
        background: linear-gradient(135deg, #0ea5e9, #2563eb);
        color: #ffffff;
        box-shadow: 0 8px 24px rgba(14, 165, 233, 0.35);
      }

      .bsb-mobile-controls {
        position: fixed;
        bottom: 62px;
        left: 12px;
        right: 12px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        pointer-events: none;
        z-index: 45;
      }
      .bsb-mobile-cluster {
        display: flex;
        gap: 10px;
        pointer-events: auto;
      }
      .bsb-touch-btn {
        width: 58px;
        height: 58px;
        border-radius: 18px;
        border: 2px solid rgba(250, 204, 21, 0.45);
        background: rgba(10, 16, 29, 0.84);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #f8fafc;
        font-family: inherit;
        font-size: 20px;
        font-weight: 900;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.55);
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
        transition: transform 0.08s ease, background 0.12s ease;
      }
      .bsb-touch-btn span {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: #facc15;
        margin-top: 1px;
      }
      .bsb-touch-btn:active,
      .bsb-touch-btn.pressed {
        transform: scale(0.92);
        background: rgba(250, 204, 21, 0.32);
        border-color: #facc15;
      }
      .bsb-touch-gas {
        width: 66px;
        height: 66px;
        border-color: rgba(34, 197, 94, 0.75);
        background: linear-gradient(145deg, rgba(22, 163, 74, 0.75), rgba(15, 23, 42, 0.9));
      }
      .bsb-touch-drift {
        border-color: rgba(56, 189, 248, 0.75);
        background: linear-gradient(145deg, rgba(2, 132, 199, 0.72), rgba(15, 23, 42, 0.9));
      }

      @media (min-width: 1025px) and (hover: hover) and (pointer: fine) {
        .bsb-mobile-controls:not(.force-show) {
          display: none;
        }
      }

      @media (max-width: 820px) {
        .bsb-guide-card {
          width: 245px;
          padding: 8px 10px;
          top: 98px;
        }
        .bsb-guide-desc {
          display: none;
        }
        .bsb-minimap-card {
          width: 185px;
          height: 112px;
          bottom: 135px;
        }
        .bsb-speedo-panel {
          bottom: 135px;
          transform: scale(0.84);
          transform-origin: bottom left;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create root HUD overlay
  let root = document.getElementById('bsb-hud-root');
  if (root) root.remove();
  root = document.createElement('div');
  root.id = 'bsb-hud-root';
  document.body.appendChild(root);

  root.innerHTML = `
    <!-- TOP BAR: MODE, AUTOPILOT, CAMERAS, CLIMA DO CERRADO, AUDIO -->
    <header class="bsb-topbar">
      <div class="bsb-pill-group bsb-glass bsb-interactive">
        <button class="bsb-pill-btn active" data-mode="race" title="Corrida Grand Prix 3 Voltas no Eixo Monumental">
          🏁 Corrida GP (3 Voltas)
        </button>
        <button class="bsb-pill-btn" data-mode="cruise" title="Passeio Turístico Livre pelos Monumentos">
          🏛️ Passeio Turístico Livre
        </button>
        <button class="bsb-pill-btn" id="bsb-btn-autopilot" title="Deixe o kart guiar sozinho por todos os monumentos!">
          🤖 Piloto Automático Turístico
        </button>
        <button class="bsb-pill-btn" id="bsb-btn-garage" title="Trocar de Piloto / Kart">
          🏎️ Trocar Kart
        </button>
      </div>

      <div class="bsb-pill-group bsb-glass bsb-interactive">
        <button class="bsb-pill-btn active" data-cam="chase" title="Perseguição Dinâmica (Arraste o mouse p/ olhar 360°!)">🏎️ Kart</button>
        <button class="bsb-pill-btn" data-cam="convertible" title="Conversível Panorâmico com vista ampla dos Ministérios e Monumentos!">🚘 Passeio 360°</button>
        <button class="bsb-pill-btn" data-cam="cockpit" title="1ª Pessoa dentro do Kart olhando para o alto dos prédios!">🕶️ Cockpit</button>
        <button class="bsb-pill-btn" data-cam="helicopter" title="Drone / Mapa 3D Vivo do Avião de Brasília (Use Scroll p/ Zoom 45m–850m!)">🚁 Mapa 3D (Avião)</button>
        <button class="bsb-pill-btn" data-cam="monument" title="Câmera Cartão-Postal focada no monumento atual">📸 Mirante</button>
      </div>

      <div class="bsb-pill-group bsb-glass bsb-interactive">
        <button class="bsb-pill-btn active" id="bsb-btn-labels3d" title="Mostrar/Ocultar Placas e Pinos 3D Flutuantes sobre os Prédios, Ministérios e Monumentos">📍 Placas 3D: ON</button>
        <button class="bsb-pill-btn" id="bsb-btn-touchpad" title="Mostrar/Ocultar Controles Touch na Tela (Android / iPhone)">📱 Touch</button>
        <button class="bsb-pill-btn active" data-time="day">☀️ Sol</button>
        <button class="bsb-pill-btn" data-time="sunset">🌅 Pôr do Sol</button>
        <button class="bsb-pill-btn" data-time="night">🌙 Noite</button>
        <button class="bsb-pill-btn" id="bsb-btn-music" title="Ligar/Desligar Trilha Bossa-Kart Brasília">🎵 Bossa: OFF</button>
        <button class="bsb-pill-btn" id="bsb-btn-sfx" title="Silenciar/Ativar Efeitos Sonoros">🔊 SFX</button>
      </div>
    </header>

    <!-- TOP-LEFT: MARIO KART ITEM ROULETTE & RACE TELEMETRY -->
    <aside class="bsb-left-hud">
      <div class="bsb-item-card bsb-glass bsb-interactive" id="bsb-item-card" title="Clique ou aperte [E] / [Espaço] para usar o item!">
        <div class="bsb-item-slot-box" id="bsb-item-icon">🎲</div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:10px;font-weight:800;letter-spacing:0.08em;color:#facc15;text-transform:uppercase;">
            Poder Brasília • [E] / Clique
          </span>
          <strong style="font-size:14px;color:#fff;" id="bsb-item-name">Caixa de Item do Eixo</strong>
          <span style="font-size:11px;color:#94a3b8;" id="bsb-item-desc">Passe nos cubos dourados na pista!</span>
        </div>
      </div>

      <div class="bsb-race-stats bsb-glass">
        <div class="bsb-pos-badge" id="bsb-race-pos">1º<span style="font-size:14px;color:#94a3b8;">/6</span></div>
        <div class="bsb-stat-col">
          <span>VOLTA</span>
          <span class="bsb-stat-val" id="bsb-race-lap">1 / 3</span>
        </div>
        <div class="bsb-stat-col">
          <span>CRONÔMETRO</span>
          <span class="bsb-stat-val" id="bsb-race-timer">00:00.0</span>
        </div>
        <div class="bsb-stat-col">
          <span>SENTIDO EIXO</span>
          <span class="bsb-stat-val" id="bsb-eixo-sense" style="color:#38bdf8;">Via S1 ➔ Leste</span>
        </div>
      </div>
    </aside>

    <!-- TOP-RIGHT: INTERACTIVE ARCHITECTURAL TOURIST GUIDE CARD & MINISTRY RADAR -->
    <section class="bsb-guide-card bsb-glass bsb-interactive" id="bsb-guide-card">
      <div class="bsb-guide-header">
        <span class="bsb-unesco-badge">🏛️ PATRIMÔNIO MUNDIAL UNESCO</span>
        <span style="font-size:11px;font-weight:800;color:#94a3b8;" id="bsb-guide-index">Monumento 1/11</span>
      </div>
      <h2 class="bsb-guide-title" id="bsb-guide-title">Eixo Monumental de Brasília</h2>
      <div class="bsb-guide-meta" id="bsb-guide-meta">Lúcio Costa & Oscar Niemeyer • 1960</div>
      <div class="bsb-guide-sub" id="bsb-guide-sub">Plano Piloto — Da Rodoferroviária à Praça dos Três Poderes</div>
      <p class="bsb-guide-desc" id="bsb-guide-desc">
        Aproxime-se de qualquer monumento ou clique em um ponto abaixo para conhecer a arquitetura modernista da capital e teleportar seu kart instantaneamente!
      </p>

      <!-- LIVE RADAR DOS MINISTÉRIOS TICKER -->
      <div class="bsb-ministry-radar" id="bsb-ministry-radar">
        <div class="bsb-radar-label">
          <span>📡 RADAR DA ESPLANADA DOS MINISTÉRIOS</span>
          <span id="bsb-radar-x">Eixo Leste</span>
        </div>
        <div class="bsb-radar-row">
          <span id="bsb-min-north" style="color:#38bdf8;">⬅️ Via N1: Min. da Educação</span>
          <span style="color:#64748b;">|</span>
          <span id="bsb-min-south" style="color:#facc15;text-align:right;">Via S1: Min. da Cultura ➡️</span>
        </div>
      </div>
    </section>

    <!-- CENTER COUNTDOWN / BANNER -->
    <div class="bsb-center-banner">
      <div class="bsb-countdown-text" id="bsb-countdown-text"></div>
    </div>

    <!-- BOTTOM-LEFT: DIGITAL SPEEDOMETER, RPM, DRIFT MINI-TURBO & NITRO BUTTON -->
    <section class="bsb-speedo-panel bsb-glass bsb-interactive">
      <div class="bsb-speed-readout">
        <div class="bsb-speed-num" id="bsb-speed-val">0</div>
        <div class="bsb-speed-unit">
          <span>KM/H</span>
          <span class="bsb-gear-badge" id="bsb-gear-val">1ª</span>
        </div>
      </div>

      <div class="bsb-bars-col">
        <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:800;color:#cbd5e1;">
          <span>RPM MOTOR</span>
          <span id="bsb-rpm-label">IDLE</span>
        </div>
        <div class="bsb-bar-track">
          <div class="bsb-bar-fill" id="bsb-rpm-bar" style="background:linear-gradient(90deg,#22c55e,#facc15,#ef4444);"></div>
        </div>

        <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:800;color:#38bdf8;">
          <span>DRIFT MINI-TURBO [SHIFT]</span>
          <span id="bsb-drift-label">PRONTO</span>
        </div>
        <div class="bsb-bar-track">
          <div class="bsb-bar-fill" id="bsb-drift-bar" style="background:linear-gradient(90deg,#38bdf8,#f97316,#a855f7);"></div>
        </div>
      </div>

      <button class="bsb-nitro-btn" id="bsb-btn-nitro" title="Acionar Turbo Nitro Manual!">
        🔥 TURBO<br/>NITRO
      </button>
    </section>

    <!-- BOTTOM-RIGHT: INTERACTIVE "MAPA 3D DO AVIÃO DE BRASÍLIA" MINIMAP -->
    <section class="bsb-minimap-card bsb-glass bsb-interactive">
      <div class="bsb-minimap-header">
        <span>✈️ MAPA 3D DO AVIÃO (PLANO PILOTO)</span>
        <span style="color:#38bdf8;font-size:10px;">Clique p/ Ir</span>
      </div>
      <div class="bsb-minimap-canvas-wrap" id="bsb-minimap-wrap" title="Clique em qualquer monumento no Avião de Brasília para teleportar seu kart!">
        <canvas id="bsb-minimap-canvas" width="300" height="148" style="width:100%;height:100%;display:block;"></canvas>
      </div>
    </section>

    <!-- MOBILE TOUCH GAMEPAD (ANDROID & IPHONE) -->
    <div class="bsb-mobile-controls" id="bsb-mobile-controls">
      <div class="bsb-mobile-cluster">
        <button class="bsb-touch-btn" data-touch-ctrl="left">◀<span>ESQ</span></button>
        <button class="bsb-touch-btn" data-touch-ctrl="right">▶<span>DIR</span></button>
      </div>
      <div class="bsb-mobile-cluster">
        <button class="bsb-touch-btn" data-touch-ctrl="down">⏪<span>FREIO</span></button>
        <button class="bsb-touch-btn bsb-touch-drift" data-touch-ctrl="drift">⚡<span>DRIFT</span></button>
        <button class="bsb-touch-btn bsb-touch-gas" data-touch-ctrl="up">🚀<span>ACELERAR</span></button>
      </div>
    </div>

    <!-- BOTTOM HORIZONTAL TELEPORT BAR: ROTEIRO DO EIXO MONUMENTAL (1 TO 11) -->
    <nav class="bsb-roteiro-bar bsb-glass bsb-interactive" id="bsb-roteiro-bar">
      <span class="bsb-roteiro-label">🧭 Roteiro do Eixo Monumental (Clique para Ir):</span>
    </nav>

    <!-- START / GARAGE MODAL -->
    <div class="bsb-modal-backdrop bsb-interactive hidden" id="bsb-garage-modal">
      <div class="bsb-modal-box">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <span class="bsb-unesco-badge">🇧🇷 BRASÍLIA KART 3D • EIXO MONUMENTAL EDITION</span>
            <h1 style="margin:6px 0 2px;font-size:26px;font-weight:900;color:#fff;">
              Escolha seu Piloto do Cerrado & Modo de Jogo
            </h1>
            <p style="margin:0;font-size:13px;color:#94a3b8;">
              Circuito completo da <strong>Rodoferroviária</strong> ao <strong>Congresso Nacional & Três Poderes</strong> (Via S1 & Via N1)
            </p>
          </div>
          <button class="bsb-pill-btn" id="bsb-modal-close" style="background:rgba(255,255,255,0.1);">✕ Fechar</button>
        </div>

        <div class="bsb-roster-grid" id="bsb-roster-grid"></div>

        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.12);">
          <div style="font-size:12px;color:#cbd5e1;line-height:1.5;">
            🎮 <strong>Controles:</strong> <kbd>W A S D</kbd> ou <kbd>Setas</kbd> Dirigir • <kbd>Shift</kbd> / <kbd>Espaço</kbd> Drift Mini-Turbo • <kbd>E</kbd> Usar Item • <kbd>C</kbd> Câmera
          </div>
          <div class="bsb-cta-row">
            <button class="bsb-cta-btn bsb-cta-secondary" id="bsb-start-cruise">
              🏛️ Iniciar Passeio Turístico Livre
            </button>
            <button class="bsb-cta-btn bsb-cta-primary" id="bsb-start-race">
              🏁 Largada GP Eixo Monumental (3 Voltas)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- FINISH PODIUM MODAL -->
    <div class="bsb-modal-backdrop bsb-interactive hidden" id="bsb-podium-modal">
      <div class="bsb-modal-box" style="max-width:560px;text-align:center;">
        <span class="bsb-unesco-badge">🏆 GRANDE PRÊMIO DO EIXO MONUMENTAL</span>
        <h1 style="margin:8px 0 4px;font-size:28px;font-weight:900;color:#facc15;" id="bsb-podium-title">
          Bandeirada no Congresso Nacional!
        </h1>
        <p style="margin:0 0 14px;font-size:14px;color:#cbd5e1;" id="bsb-podium-subtitle">
          Confira a classificação final após 3 voltas completas pelo Plano Piloto:
        </p>
        <div id="bsb-podium-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px;text-align:left;"></div>
        <div class="bsb-cta-row" style="justify-content:center;">
          <button class="bsb-cta-btn bsb-cta-secondary" id="bsb-podium-cruise">
            🏛️ Continuar em Passeio Turístico
          </button>
          <button class="bsb-cta-btn bsb-cta-primary" id="bsb-podium-restart">
            🏁 Nova Corrida GP
          </button>
        </div>
      </div>
    </div>
  `;

  // DOM References
  const modeBtns = Array.from(root.querySelectorAll('[data-mode]'));
  const camBtns = Array.from(root.querySelectorAll('[data-cam]'));
  const timeBtns = Array.from(root.querySelectorAll('[data-time]'));
  const autopilotBtn = root.querySelector('#bsb-btn-autopilot');
  const garageBtn = root.querySelector('#bsb-btn-garage');
  const musicBtn = root.querySelector('#bsb-btn-music');
  const sfxBtn = root.querySelector('#bsb-btn-sfx');

  const itemCard = root.querySelector('#bsb-item-card');
  const itemIconEl = root.querySelector('#bsb-item-icon');
  const itemNameEl = root.querySelector('#bsb-item-name');
  const itemDescEl = root.querySelector('#bsb-item-desc');

  const posEl = root.querySelector('#bsb-race-pos');
  const lapEl = root.querySelector('#bsb-race-lap');
  const timerEl = root.querySelector('#bsb-race-timer');
  const senseEl = root.querySelector('#bsb-eixo-sense');

  const guideIndexEl = root.querySelector('#bsb-guide-index');
  const guideTitleEl = root.querySelector('#bsb-guide-title');
  const guideMetaEl = root.querySelector('#bsb-guide-meta');
  const guideSubEl = root.querySelector('#bsb-guide-sub');
  const guideDescEl = root.querySelector('#bsb-guide-desc');
  const ministryRadarEl = root.querySelector('#bsb-ministry-radar');
  const minNorthEl = root.querySelector('#bsb-min-north');
  const minSouthEl = root.querySelector('#bsb-min-south');
  const radarXEl = root.querySelector('#bsb-radar-x');

  const countdownEl = root.querySelector('#bsb-countdown-text');
  const speedValEl = root.querySelector('#bsb-speed-val');
  const gearValEl = root.querySelector('#bsb-gear-val');
  const rpmLabelEl = root.querySelector('#bsb-rpm-label');
  const rpmBarEl = root.querySelector('#bsb-rpm-bar');
  const driftLabelEl = root.querySelector('#bsb-drift-label');
  const driftBarEl = root.querySelector('#bsb-drift-bar');
  const nitroBtn = root.querySelector('#bsb-btn-nitro');

  const minimapCanvas = root.querySelector('#bsb-minimap-canvas');
  const minimapCtx = minimapCanvas.getContext('2d');
  const roteiroBar = root.querySelector('#bsb-roteiro-bar');

  const garageModal = root.querySelector('#bsb-garage-modal');
  const rosterGrid = root.querySelector('#bsb-roster-grid');
  const modalCloseBtn = root.querySelector('#bsb-modal-close');
  const startCruiseBtn = root.querySelector('#bsb-start-cruise');
  const startRaceBtn = root.querySelector('#bsb-start-race');

  const podiumModal = root.querySelector('#bsb-podium-modal');
  const podiumTitleEl = root.querySelector('#bsb-podium-title');
  const podiumListEl = root.querySelector('#bsb-podium-list');
  const podiumCruiseBtn = root.querySelector('#bsb-podium-cruise');
  const podiumRestartBtn = root.querySelector('#bsb-podium-restart');

  // Build Horizontal Teleport Chips for all 11 Ordered Landmarks
  const stopChips = new Map();
  LANDMARKS.forEach((lm, idx) => {
    const chip = document.createElement('button');
    chip.className = 'bsb-stop-chip';
    chip.dataset.landmarkId = lm.id;
    chip.innerHTML = `<span style="color:${lm.color};font-weight:900;">${idx + 1}.</span> ${lm.shortName || lm.name}`;
    chip.addEventListener('click', () => {
      selectLandmark(lm, true);
    });
    roteiroBar.appendChild(chip);
    stopChips.set(lm.id, chip);
  });

  // Build Garage Driver Selection Cards
  function renderRosterCards() {
    rosterGrid.innerHTML = '';
    roster.forEach((driver) => {
      const card = document.createElement('div');
      card.className = `bsb-driver-card ${driver.id === state.selectedDriverId ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:24px;">${driver.emoji || '🏎️'}</span>
          <span style="width:14px;height:14px;border-radius:999px;background:${driver.color || '#facc15'};border:2px solid ${driver.accent || '#fff'};"></span>
        </div>
        <strong style="font-size:14px;color:#fff;">${driver.name}</strong>
        <span style="font-size:11px;color:#94a3b8;">${driver.tagline || 'Piloto Oficial do Eixo'}</span>
      `;
      card.addEventListener('click', () => {
        state.selectedDriverId = driver.id;
        renderRosterCards();
        if (callbacks.onSelectDriver) callbacks.onSelectDriver(driver.id, driver);
        if (callbacks.onSelectKart) callbacks.onSelectKart(driver.id, driver);
      });
      rosterGrid.appendChild(card);
    });
  }
  renderRosterCards();

  // Helper to update Tourist Guide Card
  function updateGuideCard(landmark) {
    if (!landmark) return;
    const idx = LANDMARKS.findIndex(l => l.id === landmark.id);
    guideIndexEl.textContent = idx >= 0 ? `Monumento ${idx + 1} de ${LANDMARKS.length}` : 'Eixo Monumental';
    guideTitleEl.textContent = landmark.name;
    guideMetaEl.textContent = `${landmark.architect} • Inauguração: ${landmark.year}`;
    guideSubEl.textContent = landmark.subtitle || '';
    guideDescEl.textContent = landmark.description || '';

    stopChips.forEach((chip, id) => {
      chip.classList.toggle('active', id === landmark.id);
    });
  }

  function selectLandmark(landmark, shouldTeleport = false) {
    if (!landmark) return;
    state.activeLandmarkId = landmark.id;
    updateGuideCard(landmark);
    if (shouldTeleport) {
      if (callbacks.onTeleportLandmark) callbacks.onTeleportLandmark(landmark.id, landmark);
      if (callbacks.onSelectLandmark) callbacks.onSelectLandmark(landmark.id, landmark);
      if (callbacks.onTeleport) callbacks.onTeleport(landmark.id, landmark);
    }
  }

  // Initialize guide card with first landmark (Rodoferroviária)
  updateGuideCard(LANDMARKS[0]);

  // Top Bar Mode Switching
  function setMode(newMode, notify = true) {
    state.mode = newMode;
    modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === newMode));
    if (notify) {
      if (callbacks.onModeChange) callbacks.onModeChange(newMode);
      if (callbacks.onChangeMode) callbacks.onChangeMode(newMode);
    }
  }
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode, true));
  });

  // Autopilot Tourist Toggle
  function setAutopilot(enabled, notify = true) {
    state.autopilot = Boolean(enabled);
    autopilotBtn.classList.toggle('autopilot-on', state.autopilot);
    autopilotBtn.textContent = state.autopilot
      ? '🤖 Piloto Automático: ATIVO'
      : '🤖 Piloto Automático Turístico';
    if (notify) {
      if (callbacks.onToggleAutopilot) callbacks.onToggleAutopilot(state.autopilot);
      if (callbacks.onAutopilotChange) callbacks.onAutopilotChange(state.autopilot);
    }
  }
  autopilotBtn.addEventListener('click', () => setAutopilot(!state.autopilot, true));

  // Camera View Selector
  function setCameraMode(camMode, notify = true) {
    state.cameraMode = camMode;
    camBtns.forEach(b => b.classList.toggle('active', b.dataset.cam === camMode));
    if (notify) {
      if (callbacks.onCameraChange) callbacks.onCameraChange(camMode);
      if (callbacks.onChangeCamera) callbacks.onChangeCamera(camMode);
    }
  }
  camBtns.forEach(btn => {
    btn.addEventListener('click', () => setCameraMode(btn.dataset.cam, true));
  });

  // Time-of-Day / Clima do Cerrado Selector
  function setTimeOfDay(tod, notify = true) {
    state.timeOfDay = tod;
    timeBtns.forEach(b => b.classList.toggle('active', b.dataset.time === tod));
    if (notify) {
      if (callbacks.onTimeOfDayChange) callbacks.onTimeOfDayChange(tod);
      if (callbacks.onChangeTimeOfDay) callbacks.onChangeTimeOfDay(tod);
    }
  }
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => setTimeOfDay(btn.dataset.time, true));
  });

  // 3D Floating Sky Labels Toggle
  const labels3dBtn = root.querySelector('#bsb-btn-labels3d');
  state.labels3dOn = true;
  if (labels3dBtn) {
    labels3dBtn.addEventListener('click', () => {
      state.labels3dOn = !state.labels3dOn;
      labels3dBtn.textContent = state.labels3dOn ? '📍 Placas 3D: ON' : '📍 Placas 3D: OFF';
      labels3dBtn.classList.toggle('active', state.labels3dOn);
      if (callbacks.onToggleLabels3D) callbacks.onToggleLabels3D(state.labels3dOn);
    });
  }

  // Android / iPhone Touch Gamepad Controls & Toggle Button
  const touchpadToggleBtn = root.querySelector('#bsb-btn-touchpad');
  const mobileControlsEl = root.querySelector('#bsb-mobile-controls');
  if (touchpadToggleBtn && mobileControlsEl) {
    touchpadToggleBtn.addEventListener('click', () => {
      const forced = mobileControlsEl.classList.toggle('force-show');
      touchpadToggleBtn.classList.toggle('active', forced);
    });
  }

  const touchBtns = Array.from(root.querySelectorAll('[data-touch-ctrl]'));
  touchBtns.forEach(btn => {
    const action = btn.dataset.touchCtrl;
    const press = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.add('pressed');
      if (callbacks.onMobileControl) callbacks.onMobileControl(action, true);
    };
    const release = (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.remove('pressed');
      if (callbacks.onMobileControl) callbacks.onMobileControl(action, false);
    };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
  });

  // Audio Controls
  musicBtn.addEventListener('click', () => {
    let next = !state.musicOn;
    if (callbacks.onToggleMusic) {
      const res = callbacks.onToggleMusic();
      if (typeof res === 'boolean') next = res;
    }
    state.musicOn = next;
    musicBtn.textContent = state.musicOn ? '🎵 Bossa: ON' : '🎵 Bossa: OFF';
    musicBtn.classList.toggle('active', state.musicOn);
  });

  sfxBtn.addEventListener('click', () => {
    let muted = !state.sfxMuted;
    if (callbacks.onToggleSfx) {
      const res = callbacks.onToggleSfx();
      if (typeof res === 'boolean') muted = res;
    }
    state.sfxMuted = muted;
    sfxBtn.textContent = state.sfxMuted ? '🔇 Mudo' : '🔊 SFX';
  });

  // Item Use & Manual Nitro Button
  itemCard.addEventListener('click', () => {
    if (callbacks.onUseItem) callbacks.onUseItem(state.currentItem);
  });
  nitroBtn.addEventListener('click', () => {
    if (callbacks.onTriggerBoost) callbacks.onTriggerBoost();
    else if (callbacks.onNitro) callbacks.onNitro();
    else if (callbacks.onUseItem) callbacks.onUseItem('cafezinho');
  });

  // Garage & Podium Modal Buttons
  garageBtn.addEventListener('click', () => {
    garageModal.classList.remove('hidden');
  });
  modalCloseBtn.addEventListener('click', () => {
    garageModal.classList.add('hidden');
  });
  startCruiseBtn.addEventListener('click', () => {
    garageModal.classList.add('hidden');
    setMode('cruise', true);
    if (callbacks.onStartGame) callbacks.onStartGame({ mode: 'cruise', driverId: state.selectedDriverId });
  });
  startRaceBtn.addEventListener('click', () => {
    garageModal.classList.add('hidden');
    setMode('race', true);
    if (callbacks.onStartGame) callbacks.onStartGame({ mode: 'race', driverId: state.selectedDriverId });
  });

  podiumCruiseBtn.addEventListener('click', () => {
    podiumModal.classList.add('hidden');
    setMode('cruise', true);
    if (callbacks.onStartGame) callbacks.onStartGame({ mode: 'cruise', driverId: state.selectedDriverId });
  });
  podiumRestartBtn.addEventListener('click', () => {
    podiumModal.classList.add('hidden');
    setMode('race', true);
    if (callbacks.onRestartRace) callbacks.onRestartRace();
    else if (callbacks.onStartGame) callbacks.onStartGame({ mode: 'race', driverId: state.selectedDriverId });
  });

  // ============================================================================
  // INTERACTIVE "MAPA 3D DO AVIÃO DE BRASÍLIA" MINIMAP RENDERER & CLICK TELEPORT
  // ============================================================================
  const MAP_W = minimapCanvas.width;
  const MAP_H = minimapCanvas.height;

  // World coordinate bounds: X in [-1620, +1660], Z in [-520, +520] (includes Asa Norte & Asa Sul wings)
  function worldToMinimap(wx, wz) {
    const nx = (wx - (-1650)) / (1680 - (-1650)); // 0..1 West to East
    const nz = (wz - (-480)) / (480 - (-480));    // 0..1 North to South
    return {
      x: 16 + nx * (MAP_W - 32),
      y: 14 + nz * (MAP_H - 28)
    };
  }

  // Click on Minimap to Teleport to Nearest Landmark
  minimapCanvas.addEventListener('click', (e) => {
    const rect = minimapCanvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * MAP_W;
    const cy = ((e.clientY - rect.top) / rect.height) * MAP_H;

    let bestLm = null;
    let bestD2 = Infinity;
    for (const lm of LANDMARKS) {
      const pt = worldToMinimap(lm.position.x, lm.position.z);
      const dx = pt.x - cx;
      const dy = pt.y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        bestLm = lm;
      }
    }
    if (bestLm && bestD2 <= 36 * 36) {
      selectLandmark(bestLm, true);
    }
  });

  function drawAviaoMinimap(playerKart, aiKarts = []) {
    minimapCtx.clearRect(0, 0, MAP_W, MAP_H);

    // 1. Draw Lago Paranoá eastern shoreline arc
    minimapCtx.save();
    minimapCtx.strokeStyle = 'rgba(14, 165, 233, 0.28)';
    minimapCtx.lineWidth = 10;
    minimapCtx.beginPath();
    minimapCtx.arc(MAP_W - 22, MAP_H / 2, 54, -Math.PI * 0.65, Math.PI * 0.65);
    minimapCtx.stroke();
    minimapCtx.restore();

    // 2. Draw Lúcio Costa's "Avião" Wings (Asa Norte & Asa Sul swept curves) at Rodoviária (X = +95)
    const rodoviariaPt = worldToMinimap(95, 0);
    minimapCtx.save();
    minimapCtx.strokeStyle = 'rgba(56, 189, 248, 0.34)';
    minimapCtx.lineWidth = 14;
    minimapCtx.lineCap = 'round';
    minimapCtx.beginPath();
    // Asa Norte (top swept wing)
    minimapCtx.moveTo(rodoviariaPt.x - 16, 10);
    minimapCtx.quadraticCurveTo(rodoviariaPt.x + 8, rodoviariaPt.y - 26, rodoviariaPt.x, rodoviariaPt.y);
    // Asa Sul (bottom swept wing)
    minimapCtx.quadraticCurveTo(rodoviariaPt.x + 8, rodoviariaPt.y + 26, rodoviariaPt.x - 16, MAP_H - 10);
    minimapCtx.stroke();

    // Inner Eixão wing highway line
    minimapCtx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    minimapCtx.lineWidth = 2;
    minimapCtx.stroke();
    minimapCtx.restore();

    // 3. Draw Gramado Central do Eixo Monumental (Fuselage of the Airplane)
    const westLawn = worldToMinimap(-1460, 0);
    const eastLawn = worldToMinimap(1490, 0);
    minimapCtx.save();
    minimapCtx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
    minimapCtx.lineWidth = 16;
    minimapCtx.lineCap = 'round';
    minimapCtx.beginPath();
    minimapCtx.moveTo(westLawn.x, westLawn.y);
    minimapCtx.lineTo(eastLawn.x, eastLawn.y);
    minimapCtx.stroke();
    minimapCtx.restore();

    // 4. Draw Eixo Monumental Circuit Loop (Via S1 & Via N1)
    minimapCtx.save();
    minimapCtx.beginPath();
    TRACK_WAYPOINTS.forEach((wp, idx) => {
      const p = worldToMinimap(wp.x, wp.z);
      if (idx === 0) minimapCtx.moveTo(p.x, p.y);
      else minimapCtx.lineTo(p.x, p.y);
    });
    minimapCtx.closePath();
    minimapCtx.strokeStyle = 'rgba(226, 232, 240, 0.78)';
    minimapCtx.lineWidth = 3.2;
    minimapCtx.stroke();
    minimapCtx.restore();

    // 5. Draw Clickable Glowing Pins for all 11 Landmarks
    LANDMARKS.forEach((lm, idx) => {
      const pt = worldToMinimap(lm.position.x, lm.position.z);
      const isCurrent = lm.id === state.activeLandmarkId;

      minimapCtx.save();
      minimapCtx.beginPath();
      minimapCtx.arc(pt.x, pt.y, isCurrent ? 5.8 : 3.8, 0, Math.PI * 2);
      minimapCtx.fillStyle = lm.color || '#facc15';
      minimapCtx.fill();
      minimapCtx.lineWidth = isCurrent ? 2 : 1;
      minimapCtx.strokeStyle = '#ffffff';
      minimapCtx.stroke();

      if (isCurrent) {
        minimapCtx.font = '700 9px Outfit, sans-serif';
        minimapCtx.fillStyle = '#fde047';
        minimapCtx.textAlign = 'center';
        minimapCtx.fillText(`${idx + 1}. ${lm.shortName}`, Math.max(36, Math.min(MAP_W - 36, pt.x)), pt.y - 8);
      }
      minimapCtx.restore();
    });

    // 6. Draw AI Karts
    if (Array.isArray(aiKarts)) {
      aiKarts.forEach((kart) => {
        if (!kart) return;
        const kx = kart.x ?? kart.position?.x ?? 0;
        const kz = kart.z ?? kart.position?.z ?? 0;
        const pt = worldToMinimap(kx, kz);
        minimapCtx.save();
        minimapCtx.beginPath();
        minimapCtx.arc(pt.x, pt.y, 3.2, 0, Math.PI * 2);
        minimapCtx.fillStyle = kart.color || '#38bdf8';
        minimapCtx.fill();
        minimapCtx.restore();
      });
    }

    // 7. Draw Player Kart with Directional Heading Arrow
    if (playerKart) {
      const px = playerKart.x ?? playerKart.position?.x ?? 0;
      const pz = playerKart.z ?? playerKart.position?.z ?? 0;
      const heading = playerKart.heading ?? playerKart.rotationY ?? playerKart.yaw ?? 0;
      const pt = worldToMinimap(px, pz);

      minimapCtx.save();
      minimapCtx.translate(pt.x, pt.y);
      // Forward vector in world: sin(heading) or cos(heading); draw bright pulsing beacon + pointer
      minimapCtx.beginPath();
      minimapCtx.arc(0, 0, 5.2, 0, Math.PI * 2);
      minimapCtx.fillStyle = '#facc15';
      minimapCtx.fill();
      minimapCtx.lineWidth = 2;
      minimapCtx.strokeStyle = '#0f172a';
      minimapCtx.stroke();

      const dx = Math.sin(heading);
      const dz = Math.cos(heading);
      if (dx !== 0 || dz !== 0) {
        minimapCtx.beginPath();
        minimapCtx.moveTo(0, 0);
        minimapCtx.lineTo(dx * 9, dz * 9);
        minimapCtx.strokeStyle = '#ffffff';
        minimapCtx.lineWidth = 2;
        minimapCtx.stroke();
      }
      minimapCtx.restore();
    }
  }

  // Initial static draw of the Avião minimap
  drawAviaoMinimap({ x: -1360, z: 66, heading: Math.PI / 2 }, []);

  // ============================================================================
  // LIVE ESPLANADA DOS MINISTÉRIOS RADAR (VIA N1 NORTH & VIA S1 SOUTH)
  // ============================================================================
  function updateMinistryRadar(px) {
    // Esplanada spans roughly X = 710 to X = 1345
    if (px >= 710 && px <= 1350) {
      ministryRadarEl.classList.add('visible');

      let closestNorth = null;
      let minNorthDist = Infinity;
      let closestSouth = null;
      let minSouthDist = Infinity;

      for (const m of MINISTRIES) {
        const d = Math.abs(m.x - px);
        if (m.side === 'north' && d < minNorthDist) {
          minNorthDist = d;
          closestNorth = m;
        } else if (m.side === 'south' && d < minSouthDist) {
          minSouthDist = d;
          closestSouth = m;
        }
      }

      if (closestNorth) {
        const icon = closestNorth.isPalace ? '🏛️' : '⬅️ N1:';
        minNorthEl.textContent = `${icon} ${closestNorth.name}`;
      }
      if (closestSouth) {
        const icon = closestSouth.isPalace ? '🏛️' : 'S1:';
        minSouthEl.textContent = `${icon} ${closestSouth.name} ➡️`;
      }
      radarXEl.textContent = px > 1255 ? 'Palácios Cívicos' : `${closestNorth?.code || ''} / ${closestSouth?.code || ''}`;
    } else {
      ministryRadarEl.classList.remove('visible');
    }
  }

  // ============================================================================
  // PUBLIC API RETURNED TO MAIN GAME LOOP
  // ============================================================================
  return {
    root,
    state,

    /**
     * Main frame update method called by main.js
     */
    update(telemetry = {}) {
      const player = telemetry.playerKart || telemetry.player || telemetry;
      const px = player.x ?? player.position?.x ?? 0;
      const pz = player.z ?? player.position?.z ?? 0;
      const speedKmh = Math.round(Math.abs(telemetry.speedKmh ?? player.speedKmh ?? (player.speed ? player.speed * 3.6 : 0)));

      // 1. Speedometer, Gear & RPM Bar
      speedValEl.textContent = String(speedKmh);
      const gear = speedKmh < 45 ? '1ª' : speedKmh < 95 ? '2ª' : speedKmh < 145 ? '3ª' : speedKmh < 190 ? '4ª' : '5ª TURBO';
      gearValEl.textContent = gear;

      const rpmPct = Math.min(100, Math.round((speedKmh / 210) * 100));
      rpmBarEl.style.width = `${rpmPct}%`;
      rpmLabelEl.textContent = speedKmh > 175 ? 'MAX NITRO!' : `${Math.round(1200 + rpmPct * 68)} RPM`;

      // 2. Drift Mini-Turbo Charge Bar
      const driftCharge = telemetry.driftCharge ?? player.driftCharge ?? player.driftLevel ?? 0;
      const driftNorm = driftCharge <= 1 ? driftCharge * 100 : Math.min(100, driftCharge * 33.3);
      driftBarEl.style.width = `${Math.max(0, Math.min(100, driftNorm))}%`;
      if (driftNorm >= 90) {
        driftLabelEl.textContent = '🟣 ULTRA TURBO!';
      } else if (driftNorm >= 55) {
        driftLabelEl.textContent = '🟠 SUPER TURBO!';
      } else if (driftNorm >= 20) {
        driftLabelEl.textContent = '🔵 MINI-TURBO!';
      } else {
        driftLabelEl.textContent = 'SEGURE [SHIFT]';
      }

      // 3. Race Position, Lap Counter, Lap Timer & Via S1/N1 Direction
      const position = telemetry.position ?? telemetry.rank ?? player.rank ?? 1;
      const totalRacers = telemetry.totalRacers ?? 6;
      posEl.innerHTML = `${position}º<span style="font-size:14px;color:#94a3b8;">/${totalRacers}</span>`;

      const lap = telemetry.lap ?? player.lap ?? 1;
      const totalLaps = telemetry.totalLaps ?? 3;
      lapEl.textContent = state.mode === 'cruise' ? 'LIVRE' : `${Math.min(lap, totalLaps)} / ${totalLaps}`;

      const timeMs = telemetry.raceTimeMs ?? telemetry.raceTime ?? telemetry.lapTime ?? 0;
      timerEl.textContent = formatTimeMs(timeMs);

      senseEl.textContent = pz >= 0 ? 'Via S1 ➔ Congresso' : 'Via N1 ➔ Rodoferroviária';
      senseEl.style.color = pz >= 0 ? '#facc15' : '#38bdf8';

      // 4. Item Slot Sync (if not currently spinning roulette)
      const heldItemId = telemetry.currentItem ?? player.currentItem ?? player.heldItem ?? null;
      if (!state.rouletteSpinning && heldItemId !== state.currentItem) {
        this.setItem(heldItemId);
      }

      // 5. Nearest Landmark Detection & Architectural Guide Update
      let activeLm = telemetry.nearestLandmark || telemetry.currentLandmark || null;
      if (!activeLm) {
        let bestDist = Infinity;
        for (const lm of LANDMARKS) {
          const dx = lm.position.x - px;
          const dz = lm.position.z - pz;
          const dist = Math.hypot(dx, dz);
          if (dist < (lm.triggerRadius || 160) * 1.35 && dist < bestDist) {
            bestDist = dist;
            activeLm = lm;
          }
        }
      }
      if (activeLm && activeLm.id !== state.activeLandmarkId) {
        state.activeLandmarkId = activeLm.id;
        updateGuideCard(activeLm);
        if (callbacks.onLandmarkDiscovered) callbacks.onLandmarkDiscovered(activeLm);
      }

      // 6. Live Esplanada dos Ministérios Radar
      updateMinistryRadar(px);

      // 7. Redraw Interactive "Avião de Brasília" Minimap
      const aiList = telemetry.aiKarts || telemetry.opponents || telemetry.karts?.filter(k => k !== player) || [];
      drawAviaoMinimap(player, aiList);
    },

    /**
     * Trigger animated Mario Kart item roulette slot spin when picking up an item box
     */
    triggerItemRoulette(finalItemId, durationMs = 1100) {
      const items = Object.values(ITEM_CATALOG);
      state.rouletteSpinning = true;
      if (state.rouletteTimer) clearInterval(state.rouletteTimer);

      let ticks = 0;
      state.rouletteTimer = setInterval(() => {
        const sample = items[ticks % items.length];
        itemIconEl.textContent = sample.emoji;
        itemNameEl.textContent = 'Sorteando Poder...';
        itemDescEl.textContent = sample.name;
        ticks++;
      }, 75);

      setTimeout(() => {
        if (state.rouletteTimer) clearInterval(state.rouletteTimer);
        state.rouletteSpinning = false;
        this.setItem(finalItemId);
      }, durationMs);
    },

    /**
     * Set or clear the player's currently held power-up item
     */
    setItem(itemId) {
      state.currentItem = itemId || null;
      if (!itemId) {
        itemIconEl.textContent = '🎲';
        itemNameEl.textContent = 'Caixa de Item do Eixo';
        itemDescEl.textContent = 'Passe nos cubos dourados na pista!';
        return;
      }
      const key = typeof itemId === 'object' ? itemId.id : String(itemId);
      const item = ITEM_CATALOG[key] || {
        name: typeof itemId === 'object' ? itemId.name : key,
        emoji: typeof itemId === 'object' ? itemId.emoji : '⚡',
        desc: 'Pressione [E] ou clique para ativar!'
      };
      itemIconEl.textContent = item.emoji || '⚡';
      itemNameEl.textContent = item.name;
      itemDescEl.textContent = item.desc;
    },

    /**
     * Show 3-2-1-LARGADA! or Lap Banner in center screen
     */
    showBanner(text, durationMs = 1200) {
      if (!text) {
        countdownEl.classList.remove('show');
        return;
      }
      countdownEl.textContent = text;
      countdownEl.classList.add('show');
      if (durationMs > 0) {
        setTimeout(() => {
          if (countdownEl.textContent === text) {
            countdownEl.classList.remove('show');
          }
        }, durationMs);
      }
    },

    setCountdown(text) {
      this.showBanner(text, 950);
    },

    setLandmark(landmarkOrId) {
      const lm = typeof landmarkOrId === 'string'
        ? LANDMARKS.find(l => l.id === landmarkOrId)
        : landmarkOrId;
      if (lm) selectLandmark(lm, false);
    },

    setMode(mode) {
      setMode(mode, false);
    },

    setAutopilot(enabled) {
      setAutopilot(enabled, false);
    },

    setCameraMode(camMode) {
      setCameraMode(camMode, false);
    },

    setTimeOfDay(tod) {
      setTimeOfDay(tod, false);
    },

    openGarageModal() {
      garageModal.classList.remove('hidden');
    },

    closeGarageModal() {
      garageModal.classList.add('hidden');
    },

    /**
     * Show Finish Podium Modal at the end of a 3-Lap Grand Prix
     */
    showPodium(standings = []) {
      podiumListEl.innerHTML = '';
      const list = Array.isArray(standings) && standings.length
        ? standings
        : roster.map((r, i) => ({ name: r.name, emoji: r.emoji, position: i + 1, isPlayer: i === 0 }));

      const playerEntry = list.find(s => s.isPlayer) || list[0];
      const pos = playerEntry?.position || 1;
      podiumTitleEl.textContent = pos === 1
        ? '🥇 1º Lugar! Campeão do Eixo Monumental!'
        : `🏁 Fim de Prova! Você chegou em ${pos}º Lugar!`;

      list.slice(0, 6).forEach((entry, idx) => {
        const medals = ['🥇', '🥈', '🥉', '4º', '5º', '6º'];
        const row = document.createElement('div');
        row.style.cssText = `
          display:flex;align-items:center;justify-content:space-between;
          padding:9px 14px;border-radius:12px;
          background:${entry.isPlayer ? 'rgba(250,204,21,0.18)' : 'rgba(255,255,255,0.05)'};
          border:1px solid ${entry.isPlayer ? '#facc15' : 'rgba(255,255,255,0.1)'};
        `;
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;font-weight:800;">
            <span style="font-size:18px;">${medals[idx] || `${idx + 1}º`}</span>
            <span>${entry.emoji || '🏎️'} ${entry.name || `Piloto ${idx + 1}`}</span>
          </div>
          <span style="font-size:12px;color:#fde047;font-weight:700;">
            ${entry.time ? formatTimeMs(entry.time) : (entry.isPlayer ? 'VOCÊ' : 'IA')}
          </span>
        `;
        podiumListEl.appendChild(row);
      });

      podiumModal.classList.remove('hidden');
    },

    hidePodium() {
      podiumModal.classList.add('hidden');
    }
  };
}

export class GameUI {
  constructor(callbacks = {}) {
    Object.assign(this, createGameUI(callbacks));
  }
}

export default createGameUI;
