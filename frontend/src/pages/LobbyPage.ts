import { AppState } from '../state/AppState.ts';
import { getOwner, startGame, getTournamentOwner, startTournament, getGameData, getTournamentData, getGamePlayers } from '../services/pong.service.ts';
import type { Page } from '../types/index.ts';

export class LobbyPage implements Page {
  private isOwner: boolean = false;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  render(): string {
    return `
      <div class="max-w-md mx-auto mt-20 text-center">
        <h1 class="text-4xl font-bold mb-8">Lobby</h1>
        <p class="text-xl mb-4">Game ID: <span class="text-primary font-bold">${AppState.gameId}</span></p>
        ${AppState.tournamentId ? `<p class="text-lg mb-4">Tournament ID: <span class="text-secondary font-bold">${AppState.tournamentId}</span></p>` : ''}
        <p id="opponent-info" class="text-lg mb-4 hidden">Opponent: <span id="opponent-name" class="text-green-400 font-bold"></span></p>
        <p id="status-msg" class="mb-8 text-gray-400">Waiting for players...</p>

        <button id="start-btn" class="btn-primary hidden">Start Game</button>
        <button id="back-btn" class="mt-4 text-gray-400 hover:text-white">Back to Menu</button>
      </div>
    `;
  }

  async mount(): Promise<void> {
    try {
      let isTournamentFinal = false;

      if (AppState.tournamentId) {
        const tournamentData = await getTournamentData(AppState.tournamentId);
        isTournamentFinal = AppState.gameId === tournamentData.game_3_id;
        const ownerId = await getTournamentOwner(AppState.tournamentId);
        this.isOwner = ownerId === AppState.userId;
      } else {
        const ownerId = await getOwner(AppState.gameId!);
        this.isOwner = ownerId === AppState.userId;
      }

      if (isTournamentFinal) {
        this.startPolling();
      } else if (this.isOwner) {
        const startBtn = document.getElementById('start-btn')!;
        startBtn.classList.remove('hidden');

        startBtn.addEventListener('click', async () => {
          try {
            if (AppState.tournamentId) {
              await startTournament(AppState.tournamentId);
            } else {
              await startGame(AppState.gameId!);
            }
            window.location.hash = '/game';
          } catch (error) {
            alert('Failed to start: ' + (error as Error).message);
          }
        });
      } else {
        this.startPolling();
      }
    } catch (error) {
      console.error('Error in lobby:', error);
      alert('Error loading lobby: ' + (error as Error).message);
    }

    document.getElementById('back-btn')!.addEventListener('click', () => {
      this.stopPolling();
      window.location.hash = '/home';
    });
  }

  private startPolling(): void {
    const statusMsg = document.getElementById('status-msg');
    const opponentInfo = document.getElementById('opponent-info');
    const opponentName = document.getElementById('opponent-name');

    this.pollInterval = setInterval(async () => {
      try {
        const gameData = await getGameData(AppState.gameId!);

        // Try to get opponent name
        try {
          const players = await getGamePlayers(AppState.gameId!);
          const opponent = AppState.side === 0 ? players.player2 : players.player1;
          if (opponent.id !== -1 && opponentInfo && opponentName) {
            opponentName.textContent = opponent.username;
            opponentInfo.classList.remove('hidden');
          }
        } catch {
          // Ignore errors fetching players
        }

        if (AppState.tournamentId) {
          const tournamentData = await getTournamentData(AppState.tournamentId);
          const isFinal = AppState.gameId === tournamentData.game_3_id;

          if (isFinal) {
            const game3 = tournamentData.game_3;
            if (game3.player1_id === -1 || game3.player2_id === -1) {
              if (statusMsg) {
                statusMsg.textContent = 'Waiting for other finalist...';
              }
              return;
            }
          }
        }

        if (gameData.status >= 1) {
          this.stopPolling();
          window.location.hash = '/game';
        }
      } catch {
      }
    }, 1000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  destroy(): void {
    this.stopPolling();
  }
}
