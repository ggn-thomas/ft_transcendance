export const API_BASE: string = '/api';
export const AUTH_BASE: string = `${API_BASE}/auth`;
export const PONG_BASE: string = `${API_BASE}/pong`;

export const DESIGN_W: number = 1920.0;
export const DESIGN_H: number = 1080.0;
export const PADDLE_W_N: number = 10.0 / DESIGN_W;
export const PADDLE_H_N: number = 90.0 / DESIGN_H;
export const BALL_RADIUS_N: number = 12.0 / DESIGN_H;
export const L_PAD_OFFSET_N: number = 20.0 / DESIGN_W;
export const R_PAD_OFFSET_N: number = 20.0 / DESIGN_W;

export const GAME_TICK_MS: number = 1000 / 60; // 60 FPS

export const INPUT_NONE: number = 0;
export const INPUT_DOWN: number = 1;
export const INPUT_UP: number = 2;
