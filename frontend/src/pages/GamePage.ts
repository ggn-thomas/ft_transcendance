import { AppState } from '../state/AppState.ts';
import { getGameData, postInput, getTournamentData, getGamePlayers } from '../services/pong.service.ts';
import {
  DESIGN_W, DESIGN_H, PADDLE_W_N, PADDLE_H_N, BALL_RADIUS_N,
  L_PAD_OFFSET_N, R_PAD_OFFSET_N, GAME_TICK_MS,
  INPUT_NONE, INPUT_DOWN, INPUT_UP
} from '../utils/constants.ts';
import { decodeScore } from '../utils/score.ts';
import type { Page, GameState } from '../types/index.ts';

export class GamePage implements Page {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private gameLoop: ReturnType<typeof setTimeout> | null = null;
  private currentInput: number = INPUT_NONE;
  private gameState: GameState = {
    status: 0,
    score: 0,
    lpos: 0.5,
    rpos: 0.5,
    bposx: 0.5,
    bposy: 0.5
  };
  private keyDownHandler: ((e: KeyboardEvent) => void) | null = null;
  private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;

  render(): string {
    return `
      <div class="flex flex-col items-center justify-center min-h-screen">
        <div id="players" class="text-xl mb-2">
          <span id="player-left" class="text-blue-400"></span>
          <span class="text-gray-400"> vs </span>
          <span id="player-right" class="text-red-400"></span>
        </div>
        <div id="score" class="text-2xl mb-4">Score: 0 - 0</div>
        <canvas id="pong-canvas" class="border-2 border-white" width="1920" height="1080"></canvas>
        <div class="mt-4 text-sm text-gray-400">Use W/S or Arrow Up/Down to move</div>
      </div>
    `;
  }

  async mount(): Promise<void> {
    this.canvas = document.getElementById('pong-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.keyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.keyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);

    // Load player names
    try {
      const players = await getGamePlayers(AppState.gameId!);
      document.getElementById('player-left')!.textContent = players.player1.username;
      document.getElementById('player-right')!.textContent = players.player2.username;
    } catch {
      // Fallback if players not available
    }

    this.startGameLoop();
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;

    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.7;
    const ratio = DESIGN_W / DESIGN_H;

    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
      this.currentInput = INPUT_UP;
      e.preventDefault();
    } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
      this.currentInput = INPUT_DOWN;
      e.preventDefault();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      this.currentInput = INPUT_NONE;
      e.preventDefault();
    }
  }

  private async startGameLoop(): Promise<void> {
    const tick = async (): Promise<void> => {
      try {
        const data = await getGameData(AppState.gameId!);
        this.gameState = data;

        await postInput(AppState.gameId!, this.currentInput, AppState.side!);

        if (data.status === 2) {
          await this.handleGameEnd();
          return;
        }

        this.render2D();

        const { myScore, opponentScore } = decodeScore(data.score, AppState.side!);
        document.getElementById('score')!.textContent = `Score: ${myScore} - ${opponentScore}`;

        this.gameLoop = setTimeout(tick, GAME_TICK_MS);
      } catch (error) {
        console.error('Game loop error:', error);
        if (this.gameLoop) clearTimeout(this.gameLoop);
        alert('Game error: ' + (error as Error).message);
        window.location.hash = '/home';
      }
    };

    tick();
  }

  private render2D(): void {
    if (!this.canvas || !this.ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.fillStyle = '#fff';
    const paddleW = PADDLE_W_N * width;
    const paddleH = PADDLE_H_N * height;

    const leftX = L_PAD_OFFSET_N * width;
    const rightX = width - R_PAD_OFFSET_N * width;
    const leftY = this.gameState.lpos * height;
    const rightY = this.gameState.rpos * height;

    this.ctx.fillRect(leftX, leftY - paddleH / 2, paddleW, paddleH);
    this.ctx.fillRect(rightX - paddleW, rightY - paddleH / 2, paddleW, paddleH);

    const ballR = BALL_RADIUS_N * height;
    const ballX = this.gameState.bposx * width;
    const ballY = this.gameState.bposy * height;

    this.ctx.beginPath();
    this.ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private async handleGameEnd(): Promise<void> {
    const { myScore, opponentScore } = decodeScore(this.gameState.score, AppState.side!);
    const won = myScore > opponentScore;

    if (AppState.tournamentId) {
      try {
        const tournamentData = await getTournamentData(AppState.tournamentId);

        if (tournamentData.status === 1 && won) {
          // Wait a bit for backend to update game_3_lside
          await new Promise(resolve => setTimeout(resolve, 500));
          const updatedData = await getTournamentData(AppState.tournamentId);

          const side = updatedData.game_3_lside === AppState.userId ? 0 : 1;
          AppState.setGame(updatedData.game_3_id, side);
          alert('You won! Waiting for the other match to finish...');
          window.location.hash = '/lobby';
        } else if (tournamentData.status === 2) {
          const finalWinner = tournamentData.winner === AppState.userId;
          alert(finalWinner
            ? 'You won the tournament!'
            : `Tournament over. Final score: ${myScore} - ${opponentScore}`);
          window.location.hash = '/home';
        } else {
          alert('You were eliminated from the tournament.');
          window.location.hash = '/home';
        }
      } catch (error) {
        console.error('Tournament error:', error);
        alert('Error checking tournament status');
        window.location.hash = '/home';
      }
    } else {
      // Simple game (no tournament)
      alert(won ? 'You won!' : `You lost. Final score: ${myScore} - ${opponentScore}`);
      window.location.hash = '/home';
    }
  }

  destroy(): void {
    if (this.gameLoop) {
      clearTimeout(this.gameLoop);
    }
    if (this.keyDownHandler) {
      window.removeEventListener('keydown', this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      window.removeEventListener('keyup', this.keyUpHandler);
    }
  }
}
