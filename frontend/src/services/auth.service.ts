import { post } from './api.ts';
import { AUTH_BASE } from '../utils/constants.ts';
import { AppState } from '../state/AppState.ts';
import { jwtDecode } from 'jwt-decode';
import type { RegisterResponse, LoginResponse, SecretResponse, JwtPayload } from '../types/index.ts';

interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface LoginParams {
  username: string;
  password: string;
  token: string;
}

interface SecretParams {
  username: string;
  password: string;
}

export async function register(username: string, email: string, password: string): Promise<RegisterResponse> {
  const data = await post<RegisterResponse, RegisterParams>(`${AUTH_BASE}/register`, {
    username,
    email,
    password
  });

  return data;
}

export async function login(username: string, password: string, token: string): Promise<LoginResponse> {
  const data = await post<LoginResponse, LoginParams>(`${AUTH_BASE}/login`, {
    username,
    password,
    token
  });

  const decoded = jwtDecode<JwtPayload>(data.jtoken);
  AppState.setAuth(data.jtoken, decoded.id, decoded.username);

  return data;
}

export async function getSecret(username: string, password: string): Promise<SecretResponse> {
  const data = await post<SecretResponse, SecretParams>(`${AUTH_BASE}/get-secret`, {
    username,
    password
  });

  return data;
}
