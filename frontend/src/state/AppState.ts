import { getFromStorage, saveToStorage, removeFromStorage } from '../utils/storage.ts';
import { jwtDecode } from 'jwt-decode';
import type { JwtPayload } from '../types/index.ts';

class AppStateClass {
  jwt: string | null;
  userId: number | null;
  username: string | null;
  gameId: number | null;
  side: number | null;
  tournamentId: number | string | null;

  constructor() {
    this.jwt = getFromStorage<string>('jwt');
    this.userId = null;
    this.username = null;
    this.gameId = null;
    this.side = null;
    this.tournamentId = null;

    if (this.jwt) {
      try {
        const decoded = jwtDecode<JwtPayload>(this.jwt);
        this.userId = decoded.id;
        this.username = decoded.username;
      } catch {
        this.clearAuth();
      }
    }
  }

  setAuth(jwt: string, userId: number, username: string): void {
    this.jwt = jwt;
    this.userId = userId;
    this.username = username;
    saveToStorage('jwt', jwt);
  }

  clearAuth(): void {
    this.jwt = null;
    this.userId = null;
    this.username = null;
    removeFromStorage('jwt');
  }

  setGame(gameId: number, side: number): void {
    this.gameId = gameId;
    this.side = side;
  }

  setTournament(tournamentId: number | string): void {
    this.tournamentId = tournamentId;
  }

  isAuthenticated(): boolean {
    return !!this.jwt;
  }
}

export const AppState = new AppStateClass();
