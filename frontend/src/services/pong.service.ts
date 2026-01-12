import { get, post } from './api.ts';
import { PONG_BASE } from '../utils/constants.ts';
import type { GameState, TournamentData, JoinTournamentResponse, GamePlayers } from '../types/index.ts';

interface CreateGameResponse {
  id: number;
}

interface OwnerResponse {
  owner: number;
}

interface TournamentOwnerResponse {
  id: number;
}

export async function createGame(playerId: number): Promise<number> {
  const data = await post<CreateGameResponse, { player_id: number }>(`${PONG_BASE}/create-game`, { player_id: playerId });
  return data.id;
}

export async function joinGame(gameId: number, playerId: number): Promise<void> {
  await post<void, { game_id: number; player_id: number }>(`${PONG_BASE}/join-game`, {
    game_id: gameId,
    player_id: playerId
  });
}

export async function startGame(gameId: number): Promise<void> {
  await post<void, { game_id: number }>(`${PONG_BASE}/start-game`, { game_id: gameId });
}

export async function getGameData(gameId: number): Promise<GameState> {
  const data = await get<GameState>(`${PONG_BASE}/get-data?game_id=${gameId}`);
  return data;
}

export async function postInput(gameId: number, input: number, side: number): Promise<void> {
  await post<void, { game_id: number; input: number; side: number }>(`${PONG_BASE}/post-input`, {
    game_id: gameId,
    input,
    side
  });
}

export async function getOwner(gameId: number): Promise<number> {
  const data = await get<OwnerResponse>(`${PONG_BASE}/get-owner?game_id=${gameId}`);
  return data.owner;
}

// Tournament
export async function createTournament(): Promise<string> {
  const data = await post<{ id: string }, Record<string, never>>(`${PONG_BASE}/tournament/create`, {});
  return data.id;
}

export async function joinTournament(tournamentId: string, playerId: number): Promise<JoinTournamentResponse> {
  const data = await post<JoinTournamentResponse, { tournament_id: string; player_id: number }>(`${PONG_BASE}/tournament/join`, {
    tournament_id: tournamentId,
    player_id: playerId
  });
  return data;
}

export async function startTournament(tournamentId: string | number): Promise<void> {
  await post<void, { tournament_id: string | number }>(`${PONG_BASE}/tournament/start`, { tournament_id: tournamentId });
}

export async function getTournamentData(tournamentId: string | number): Promise<TournamentData> {
  const data = await get<TournamentData>(`${PONG_BASE}/tournament/get-data?tournament_id=${tournamentId}`);
  return data;
}

export async function getTournamentOwner(tournamentId: string | number): Promise<number> {
  const data = await get<TournamentOwnerResponse>(`${PONG_BASE}/tournament/get-owner?tournament_id=${tournamentId}`);
  return data.id;
}

export async function getGamePlayers(gameId: number): Promise<GamePlayers> {
  const data = await get<GamePlayers>(`${PONG_BASE}/get-players?game_id=${gameId}`);
  return data;
}
