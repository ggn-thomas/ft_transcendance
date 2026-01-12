import { register } from '../services/auth.service.ts';
import QRCode from 'qrcode';
import type { Page } from '../types/index.ts';

const GITHUB_CLIENT_ID = 'Ov23liEhoFoFsFDBcjvC';
const GITHUB_REDIRECT_URI = 'https://localhost:8443/oauth/callback';

export class RegisterPage implements Page {
  render(): string {
    const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email`;

    return `
      <div class="max-w-md mx-auto mt-20">
        <h1 class="text-4xl font-bold mb-8 text-center">Register</h1>

        <a href="${githubOAuthUrl}" class="btn-secondary w-full block text-center py-3 mb-6">
          <svg class="inline-block w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Register with GitHub
        </a>

        <div class="my-6 flex items-center">
          <div class="flex-1 border-t border-gray-600"></div>
          <span class="px-4 text-gray-400">or</span>
          <div class="flex-1 border-t border-gray-600"></div>
        </div>

        <form id="register-form" class="space-y-4">
          <div>
            <label class="block mb-2">Username</label>
            <input type="text" name="username" class="input-field" required />
          </div>

          <div>
            <label class="block mb-2">Email</label>
            <input type="email" name="email" class="input-field" required />
          </div>

          <div>
            <label class="block mb-2">Password</label>
            <input type="password" name="password" class="input-field" required />
          </div>

          <button type="submit" class="btn-primary w-full">Register</button>
        </form>

        <div id="qr-container" class="mt-8 hidden">
          <h2 class="text-2xl mb-4 text-center">Scan QR Code for 2FA</h2>
          <canvas id="qr-canvas" class="mx-auto"></canvas>
          <p class="mt-4 text-center text-sm">Secret: <code id="secret-text" class="bg-gray-800 px-2 py-1 rounded"></code></p>
          <button id="go-login" class="btn-primary w-full mt-4">Go to Login</button>
        </div>

        <p class="mt-4 text-center">
          Already have an account? <a href="#/login" class="text-primary hover:underline">Login</a>
        </p>
      </div>
    `;
  }

  mount(): void {
    const form = document.getElementById('register-form') as HTMLFormElement;
    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault();

      const formData = new FormData(form);
      const username = formData.get('username') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      try {
        const data = await register(username, email, password);

        const qrContainer = document.getElementById('qr-container') as HTMLDivElement;
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        const secretText = document.getElementById('secret-text') as HTMLElement;

        await QRCode.toCanvas(canvas, data._2fa.uriKey, { width: 300 });
        secretText.textContent = data._2fa.secret;

        form.classList.add('hidden');
        qrContainer.classList.remove('hidden');

        document.getElementById('go-login')!.addEventListener('click', () => {
          window.location.hash = '/login';
        });
      } catch (error) {
        alert('Registration failed: ' + (error as Error).message);
      }
    });
  }
}
