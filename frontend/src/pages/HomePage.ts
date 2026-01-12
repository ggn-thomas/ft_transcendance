import { AppState } from '../state/AppState.ts';
import { createGame, joinGame, createTournament, joinTournament } from '../services/pong.service.ts';
import type { Page } from '../types/index.ts';

export class HomePage implements Page {
  render(): string {
    return `
      <div class="max-w-2xl mx-auto mt-20">
        <h1 class="text-4xl font-bold mb-8 text-center">Welcome ${AppState.username}!</h1>

        <div class="grid grid-cols-2 gap-4 mb-8">
          <button id="create-game" class="btn-primary py-8 text-xl">Create Game</button>
          <button id="join-game" class="btn-primary py-8 text-xl">Join Game</button>
          <button id="create-tournament" class="btn-primary py-8 text-xl">Create Tournament</button>
          <button id="join-tournament" class="btn-primary py-8 text-xl">Join Tournament</button>
        </div>

        <div id="join-input" class="hidden space-y-4">
          <input type="number" id="game-id-input" class="input-field" placeholder="Game ID" />
          <button id="submit-join" class="btn-primary w-full">Join</button>
          <button id="cancel-join" class="text-gray-400 hover:text-white w-full">Cancel</button>
        </div>

        <div id="tournament-input" class="hidden space-y-4">
          <input type="number" id="tournament-id-input" class="input-field" placeholder="Tournament ID" />
          <button id="submit-join-tournament" class="btn-primary w-full">Join</button>
          <button id="cancel-tournament" class="text-gray-400 hover:text-white w-full">Cancel</button>
        </div>

        <button id="logout" class="mt-8 text-gray-400 hover:text-white block mx-auto">Logout</button>
      </div>
    `;
  }

  mount(): void {
    document.getElementById('create-game')!.addEventListener('click', async () => {
      try {
        const gameId = await createGame(AppState.userId!);
        AppState.setGame(gameId, 0);
        window.location.hash = '/lobby';
      } catch (error) {
        alert('Failed to create game: ' + (error as Error).message);
      }
    });

    document.getElementById('join-game')!.addEventListener('click', () => {
      document.getElementById('join-input')!.classList.toggle('hidden');
      document.getElementById('tournament-input')!.classList.add('hidden');
    });

    document.getElementById('cancel-join')!.addEventListener('click', () => {
      document.getElementById('join-input')!.classList.add('hidden');
    });

    document.getElementById('submit-join')!.addEventListener('click', async () => {
      const gameId = parseInt((document.getElementById('game-id-input') as HTMLInputElement).value);
      if (!gameId) {
        alert('Please enter a valid game ID');
        return;
      }
      try {
        await joinGame(gameId, AppState.userId!);
        AppState.setGame(gameId, 1);
        window.location.hash = '/game';
      } catch (error) {
        alert('Failed to join game: ' + (error as Error).message);
      }
    });

    document.getElementById('create-tournament')!.addEventListener('click', async () => {
      try {
        const tournamentId = await createTournament();
        alert(`Tournament created! ID: ${tournamentId}\nShare this ID with 3 other players.`);
        const data = await joinTournament(tournamentId, AppState.userId!);
        AppState.setGame(data.id, data.side);
        AppState.setTournament(tournamentId);
        window.location.hash = '/lobby';
      } catch (error) {
        alert('Failed to create tournament: ' + (error as Error).message);
      }
    });

    document.getElementById('join-tournament')!.addEventListener('click', () => {
      document.getElementById('tournament-input')!.classList.toggle('hidden');
      document.getElementById('join-input')!.classList.add('hidden');
    });

    document.getElementById('cancel-tournament')!.addEventListener('click', () => {
      document.getElementById('tournament-input')!.classList.add('hidden');
    });

    document.getElementById('submit-join-tournament')!.addEventListener('click', async () => {
      const tournamentId = (document.getElementById('tournament-id-input') as HTMLInputElement).value;
      if (!tournamentId) {
        alert('Please enter a valid tournament ID');
        return;
      }
      try {
        const data = await joinTournament(tournamentId, AppState.userId!);
        AppState.setGame(data.id, data.side);
        AppState.setTournament(tournamentId);
        window.location.hash = '/lobby';
      } catch (error) {
        alert('Failed to join tournament: ' + (error as Error).message);
      }
    });

    document.getElementById('logout')!.addEventListener('click', () => {
      AppState.clearAuth();
      window.location.hash = '/login';
    });
  }
}
