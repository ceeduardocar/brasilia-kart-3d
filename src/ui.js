/**
 * Brasília Kart 3D — Eixo Monumental Edition
 * Clean, High-Fidelity, Mobile-First UI & HUD System
 * Designed specifically for unpolluted 3D visibility on Android, iPhone/iPad & PC.
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
    desc: 'Explosão tripla de velocidade!',
    color: '#f59e0b'
  },
  jato_fonte: {
    id: 'jato_fonte',
    name: 'Jato da Fonte da Torre',
    emoji: '💦',
    desc: 'Disparo teleguiado sob pressão!',
    color: '#38bdf8'
  },
  pequi_dourado: {
    id: 'pequi_dourado',
    name: 'Pequi Dourado do Cerrado',
    emoji: '🌟',
    desc: 'Invencibilidade Estelar!',
    color: '#facc15'
  },
  casca_pequi: {
    id: 'casca_pequi',
    name: 'Casca de Pequi',
    emoji: '🍋',
    desc: 'Armadilha na pista!',
    color: '#84cc16'
  },
  sirene_ministerial: {
    id: 'sirene_ministerial',
    name: 'Sirene Ministerial',
    emoji: '🚨',
    desc: 'Onda de choque cívica!',
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
  const roster = Array.isArray(callbacks.roster) && callbacks.roster.length
    ? callbacks.roster
    : Array.isArray(callbacks.kartRoster) && callbacks.kartRoster.length
    ? callbacks.kartRoster
    : DEFAULT_KART_ROSTER;

  const state = {
    mode: callbacks.initialMode || 'race', // 'race' | 'cruise'
    autopilot: Boolean(callbacks.initialAutopilot),
    cameraMode: callbacks.initialCamera || 'chase', // 'chase' | 'convertible' | 'cockpit' | 'helicopter' | 'monument'
    timeOfDay: callbacks.initialTimeOfDay || 'day', // 'day' | 'sunset' | 'night'
    selectedDriverId: roster[0].id,
    activeLandmarkId: LANDMARKS[0].id,
    currentItem: null,
    rouletteSpinning: false,
    rouletteTimer: null,
    musicOn: false,
    sfxMuted: false,
    labels3dOn: true,
    minimapModalOpen: false,
    menuModalOpen: false,
    guideCardExpanded: false
  };

  // Inject Clean Modernist CSS
  if (!document.getElementById('bsb-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'bsb-ui-styles';
    style.textContent = `
      #bsb-hud-root {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 20;
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        color: #f8fafc;
        overflow: hidden;
      }
      .bsb-glass {
        background: rgba(10, 16, 29, 0.78);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      }
      .bsb-interactive {
        pointer-events: auto;
      }

      /* TOP BAR (DESKTOP) */
      .bsb-topbar {
        position: absolute;
        top: 10px;
        left: 14px;
        right: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        z-index: 30;
      }
      .bsb-pill-group {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 6px;
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
        transition: all 0.15s ease;
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
        box-shadow: 0 2px 10px rgba(250, 204, 21, 0.4);
      }
      .bsb-pill-btn.autopilot-on {
        background: linear-gradient(135deg, #22c55e, #10b981);
        color: #052e16;
      }

      /* MOBILE CLEAN TOP BAR (Hidden on desktop, shown on mobile) */
      .bsb-mobile-topbar {
        display: none;
        position: absolute;
        top: 8px;
        left: 10px;
        right: 10px;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        z-index: 32;
      }
      .bsb-mobile-btn {
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(10, 16, 29, 0.82);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: #f8fafc;
        font-family: inherit;
        font-size: 12px;
        font-weight: 800;
        padding: 6px 11px;
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }
      .bsb-mobile-btn:active {
        background: rgba(250, 204, 21, 0.25);
        border-color: #facc15;
      }

      /* LEFT COLUMN: ITEM + RACE TELEMETRY */
      .bsb-left-hud {
        position: absolute;
        top: 62px;
        left: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 25;
      }
      .bsb-item-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 16px;
        min-width: 220px;
        cursor: pointer;
      }
      .bsb-item-slot-box {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        background: radial-gradient(circle at 30% 30%, rgba(250, 204, 21, 0.28), rgba(15, 23, 42, 0.9));
        border: 2px solid rgba(250, 204, 21, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      .bsb-race-stats {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 12px;
        border-radius: 14px;
      }
      .bsb-pos-badge {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 22px;
        font-weight: 900;
        color: #facc15;
      }
      .bsb-stat-col {
        display: flex;
        flex-direction: column;
        font-size: 10px;
        color: #94a3b8;
        font-weight: 700;
      }
      .bsb-stat-val {
        font-size: 13px;
        color: #f8fafc;
        font-weight: 800;
      }

      /* TOURIST GUIDE ARCHITECTURAL TOAST / CARD */
      .bsb-guide-card {
        position: absolute;
        top: 62px;
        right: 14px;
        width: min(360px, calc(100vw - 28px));
        border-radius: 18px;
        padding: 12px 14px;
        z-index: 26;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .bsb-guide-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .bsb-unesco-badge {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(250, 204, 21, 0.18);
        color: #fde047;
        border: 1px solid rgba(250, 204, 21, 0.4);
      }
      .bsb-guide-title {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
        margin: 2px 0;
      }
      .bsb-guide-meta {
        font-size: 11.5px;
        font-weight: 700;
        color: #38bdf8;
        margin-bottom: 4px;
      }
      .bsb-guide-sub {
        font-size: 11.5px;
        font-weight: 600;
        color: #fde047;
        margin-bottom: 4px;
      }
      .bsb-guide-desc {
        font-size: 11px;
        line-height: 1.4;
        color: #cbd5e1;
        margin: 0;
      }
      .bsb-ministry-radar {
        margin-top: 8px;
        padding: 6px 8px;
        border-radius: 10px;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(34, 197, 94, 0.45);
        display: none;
        flex-direction: column;
        gap: 3px;
      }
      .bsb-ministry-radar.visible {
        display: flex;
      }
      .bsb-radar-label {
        font-size: 9.5px;
        font-weight: 800;
        color: #4ade80;
        display: flex;
        justify-content: space-between;
      }
      .bsb-radar-row {
        font-size: 11px;
        font-weight: 700;
        color: #f8fafc;
        display: flex;
        justify-content: space-between;
      }

      /* CENTER COUNTDOWN / BANNER */
      .bsb-center-banner {
        position: absolute;
        top: 22%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
        z-index: 35;
      }
      .bsb-countdown-text {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 54px;
        font-weight: 900;
        color: #facc15;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 20px rgba(250, 204, 21, 0.65);
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .bsb-countdown-text.show {
        opacity: 1;
        transform: scale(1.05);
      }

      /* BOTTOM-LEFT SPEEDOMETER */
      .bsb-speedo-panel {
        position: absolute;
        bottom: 58px;
        left: 14px;
        padding: 10px 14px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 25;
      }
      .bsb-speed-readout {
        display: flex;
        flex-direction: column;
        min-width: 82px;
      }
      .bsb-speed-num {
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 34px;
        font-weight: 900;
        line-height: 0.95;
        color: #ffffff;
      }
      .bsb-speed-unit {
        font-size: 10px;
        font-weight: 700;
        color: #94a3b8;
        margin-top: 2px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .bsb-gear-badge {
        background: rgba(250, 204, 21, 0.25);
        color: #facc15;
        padding: 1px 5px;
        border-radius: 5px;
        font-weight: 800;
      }
      .bsb-bars-col {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-width: 110px;
      }
      .bsb-bar-track {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        overflow: hidden;
      }
      .bsb-bar-fill {
        height: 100%;
        width: 0%;
        border-radius: 999px;
      }
      .bsb-nitro-btn {
        border: none;
        border-radius: 12px;
        padding: 7px 11px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        background: linear-gradient(135deg, #f97316, #ef4444);
        color: #ffffff;
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
      }

      /* BOTTOM-RIGHT INTERACTIVE AVIÃO MINIMAP */
      .bsb-minimap-card {
        position: absolute;
        bottom: 58px;
        right: 14px;
        width: 290px;
        border-radius: 18px;
        padding: 8px 10px;
        z-index: 25;
      }
      .bsb-minimap-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 10.5px;
        font-weight: 800;
        color: #fde047;
        margin-bottom: 5px;
      }
      .bsb-minimap-canvas-wrap {
        width: 100%;
        height: 138px;
        border-radius: 12px;
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
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 8px;
        overflow-x: auto;
        scrollbar-width: none;
        z-index: 28;
      }
      .bsb-roteiro-bar::-webkit-scrollbar {
        display: none;
      }
      .bsb-roteiro-label {
        font-size: 10.5px;
        font-weight: 800;
        color: #facc15;
        white-space: nowrap;
      }
      .bsb-stop-chip {
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.06);
        color: #e2e8f0;
        font-family: inherit;
        font-size: 10.5px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        cursor: pointer;
        white-space: nowrap;
      }
      .bsb-stop-chip.active {
        background: linear-gradient(135deg, #facc15, #f59e0b);
        color: #0f172a;
        font-weight: 800;
      }

      /* TOUCH CONTROLS (ANDROID / IPHONE) */
      .bsb-mobile-controls {
        display: none;
        position: fixed;
        bottom: 18px;
        left: 12px;
        right: 12px;
        align-items: flex-end;
        justify-content: space-between;
        pointer-events: none;
        z-index: 40;
      }
      .bsb-mobile-cluster {
        display: flex;
        gap: 12px;
        pointer-events: auto;
      }
      .bsb-touch-btn {
        width: 62px;
        height: 62px;
        border-radius: 20px;
        border: 2px solid rgba(255, 255, 255, 0.25);
        background: rgba(10, 16, 29, 0.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #f8fafc;
        font-family: inherit;
        font-size: 22px;
        font-weight: 900;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
      }
      .bsb-touch-btn span {
        font-size: 9px;
        font-weight: 800;
        color: #facc15;
      }
      .bsb-touch-btn:active,
      .bsb-touch-btn.pressed {
        transform: scale(0.92);
        background: rgba(250, 204, 21, 0.35);
        border-color: #facc15;
      }
      .bsb-touch-gas {
        width: 70px;
        height: 70px;
        border-color: rgba(34, 197, 94, 0.85);
        background: linear-gradient(145deg, rgba(22, 163, 74, 0.8), rgba(15, 23, 42, 0.85));
      }
      .bsb-touch-drift {
        border-color: rgba(56, 189, 248, 0.85);
        background: linear-gradient(145deg, rgba(2, 132, 199, 0.75), rgba(15, 23, 42, 0.85));
      }
      .bsb-touch-item {
        width: 58px;
        height: 58px;
        border-color: rgba(250, 204, 21, 0.85);
        background: linear-gradient(145deg, rgba(245, 158, 11, 0.85), rgba(15, 23, 42, 0.85));
        margin-bottom: 8px;
      }

      /* MODALS (GARAGE, SETTINGS MENU, MINIMAP POPUP, PODIUM) */
      .bsb-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(4, 9, 20, 0.82);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        z-index: 60;
      }
      .bsb-modal-backdrop.hidden {
        display: none;
      }
      .bsb-modal-box {
        width: min(720px, 94vw);
        max-height: 88vh;
        overflow-y: auto;
        border-radius: 22px;
        padding: 20px;
        background: linear-gradient(160deg, rgba(15, 23, 42, 0.96), rgba(8, 14, 28, 0.98));
        border: 1px solid rgba(250, 204, 21, 0.35);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75);
      }
      .bsb-roster-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
        margin: 12px 0 16px;
      }
      .bsb-driver-card {
        border-radius: 14px;
        padding: 9px 11px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .bsb-driver-card.selected {
        border-color: #facc15;
        background: rgba(250, 204, 21, 0.15);
      }
      .bsb-cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
      }
      .bsb-cta-btn {
        border: none;
        border-radius: 12px;
        padding: 10px 18px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
      }
      .bsb-cta-primary {
        background: linear-gradient(135deg, #facc15, #f59e0b);
        color: #0f172a;
      }
      .bsb-cta-secondary {
        background: linear-gradient(135deg, #0ea5e9, #2563eb);
        color: #ffffff;
      }

      /* ==================================================================== */
      /* MOBILE SPECIFIC OVERRIDES (SCREEN <= 860px OR TOUCH DEVICES)        */
      /* ==================================================================== */
      @media (max-width: 860px), (max-height: 520px) {
        .bsb-topbar {
          display: none; /* Hide heavy multi-row buttons on mobile */
        }
        .bsb-mobile-topbar {
          display: flex; /* Show slim 1-line bar */
        }
        .bsb-roteiro-bar {
          display: none; /* Hide bottom landmark strip from main screen (available in Menu/Map) */
        }
        .bsb-left-hud {
          top: 48px;
          left: 10px;
        }
        .bsb-item-card {
          display: none; /* Hide large desktop item card on mobile */
        }
        .bsb-race-stats {
          padding: 4px 9px;
          border-radius: 10px;
        }
        .bsb-pos-badge {
          font-size: 18px;
        }
        .bsb-stat-col span:first-child {
          display: none; /* Hide labels, keep values compact */
        }
        .bsb-stat-val {
          font-size: 11px;
        }

        /* Compact Landmark Toast on Mobile (Never blocks view!) */
        .bsb-guide-card {
          top: 48px;
          right: 10px;
          left: auto;
          width: auto;
          max-width: 60vw;
          padding: 6px 10px;
          border-radius: 999px;
          cursor: pointer;
        }
        .bsb-guide-header,
        .bsb-guide-sub,
        .bsb-guide-desc,
        .bsb-ministry-radar {
          display: none;
        }
        .bsb-guide-title {
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bsb-guide-meta {
          display: none;
        }

        /* Speedometer on mobile: clean pill centered at bottom */
        .bsb-speedo-panel {
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(10, 16, 29, 0.75);
          gap: 8px;
        }
        .bsb-speed-readout {
          min-width: 58px;
        }
        .bsb-speed-num {
          font-size: 24px;
        }
        .bsb-bars-col {
          display: none;
        }
        .bsb-nitro-btn {
          display: none;
        }

        /* Minimap on mobile: hidden by default, pops up on demand */
        .bsb-minimap-card:not(.mobile-open) {
          display: none;
        }
        .bsb-minimap-card.mobile-open {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(340px, 92vw);
          bottom: auto;
          right: auto;
          z-index: 55;
          padding: 12px;
        }

        /* Show Touch Gamepad */
        .bsb-mobile-controls {
          display: flex;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create Root HUD Container
  let root = document.getElementById('bsb-hud-root');
  if (root) root.remove();
  root = document.createElement('div');
  root.id = 'bsb-hud-root';
  document.body.appendChild(root);

  root.innerHTML = `
    <!-- DESKTOP TOP BAR -->
    <header class="bsb-topbar">
      <div class="bsb-pill-group bsb-glass bsb-interactive">
        <button class="bsb-pill-btn active" data-mode="race">🏁 Corrida GP</button>
        <button class="bsb-pill-btn" data-mode="cruise">🏛️ Passeio Livre</button>
        <button class="bsb-pill-btn" id="bsb-btn-autopilot">🤖 Piloto Automático</button>
        <button class="bsb-pill-btn" id="bsb-btn-garage">🏎️ Pilotos & Karts</button>
      </div>

      <div class="bsb-pill-group bsb-glass bsb-interactive">
        <button class="bsb-pill-btn active" data-cam="chase">🏎️ Kart</button>
        <button class="bsb-pill-btn" data-cam="convertible">🚘 Passeio 360°</button>
        <button class="bsb-pill-btn" data-cam="cockpit">🕶️ Cockpit</button>
        <button class="bsb-pill-btn" data-cam="helicopter">🚁 Mapa 3D</button>
        <button class="bsb-pill-btn" data-cam="monument">📸 Mirante</button>
      </div>

      <div class="bsb-pill-group bsb-glass bsb-interactive">
        <button class="bsb-pill-btn active" id="bsb-btn-labels3d">📍 Placas 3D: ON</button>
        <button class="bsb-pill-btn active" data-time="day">☀️ Sol</button>
        <button class="bsb-pill-btn" data-time="sunset">🌅 Pôr do Sol</button>
        <button class="bsb-pill-btn" data-time="night">🌙 Noite</button>
        <button class="bsb-pill-btn" id="bsb-btn-music">🎵 Bossa: OFF</button>
        <button class="bsb-pill-btn" id="bsb-btn-sfx">🔊 SFX</button>
      </div>
    </header>

    <!-- MOBILE SLIM 1-LINE TOP BAR -->
    <header class="bsb-mobile-topbar bsb-interactive">
      <div style="display:flex;gap:6px;">
        <button class="bsb-mobile-btn" id="bsb-mob-mode">🏁 GP</button>
        <button class="bsb-mobile-btn" id="bsb-mob-cam">🏎️ Cam</button>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="bsb-mobile-btn" id="bsb-mob-map">🗺️ Mapa</button>
        <button class="bsb-mobile-btn" id="bsb-mob-menu" style="background:#facc15;color:#0f172a;">⚙️ Menu</button>
      </div>
    </header>

    <!-- LEFT HUD: TELEMETRY & DESKTOP ITEM CARD -->
    <aside class="bsb-left-hud">
      <div class="bsb-item-card bsb-glass bsb-interactive" id="bsb-item-card" title="Clique ou aperte [E] para usar o poder!">
        <div class="bsb-item-slot-box" id="bsb-item-icon">🎲</div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:10px;font-weight:800;color:#facc15;">PODER • [E]</span>
          <strong style="font-size:13px;color:#fff;" id="bsb-item-name">Caixa de Item</strong>
        </div>
      </div>

      <div class="bsb-race-stats bsb-glass">
        <div class="bsb-pos-badge" id="bsb-race-pos">1º</div>
        <div class="bsb-stat-col">
          <span>VOLTA</span>
          <span class="bsb-stat-val" id="bsb-race-lap">1/3</span>
        </div>
        <div class="bsb-stat-col">
          <span>TEMPO</span>
          <span class="bsb-stat-val" id="bsb-race-timer">00:00.0</span>
        </div>
      </div>
    </aside>

    <!-- TOURIST GUIDE CARD / MOBILE SLIM TOAST -->
    <section class="bsb-guide-card bsb-glass bsb-interactive" id="bsb-guide-card">
      <div class="bsb-guide-header">
        <span class="bsb-unesco-badge">PATRIMÔNIO UNESCO</span>
        <span style="font-size:10px;color:#94a3b8;" id="bsb-guide-index">1/11</span>
      </div>
      <h2 class="bsb-guide-title" id="bsb-guide-title">Eixo Monumental</h2>
      <div class="bsb-guide-meta" id="bsb-guide-meta">Lúcio Costa & Oscar Niemeyer</div>
      <div class="bsb-guide-sub" id="bsb-guide-sub">Plano Piloto</div>
      <p class="bsb-guide-desc" id="bsb-guide-desc"></p>

      <div class="bsb-ministry-radar" id="bsb-ministry-radar">
        <div class="bsb-radar-label">
          <span>RADAR DOS MINISTÉRIOS</span>
          <span id="bsb-radar-x">Esplanada</span>
        </div>
        <div class="bsb-radar-row">
          <span id="bsb-min-north">⬅️ N1</span>
          <span id="bsb-min-south">S1 ➡️</span>
        </div>
      </div>
    </section>

    <!-- CENTER BANNER -->
    <div class="bsb-center-banner">
      <div class="bsb-countdown-text" id="bsb-countdown-text"></div>
    </div>

    <!-- SPEEDOMETER -->
    <section class="bsb-speedo-panel bsb-glass bsb-interactive">
      <div class="bsb-speed-readout">
        <div class="bsb-speed-num" id="bsb-speed-val">0</div>
        <div class="bsb-speed-unit">
          <span>KM/H</span>
          <span class="bsb-gear-badge" id="bsb-gear-val">1ª</span>
        </div>
      </div>

      <div class="bsb-bars-col">
        <div class="bsb-bar-track">
          <div class="bsb-bar-fill" id="bsb-drift-bar" style="background:linear-gradient(90deg,#38bdf8,#a855f7);"></div>
        </div>
      </div>

      <button class="bsb-nitro-btn" id="bsb-btn-nitro">🔥 NITRO</button>
    </section>

    <!-- INTERACTIVE AVIÃO MINIMAP -->
    <section class="bsb-minimap-card bsb-glass bsb-interactive" id="bsb-minimap-card">
      <div class="bsb-minimap-header">
        <span>✈️ MAPA DO AVIÃO (PLANO PILOTO)</span>
        <button id="bsb-map-close" style="border:none;background:transparent;color:#facc15;font-weight:900;cursor:pointer;">✕</button>
      </div>
      <div class="bsb-minimap-canvas-wrap">
        <canvas id="bsb-minimap-canvas" width="290" height="138" style="width:100%;height:100%;display:block;"></canvas>
      </div>
    </section>

    <!-- MOBILE TOUCH GAMEPAD -->
    <div class="bsb-mobile-controls" id="bsb-mobile-controls">
      <div class="bsb-mobile-cluster">
        <button class="bsb-touch-btn" data-touch-ctrl="left">◀<span>ESQ</span></button>
        <button class="bsb-touch-btn" data-touch-ctrl="right">▶<span>DIR</span></button>
      </div>

      <div style="display:flex;flex-direction:column;align-items:flex-end;">
        <button class="bsb-touch-btn bsb-touch-item" id="bsb-touch-use-item">
          <span id="bsb-touch-item-icon" style="font-size:22px;color:#fff;">🎲</span>
          <span>PODER</span>
        </button>
        <div class="bsb-mobile-cluster">
          <button class="bsb-touch-btn" data-touch-ctrl="down" style="width:52px;height:52px;">⏪<span>RÉ</span></button>
          <button class="bsb-touch-btn bsb-touch-drift" data-touch-ctrl="drift">⚡<span>DRIFT</span></button>
          <button class="bsb-touch-btn bsb-touch-gas" data-touch-ctrl="up">🚀<span>ACELERA</span></button>
        </div>
      </div>
    </div>

    <!-- DESKTOP BOTTOM TELEPORT BAR -->
    <nav class="bsb-roteiro-bar bsb-glass bsb-interactive" id="bsb-roteiro-bar">
      <span class="bsb-roteiro-label">🧭 Roteiro 3D:</span>
    </nav>

    <!-- SETTINGS & GARAGE MODAL -->
    <div class="bsb-modal-backdrop bsb-interactive hidden" id="bsb-menu-modal">
      <div class="bsb-modal-box">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <h2 style="margin:0;font-size:20px;font-weight:900;color:#facc15;">⚙️ Menu Brasília 3D</h2>
          <button class="bsb-mobile-btn" id="bsb-menu-close">✕ Fechar</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Quick Toggles -->
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <button class="bsb-mobile-btn" id="bsb-menu-autopilot">🤖 Piloto Automático: OFF</button>
            <button class="bsb-mobile-btn" id="bsb-menu-labels3d">📍 Placas 3D: ON</button>
            <button class="bsb-mobile-btn" id="bsb-menu-music">🎵 Bossa Nova: OFF</button>
            <button class="bsb-mobile-btn" id="bsb-menu-sfx">🔊 SFX</button>
          </div>

          <!-- Time of Day -->
          <div>
            <span style="font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;">Clima do Cerrado</span>
            <div style="display:flex;gap:6px;margin-top:6px;">
              <button class="bsb-mobile-btn active" data-time="day">☀️ Sol</button>
              <button class="bsb-mobile-btn" data-time="sunset">🌅 Pôr do Sol</button>
              <button class="bsb-mobile-btn" data-time="night">🌙 Noite</button>
            </div>
          </div>

          <!-- Driver Selection -->
          <div>
            <span style="font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;">Escolha seu Piloto</span>
            <div class="bsb-roster-grid" id="bsb-menu-roster-grid"></div>
          </div>

          <!-- Landmark Teleport -->
          <div>
            <span style="font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;">Teletransporte Rápido pelo Eixo</span>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;" id="bsb-menu-landmark-chips"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- FINISH PODIUM MODAL -->
    <div class="bsb-modal-backdrop bsb-interactive hidden" id="bsb-podium-modal">
      <div class="bsb-modal-box" style="max-width:520px;text-align:center;">
        <span class="bsb-unesco-badge">🏆 FIM DE PROVA</span>
        <h1 style="margin:8px 0 4px;font-size:24px;font-weight:900;color:#facc15;" id="bsb-podium-title">
          Bandeirada no Congresso Nacional!
        </h1>
        <div id="bsb-podium-list" style="display:flex;flex-direction:column;gap:6px;margin:14px 0;text-align:left;"></div>
        <div class="bsb-cta-row" style="justify-content:center;">
          <button class="bsb-cta-btn bsb-cta-secondary" id="bsb-podium-cruise">🏛️ Passeio Turístico</button>
          <button class="bsb-cta-btn bsb-cta-primary" id="bsb-podium-restart">🏁 Nova Corrida</button>
        </div>
      </div>
    </div>
  `;

  // DOM Elements
  const modeBtns = Array.from(root.querySelectorAll('[data-mode]'));
  const camBtns = Array.from(root.querySelectorAll('[data-cam]'));
  const timeBtns = Array.from(root.querySelectorAll('[data-time]'));
  const autopilotBtn = root.querySelector('#bsb-btn-autopilot');
  const garageBtn = root.querySelector('#bsb-btn-garage');
  const musicBtn = root.querySelector('#bsb-btn-music');
  const sfxBtn = root.querySelector('#bsb-btn-sfx');
  const labels3dBtn = root.querySelector('#bsb-btn-labels3d');

  // Mobile Topbar Elements
  const mobModeBtn = root.querySelector('#bsb-mob-mode');
  const mobCamBtn = root.querySelector('#bsb-mob-cam');
  const mobMapBtn = root.querySelector('#bsb-mob-map');
  const mobMenuBtn = root.querySelector('#bsb-mob-menu');

  // Menu Modal Elements
  const menuModal = root.querySelector('#bsb-menu-modal');
  const menuCloseBtn = root.querySelector('#bsb-menu-close');
  const menuAutopilotBtn = root.querySelector('#bsb-menu-autopilot');
  const menuLabels3dBtn = root.querySelector('#bsb-menu-labels3d');
  const menuMusicBtn = root.querySelector('#bsb-menu-music');
  const menuSfxBtn = root.querySelector('#bsb-menu-sfx');
  const menuRosterGrid = root.querySelector('#bsb-menu-roster-grid');
  const menuLandmarkChips = root.querySelector('#bsb-menu-landmark-chips');

  // Minimap Elements
  const minimapCard = root.querySelector('#bsb-minimap-card');
  const mapCloseBtn = root.querySelector('#bsb-map-close');
  const minimapCanvas = root.querySelector('#bsb-minimap-canvas');
  const minimapCtx = minimapCanvas.getContext('2d');
  const roteiroBar = root.querySelector('#bsb-roteiro-bar');

  // HUD Status Elements
  const itemCard = root.querySelector('#bsb-item-card');
  const itemIconEl = root.querySelector('#bsb-item-icon');
  const itemNameEl = root.querySelector('#bsb-item-name');
  const touchUseItemBtn = root.querySelector('#bsb-touch-use-item');
  const touchItemIcon = root.querySelector('#bsb-touch-item-icon');

  const posEl = root.querySelector('#bsb-race-pos');
  const lapEl = root.querySelector('#bsb-race-lap');
  const timerEl = root.querySelector('#bsb-race-timer');

  const guideCard = root.querySelector('#bsb-guide-card');
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
  const driftBarEl = root.querySelector('#bsb-drift-bar');
  const nitroBtn = root.querySelector('#bsb-btn-nitro');

  const podiumModal = root.querySelector('#bsb-podium-modal');
  const podiumTitleEl = root.querySelector('#bsb-podium-title');
  const podiumListEl = root.querySelector('#bsb-podium-list');
  const podiumCruiseBtn = root.querySelector('#bsb-podium-cruise');
  const podiumRestartBtn = root.querySelector('#bsb-podium-restart');

  // Build Landmark Chips (for both Desktop Roteiro and Menu Modal)
  const stopChips = new Map();
  LANDMARKS.forEach((lm, idx) => {
    // Desktop chip
    const chip = document.createElement('button');
    chip.className = 'bsb-stop-chip';
    chip.dataset.landmarkId = lm.id;
    chip.innerHTML = `<span style="color:${lm.color};font-weight:900;">${idx + 1}.</span> ${lm.shortName || lm.name}`;
    chip.addEventListener('click', () => selectLandmark(lm, true));
    roteiroBar.appendChild(chip);
    stopChips.set(lm.id, chip);

    // Modal chip
    const modalChip = document.createElement('button');
    modalChip.className = 'bsb-mobile-btn';
    modalChip.innerHTML = `<span style="color:${lm.color};font-weight:900;">${idx + 1}.</span> ${lm.shortName || lm.name}`;
    modalChip.addEventListener('click', () => {
      selectLandmark(lm, true);
      menuModal.classList.add('hidden');
    });
    menuLandmarkChips.appendChild(modalChip);
  });

  // Build Roster Cards in Menu Modal
  function renderRosterCards() {
    menuRosterGrid.innerHTML = '';
    roster.forEach((driver) => {
      const card = document.createElement('div');
      card.className = `bsb-driver-card ${driver.id === state.selectedDriverId ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:20px;">${driver.emoji || '🏎️'}</span>
          <span style="width:12px;height:12px;border-radius:999px;background:${driver.color || '#facc15'};"></span>
        </div>
        <strong style="font-size:13px;color:#fff;">${driver.name}</strong>
      `;
      card.addEventListener('click', () => {
        state.selectedDriverId = driver.id;
        renderRosterCards();
        if (callbacks.onSelectDriver) callbacks.onSelectDriver(driver.id, driver);
      });
      menuRosterGrid.appendChild(card);
    });
  }
  renderRosterCards();

  function updateGuideCard(landmark) {
    if (!landmark) return;
    const idx = LANDMARKS.findIndex(l => l.id === landmark.id);
    guideIndexEl.textContent = idx >= 0 ? `${idx + 1}/11` : 'BSB';
    guideTitleEl.textContent = landmark.name;
    guideMetaEl.textContent = `${landmark.architect} (${landmark.year})`;
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
    }
  }
  updateGuideCard(LANDMARKS[0]);

  // Mode Switching
  function setMode(newMode, notify = true) {
    state.mode = newMode;
    modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === newMode));
    mobModeBtn.textContent = newMode === 'cruise' ? '🏛️ Passeio' : '🏁 GP';
    if (notify && callbacks.onModeChange) callbacks.onModeChange(newMode);
  }
  modeBtns.forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode, true)));
  mobModeBtn.addEventListener('click', () => setMode(state.mode === 'race' ? 'cruise' : 'race', true));

  // Camera Switching
  const CAM_MODES = ['chase', 'convertible', 'cockpit', 'helicopter', 'monument'];
  const CAM_LABELS = {
    chase: '🏎️ Kart',
    convertible: '🚘 360°',
    cockpit: '🕶️ Cockpit',
    helicopter: '🚁 Mapa',
    monument: '📸 Mirante'
  };
  function setCameraMode(camMode, notify = true) {
    state.cameraMode = camMode;
    camBtns.forEach(b => b.classList.toggle('active', b.dataset.cam === camMode));
    mobCamBtn.textContent = CAM_LABELS[camMode] || '🎥 Cam';
    if (notify && callbacks.onCameraChange) callbacks.onCameraChange(camMode);
  }
  camBtns.forEach(btn => btn.addEventListener('click', () => setCameraMode(btn.dataset.cam, true)));
  mobCamBtn.addEventListener('click', () => {
    const idx = CAM_MODES.indexOf(state.cameraMode);
    const next = CAM_MODES[(idx + 1) % CAM_MODES.length];
    setCameraMode(next, true);
  });

  // Time of Day
  function setTimeOfDay(tod, notify = true) {
    state.timeOfDay = tod;
    timeBtns.forEach(b => b.classList.toggle('active', b.dataset.time === tod));
    if (notify && callbacks.onTimeOfDayChange) callbacks.onTimeOfDayChange(tod);
  }
  timeBtns.forEach(btn => btn.addEventListener('click', () => setTimeOfDay(btn.dataset.time, true)));

  // Autopilot
  function setAutopilot(enabled, notify = true) {
    state.autopilot = Boolean(enabled);
    if (autopilotBtn) autopilotBtn.classList.toggle('autopilot-on', state.autopilot);
    menuAutopilotBtn.textContent = state.autopilot ? '🤖 Piloto Auto: ON' : '🤖 Piloto Auto: OFF';
    menuAutopilotBtn.classList.toggle('active', state.autopilot);
    if (notify && callbacks.onToggleAutopilot) callbacks.onToggleAutopilot(state.autopilot);
  }
  if (autopilotBtn) autopilotBtn.addEventListener('click', () => setAutopilot(!state.autopilot, true));
  menuAutopilotBtn.addEventListener('click', () => setAutopilot(!state.autopilot, true));

  // 3D Sky Labels Toggle
  function setLabels3D(enabled, notify = true) {
    state.labels3dOn = Boolean(enabled);
    const txt = state.labels3dOn ? '📍 Placas 3D: ON' : '📍 Placas 3D: OFF';
    if (labels3dBtn) {
      labels3dBtn.textContent = txt;
      labels3dBtn.classList.toggle('active', state.labels3dOn);
    }
    menuLabels3dBtn.textContent = txt;
    menuLabels3dBtn.classList.toggle('active', state.labels3dOn);
    if (notify && callbacks.onToggleLabels3D) callbacks.onToggleLabels3D(state.labels3dOn);
  }
  if (labels3dBtn) labels3dBtn.addEventListener('click', () => setLabels3D(!state.labels3dOn, true));
  menuLabels3dBtn.addEventListener('click', () => setLabels3D(!state.labels3dOn, true));

  // Audio Controls
  function toggleMusic() {
    let next = !state.musicOn;
    if (callbacks.onToggleMusic) {
      const res = callbacks.onToggleMusic();
      if (typeof res === 'boolean') next = res;
    }
    state.musicOn = next;
    const txt = state.musicOn ? '🎵 Bossa: ON' : '🎵 Bossa: OFF';
    if (musicBtn) {
      musicBtn.textContent = txt;
      musicBtn.classList.toggle('active', state.musicOn);
    }
    menuMusicBtn.textContent = txt;
    menuMusicBtn.classList.toggle('active', state.musicOn);
  }
  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);
  menuMusicBtn.addEventListener('click', toggleMusic);

  function toggleSfx() {
    let muted = !state.sfxMuted;
    if (callbacks.onToggleSfx) {
      const res = callbacks.onToggleSfx();
      if (typeof res === 'boolean') muted = res;
    }
    state.sfxMuted = muted;
    const txt = state.sfxMuted ? '🔇 Mudo' : '🔊 SFX';
    if (sfxBtn) sfxBtn.textContent = txt;
    menuSfxBtn.textContent = txt;
  }
  if (sfxBtn) sfxBtn.addEventListener('click', toggleSfx);
  menuSfxBtn.addEventListener('click', toggleSfx);

  // Modals & Menu Drawer
  mobMenuBtn.addEventListener('click', () => menuModal.classList.remove('hidden'));
  if (garageBtn) garageBtn.addEventListener('click', () => menuModal.classList.remove('hidden'));
  menuCloseBtn.addEventListener('click', () => menuModal.classList.add('hidden'));

  // Mobile Map Open / Close
  mobMapBtn.addEventListener('click', () => minimapCard.classList.toggle('mobile-open'));
  mapCloseBtn.addEventListener('click', () => minimapCard.classList.remove('mobile-open'));

  // Touch Guide card tap to toggle description
  guideCard.addEventListener('click', () => {
    state.guideCardExpanded = !state.guideCardExpanded;
    guideDescEl.style.display = state.guideCardExpanded ? 'block' : '';
  });

  // Touch Controls Event Wiring
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
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
  });

  // Item Use & Nitro
  itemCard.addEventListener('click', () => {
    if (callbacks.onUseItem) callbacks.onUseItem(state.currentItem);
  });
  touchUseItemBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (callbacks.onUseItem) callbacks.onUseItem(state.currentItem);
  });
  nitroBtn.addEventListener('click', () => {
    if (callbacks.onTriggerBoost) callbacks.onTriggerBoost();
  });

  // Podium Buttons
  podiumCruiseBtn.addEventListener('click', () => {
    podiumModal.classList.add('hidden');
    setMode('cruise', true);
  });
  podiumRestartBtn.addEventListener('click', () => {
    podiumModal.classList.add('hidden');
    setMode('race', true);
    if (callbacks.onRestartRace) callbacks.onRestartRace();
  });

  // Minimap World Coordinate Transform
  const MAP_W = minimapCanvas.width;
  const MAP_H = minimapCanvas.height;
  function worldToMinimap(wx, wz) {
    const nx = (wx - (-1650)) / (1680 - (-1650));
    const nz = (wz - (-480)) / (480 - (-480));
    return {
      x: 14 + nx * (MAP_W - 28),
      y: 12 + nz * (MAP_H - 24)
    };
  }

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
    if (bestLm && bestD2 <= 32 * 32) {
      selectLandmark(bestLm, true);
      minimapCard.classList.remove('mobile-open');
    }
  });

  function drawMinimap(playerKart, aiKarts = []) {
    minimapCtx.clearRect(0, 0, MAP_W, MAP_H);

    // 1. Lago Paranoá
    minimapCtx.save();
    minimapCtx.strokeStyle = 'rgba(14, 165, 233, 0.28)';
    minimapCtx.lineWidth = 8;
    minimapCtx.beginPath();
    minimapCtx.arc(MAP_W - 18, MAP_H / 2, 46, -Math.PI * 0.65, Math.PI * 0.65);
    minimapCtx.stroke();
    minimapCtx.restore();

    // 2. Lúcio Costa Avião Wings
    const rodoviariaPt = worldToMinimap(95, 0);
    minimapCtx.save();
    minimapCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    minimapCtx.lineWidth = 10;
    minimapCtx.lineCap = 'round';
    minimapCtx.beginPath();
    minimapCtx.moveTo(rodoviariaPt.x - 14, 8);
    minimapCtx.quadraticCurveTo(rodoviariaPt.x + 6, rodoviariaPt.y - 22, rodoviariaPt.x, rodoviariaPt.y);
    minimapCtx.quadraticCurveTo(rodoviariaPt.x + 6, rodoviariaPt.y + 22, rodoviariaPt.x - 14, MAP_H - 8);
    minimapCtx.stroke();
    minimapCtx.restore();

    // 3. Eixo Monumental Loop
    minimapCtx.save();
    minimapCtx.beginPath();
    TRACK_WAYPOINTS.forEach((wp, idx) => {
      const p = worldToMinimap(wp.x, wp.z);
      if (idx === 0) minimapCtx.moveTo(p.x, p.y);
      else minimapCtx.lineTo(p.x, p.y);
    });
    minimapCtx.closePath();
    minimapCtx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    minimapCtx.lineWidth = 2.6;
    minimapCtx.stroke();
    minimapCtx.restore();

    // 4. Landmarks Pins
    LANDMARKS.forEach((lm) => {
      const pt = worldToMinimap(lm.position.x, lm.position.z);
      const isCurrent = lm.id === state.activeLandmarkId;
      minimapCtx.beginPath();
      minimapCtx.arc(pt.x, pt.y, isCurrent ? 5 : 3, 0, Math.PI * 2);
      minimapCtx.fillStyle = lm.color || '#facc15';
      minimapCtx.fill();
    });

    // 5. Player Dot & Direction
    if (playerKart) {
      const px = playerKart.x ?? playerKart.position?.x ?? 0;
      const pz = playerKart.z ?? playerKart.position?.z ?? 0;
      const heading = playerKart.heading ?? playerKart.rotationY ?? 0;
      const pt = worldToMinimap(px, pz);

      minimapCtx.save();
      minimapCtx.translate(pt.x, pt.y);
      minimapCtx.beginPath();
      minimapCtx.arc(0, 0, 4.5, 0, Math.PI * 2);
      minimapCtx.fillStyle = '#facc15';
      minimapCtx.fill();
      minimapCtx.strokeStyle = '#0f172a';
      minimapCtx.lineWidth = 1.5;
      minimapCtx.stroke();

      const dx = Math.sin(heading);
      const dz = Math.cos(heading);
      if (dx !== 0 || dz !== 0) {
        minimapCtx.beginPath();
        minimapCtx.moveTo(0, 0);
        minimapCtx.lineTo(dx * 8, dz * 8);
        minimapCtx.strokeStyle = '#ffffff';
        minimapCtx.lineWidth = 2;
        minimapCtx.stroke();
      }
      minimapCtx.restore();
    }
  }

  function updateMinistryRadar(px) {
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
      if (closestNorth) minNorthEl.textContent = `⬅️ ${closestNorth.name}`;
      if (closestSouth) minSouthEl.textContent = `${closestSouth.name} ➡️`;
    } else {
      ministryRadarEl.classList.remove('visible');
    }
  }

  // Public Interface
  return {
    root,
    state,

    update(telemetry = {}) {
      const player = telemetry.playerKart || telemetry.player || telemetry;
      const px = player.x ?? player.position?.x ?? 0;
      const pz = player.z ?? player.position?.z ?? 0;
      const speedKmh = Math.round(Math.abs(telemetry.speedKmh ?? (player.speed ? player.speed * 3.6 : 0)));

      // Speedometer
      speedValEl.textContent = String(speedKmh);
      const gear = speedKmh < 45 ? '1ª' : speedKmh < 95 ? '2ª' : speedKmh < 145 ? '3ª' : speedKmh < 190 ? '4ª' : 'TURBO';
      gearValEl.textContent = gear;

      const driftCharge = telemetry.driftCharge ?? player.driftCharge ?? 0;
      const driftNorm = driftCharge <= 1 ? driftCharge * 100 : Math.min(100, driftCharge * 33.3);
      driftBarEl.style.width = `${Math.max(0, Math.min(100, driftNorm))}%`;

      // Position, Lap, Timer
      const position = telemetry.position ?? telemetry.rank ?? 1;
      const totalRacers = telemetry.totalRacers ?? 6;
      posEl.innerHTML = `${position}º<span style="font-size:11px;color:#94a3b8;">/${totalRacers}</span>`;

      const lap = telemetry.lap ?? 1;
      const totalLaps = telemetry.totalLaps ?? 3;
      lapEl.textContent = state.mode === 'cruise' ? 'LIVRE' : `${Math.min(lap, totalLaps)}/${totalLaps}`;

      const timeMs = telemetry.raceTimeMs ?? telemetry.raceTime ?? 0;
      timerEl.textContent = formatTimeMs(timeMs);

      // Held Item
      const heldItemId = telemetry.currentItem ?? player.heldItem?.id ?? null;
      if (!state.rouletteSpinning && heldItemId !== state.currentItem) {
        this.setItem(heldItemId);
      }

      // Landmark Detection (Update only when entering a new landmark radius)
      let activeLm = telemetry.nearestLandmark || null;
      if (!activeLm) {
        let bestDist = Infinity;
        for (const lm of LANDMARKS) {
          const dx = lm.position.x - px;
          const dz = lm.position.z - pz;
          const dist = Math.hypot(dx, dz);
          if (dist < (lm.triggerRadius || 150) * 1.2 && dist < bestDist) {
            bestDist = dist;
            activeLm = lm;
          }
        }
      }
      if (activeLm && activeLm.id !== state.activeLandmarkId) {
        state.activeLandmarkId = activeLm.id;
        updateGuideCard(activeLm);
      }

      updateMinistryRadar(px);
      drawMinimap(player, telemetry.aiKarts || []);
    },

    triggerItemRoulette(finalItemId, durationMs = 900) {
      const items = Object.values(ITEM_CATALOG);
      state.rouletteSpinning = true;
      if (state.rouletteTimer) clearInterval(state.rouletteTimer);

      let ticks = 0;
      state.rouletteTimer = setInterval(() => {
        const sample = items[ticks % items.length];
        itemIconEl.textContent = sample.emoji;
        touchItemIcon.textContent = sample.emoji;
        itemNameEl.textContent = 'Sorteando...';
        ticks++;
      }, 70);

      setTimeout(() => {
        if (state.rouletteTimer) clearInterval(state.rouletteTimer);
        state.rouletteSpinning = false;
        this.setItem(finalItemId);
      }, durationMs);
    },

    setItem(itemId) {
      state.currentItem = itemId || null;
      if (!itemId) {
        itemIconEl.textContent = '🎲';
        touchItemIcon.textContent = '🎲';
        itemNameEl.textContent = 'Caixa de Item';
        return;
      }
      const key = typeof itemId === 'object' ? itemId.id : String(itemId);
      const item = ITEM_CATALOG[key] || {
        name: key,
        emoji: '⚡'
      };
      itemIconEl.textContent = item.emoji || '⚡';
      touchItemIcon.textContent = item.emoji || '⚡';
      itemNameEl.textContent = item.name;
    },

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
      menuModal.classList.remove('hidden');
    },

    closeGarageModal() {
      menuModal.classList.add('hidden');
    },

    showPodium(standings = []) {
      podiumListEl.innerHTML = '';
      const list = Array.isArray(standings) && standings.length
        ? standings
        : roster.map((r, i) => ({ name: r.name, emoji: r.emoji, position: i + 1, isPlayer: i === 0 }));

      const playerEntry = list.find(s => s.isPlayer) || list[0];
      const pos = playerEntry?.position || 1;
      podiumTitleEl.textContent = pos === 1
        ? '🥇 1º Lugar! Campeão de Brasília!'
        : `🏁 Chegada em ${pos}º Lugar!`;

      list.slice(0, 6).forEach((entry, idx) => {
        const medals = ['🥇', '🥈', '🥉', '4º', '5º', '6º'];
        const row = document.createElement('div');
        row.style.cssText = `
          display:flex;align-items:center;justify-content:space-between;
          padding:6px 10px;border-radius:10px;
          background:${entry.isPlayer ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.05)'};
          border:1px solid ${entry.isPlayer ? '#facc15' : 'rgba(255,255,255,0.1)'};
          font-size:12px;
        `;
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;font-weight:800;">
            <span>${medals[idx] || `${idx + 1}º`}</span>
            <span>${entry.emoji || '🏎️'} ${entry.name || `Piloto ${idx + 1}`}</span>
          </div>
          <span style="color:#fde047;font-weight:700;">${entry.isPlayer ? 'VOCÊ' : 'IA'}</span>
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
