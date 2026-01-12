// API Types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

// Auth Types
export interface JwtPayload {
  id: number;
  username: string;
  email: string;
  exp?: number;
  iat?: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  _2fa: {
    uriKey: string;
    secret: string;
  };
}

export interface LoginResponse {
  jtoken: string;
}

export interface SecretResponse {
  uriKey: string;
  secret: string;
}

// Game Types
export interface GameState {
  status: number;
  score: number;
  lpos: number;
  rpos: number;
  bposx: number;
  bposy: number;
  lscore?: number;
  rscore?: number;
}

// Tournament Types
export interface TournamentData {
  id: number;
  players_id: number[];
  players_usernames: string[];
  game_1: GameInfo;
  game_2: GameInfo;
  game_3: GameInfo;
  game_3_id: number;
  game_3_lside: number;
  status: number;
  winner: number;
}

export interface GameInfo {
  id: number;
  player1_id: number;
  player2_id: number;
  status: number;
}

export interface JoinTournamentResponse {
  id: number;
  side: number;
}

export interface GamePlayers {
  player1: { id: number; username: string };
  player2: { id: number; username: string };
}

// Page Interface
export interface Page {
  render(): string;
  mount?(): void | Promise<void>;
  destroy?(): void;
}

// Router Types
export type PageConstructor = new () => Page;
