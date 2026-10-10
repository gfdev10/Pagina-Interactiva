/**
 * Componente ReinosList - Renderiza las tarjetas de Reinos y los botones de los 10 juegos
 */
import { reinosData } from '../data/reinosData.js';
import { gameManager } from '../games/gameManager.js';
import { stateManager } from '../core/state.js';

export function initReinosList() {
  const container = document.getElementById('reinos-section');
  if (!container) return;

  function render() {
    container.innerHTML = reinosData.map(reino => `
      <div class="bg-gradient-to-b ${reino.theme.gradient} border ${reino.theme.border} rounded-2xl p-5 flex flex-col justify-between ${reino.theme.hoverBorder} transition-all shadow-xl group">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold ${reino.theme.badgeText} tracking-wider uppercase ${reino.theme.badgeBg} px-2.5 py-1 rounded-md border ${reino.theme.badgeBorder}">
              ${reino.subtitle}
            </span>
            <i class="${reino.icon} ${reino.theme.badgeText} text-xl group-hover:scale-125 transition-transform"></i>
          </div>
          <div>
            <h3 class="font-cinzel text-2xl font-bold ${reino.theme.titleColor}">${reino.name}</h3>
            <p class="text-xs text-slate-400 mt-1">${reino.description}</p>
          </div>
          <div class="space-y-2 pt-2">
            ${reino.games.map(game => {
              const isCompleted = stateManager.isGameCompleted(game.id);
              return `
                <button data-game-id="${game.id}" class="btn-launch-game w-full text-left px-3 py-2 bg-slate-900/80 ${reino.theme.buttonHover} border ${reino.theme.buttonBorder} rounded-xl text-xs flex justify-between items-center text-slate-300 hover:text-white transition-colors">
                  <span>${game.title}</span>
                  <i id="badge-g${game.id}" class="${isCompleted ? 'fa-solid fa-circle-check text-amber-400' : 'fa-regular fa-circle text-slate-600'}"></i>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Attach click listeners to game buttons
    container.querySelectorAll('.btn-launch-game').forEach(btn => {
      btn.addEventListener('click', () => {
        const gameId = parseInt(btn.getAttribute('data-game-id'), 10);
        gameManager.launchGame(gameId);
      });
    });
  }

  function updateBadges(snapshot) {
    for (let i = 1; i <= snapshot.totalGames; i++) {
      const badge = container.querySelector(`#badge-g${i}`);
      if (badge) {
        if (snapshot.medals[i - 1]) {
          badge.className = 'fa-solid fa-circle-check text-amber-400';
        } else {
          badge.className = 'fa-regular fa-circle text-slate-600';
        }
      }
    }
  }

  // Subscribe to updates
  stateManager.subscribe(updateBadges);

  // Initial render
  render();
}
